#!/bin/bash
set -euo pipefail
trap 'echo "$NAME: Failed at line $LINENO" >&2' ERR
NAME=${0##*/}

# This script runs inside a reusable builder container and performs the
# export/install step for one Lambda asset as part of a `uv-python-lambda` function construct.
#
# 1. Reuses a warm uv cache mounted at /uvbuild 
# 2. Separates third-party dependency install from workspace packaging
# 3. Mounts /src read-only. Temporary writable workspaces are
#    created only when uv or user hooks need them
# 4. Serialises export operations per builder container to avoid
#    nondeterministic contention
#
# - Warm-cache package installs are the main fast path. They benefit from
#   cache reuse across functions and synth runs in the same process.
# - Hardlink mode is preferred because $HOME/.cache/uv and /uvbuild live on the
#   same mounted filesystem. Hardlinks avoid the extra copy work and file-handle
#   churn that `copy` mode caused on large dependency trees.
# - Workspace package handling copies only the local package directories that
#   need building instead of cloning the whole repository, which reduces disk
#   I/O and temp directory size.

export LOCK_FILE=/uvbuild/uv-python-lambda.lock
export UV_LINK_MODE=hardlink
export UV_NO_INSTALLER_METADATA=1
export UV_PYTHON_LAMBDA_NOFILE_LIMIT="${UV_PYTHON_LAMBDA_NOFILE_LIMIT:-1048576}"
export HOME=/tmp/uv-python-lambda-home

# Raise the per-process FD limit inside the container. The builder
# container itself is already started with a large nofile ulimit, this mirrors
# that limit in the shell process used for export.sh and any uv subprocesses it
# launches. This is defensive against large dependency trees and workspace
# builds.
ulimit -n "$UV_PYTHON_LAMBDA_NOFILE_LIMIT"

print_help() {
	echo "Usage: $NAME --output <output_dir> [--output-zip <output_zip>] [--package <package_name>] [--exclude <glob>] [--before-hooks <base64_json>] [--after-hooks <base64_json>]" >&2
	exit 1
}

getopt -T &>/dev/null && rc=$? || rc=$?
if ((rc != 4))
then
	echo "This script requires GNU getopt" >&2
	exit 1
fi

opts=$(getopt --name "$NAME" --options hp:o:e:vd --longoptions help,package:,output:,output-zip:,exclude:,before-hooks:,after-hooks:,verbose,debug -- "$@") || print_help
eval set -- "$opts"

declare package="" output="" output_zip="" before_hooks="" after_hooks="" verbose=0 debug=0
declare -a excludes=()
while (($#))
do
	case $1 in
		-h|--help)         print_help;;
		-p|--package)      package=$2; shift;;
		-o|--output)       output=$2; shift;;
		--output-zip)      output_zip=$2; shift;;
		-e|--exclude)      excludes+=("$2"); shift;;
		--before-hooks)    before_hooks=$2; shift;;
		--after-hooks)     after_hooks=$2; shift;;
		-v|--verbose)      ((++verbose));;
		-d|--debug)        debug=1;;
		--)                shift; break;;
		*)                 false;;
	esac
	shift
done

if [[ -z "${output}" ]]; then
	echo "ERROR: No output (directory) specified" >&2
	print_help
fi

# entrypoint.sh creates this lock only after the builder has finished initial
# cache setup and is ready to service export requests. Waiting here lets the
# caller reuse a warm builder without racing the container startup path.
while [[ ! -f "$LOCK_FILE" ]]; do
	sleep 1
done

output_dir=$(realpath -m "$output")
output_zip_path=""
if [[ -n "$output_zip" ]]; then
	output_zip_path=$(realpath -m "$output_zip")
fi
mkdir -p "$(dirname "$output_dir")"
if [[ -n "$output_zip_path" ]]; then
	mkdir -p "$(dirname "$output_zip_path")"
fi

# Lock the output directory itself so two requests never write to the same asset
# path concurrently. A single Lambda asset should only be produced once at a
# time anyway.
lock_dir="${output_dir}.lock"
while ! mkdir "$lock_dir" 2>/dev/null; do
	sleep 0.1
done

# Lock the entire builder export path. One builder container is intentionally
# shared across compatible functions, but overlapping uv installs against the
# same cache and mounted build directory can produce large spikes in file usage.
# Serializing here keeps the warm-builder optimisation while avoiding contention.
builder_lock_dir=/uvbuild/.uv-python-lambda-export.lock
while ! mkdir "$builder_lock_dir" 2>/dev/null; do
	sleep 0.1
done

# These hold temp directories created later in the script. Keeping them in
# globals lets the EXIT trap clean them up from any failure point.
temp_work_root=""
local_workspace_root=""
cleanup() {
	rm -rf "$local_workspace_root" "$temp_work_root" "$lock_dir" "$builder_lock_dir"
}
trap cleanup EXIT

# Always rebuild the asset output from scratch. This guarantees the staged asset
# contains only files for the current function build and avoids stale artifacts
# from previous bundles.
rm -rf "$output_dir"
mkdir -p "$output_dir"

# Command hooks are base64-encoded JSON arrays so the caller can pass arbitrary
# shell commands without fighting nested quoting rules across TypeScript, Docker,
# and Bash. Each hook is executed as an independent `bash -lc` command.
run_hooks() {
	local encoded=$1

	if [[ -z "$encoded" ]]; then
		return
	fi

	while IFS= read -r -d '' command; do
		bash -lc "$command"
	done < <(
		python - "$encoded" <<'PY'
import base64
import json
import sys

for command in json.loads(base64.b64decode(sys.argv[1]).decode("utf-8")):
    sys.stdout.write(command)
    sys.stdout.write("\0")
PY
	)
}

# Install local workspace members into the asset.
#
# Why copy into a temp workspace first?
# - The source tree is mounted read-only at /src.
# - Build backends such as hatchling may create metadata directories or other
#   transient files while building wheels.
# - Copying only the referenced workspace packages, rather than the full repo,
#   keeps this writable workspace small and fast to populate.
#
# Why use `uv pip install` here instead of copying Python sources directly?
# - Installing the local package respects package metadata and layout.
# - It ensures dependencies between workspace members are resolved the same way
#   they would be in a real install.
# - It avoids editable-install artifacts and preserves the "what gets imported"
#   semantics of an installed package.
copy_local_workspace_sources() {
	local source_root=$1
	local workspace_paths_file=$2
	local local_paths=()

	# The requirements-local file contains only "./member" style entries extracted
	# from uv export output. Preserve order and skip blank lines.
	while IFS= read -r relative_path; do
		[[ -z "$relative_path" ]] && continue
		local_paths+=("$relative_path")
	done < "$workspace_paths_file"

	if ((${#local_paths[@]} == 0)); then
		return
	fi

	# mktemp's XXXXXX suffix is a template placeholder; mktemp replaces it with a
	# unique random suffix. This gives us a race-safe writable workspace path.
	local_workspace_root=$(mktemp -d /tmp/uv-python-lambda-workspace.XXXXXX)

	# Copy only the package directories uv identified as local workspace members.
	# This is much cheaper than cloning the whole project tree for every function.
	for relative_path in "${local_paths[@]}"; do
		local -a rsync_args=('-a')
		for exclude in "${excludes[@]}"; do
			rsync_args+=("--exclude=$exclude")
		done
		mkdir -p "$local_workspace_root/$(dirname "$relative_path")"
		rsync "${rsync_args[@]}" "$source_root/${relative_path#./}/" "$local_workspace_root/${relative_path#./}/"
	done

	(
		cd "$local_workspace_root"
		# Install workspace packages into the asset using the system Python from
		# the Lambda build image. Hardlink mode minimises file copies from the uv
		# cache into the target when the filesystem allows it
		uv pip install \
			--target "$output_dir" \
			--python-preference only-system \
			--compile-bytecode \
			--link-mode=hardlink \
			--no-sources \
			"${local_paths[@]}"
	)

	rm -rf "$local_workspace_root"
	local_workspace_root=""
}

# Copy raw project files into the asset. This is only used for non-workspace
# apps or when hooks require a writable project copy. Excludes are applied here
# so asset contents and copy cost both stay bounded.
copy_project_sources() {
	local project_root=$1
	local destination=$2
	local -a rsync_args=('-a')

	for exclude in "${excludes[@]}"; do
		rsync_args+=("--exclude=$exclude")
	done

	rsync "${rsync_args[@]}" "$project_root/" "$destination/"
}

# Execute the two-phase export/install flow from a given project root.
#
# Phase 1: install third-party dependencies only
# - `uv export --no-emit-workspace` strips local workspace members from the
#   requirements file, leaving only third-party dependencies.
# - Installing these first gives us the main performance win: uv can resolve,
#   download, and cache external packages once, then reuse them quickly.
#
# Phase 2: add first-party code
# - For workspace packages, install the local members separately from a writable
#   temp workspace.
# - For a simple non-workspace app, copying the project sources directly is
#   cheaper than building/installing the app as a package.
run_export_from_directory() {
	local project_root=$1
	local package_args=()

	if [[ -n "$package" ]]; then
		package_args+=(--package "$package")
	fi

	(
		cd "$project_root"
		# Third-party dependencies only
		uv export "${package_args[@]}" --frozen --no-emit-workspace --no-dev --no-editable -o /tmp/requirements-third.txt
		uv pip install \
			-r /tmp/requirements-third.txt \
			--target "$output_dir" \
			--python-preference only-system \
			--compile-bytecode \
			--link-mode=hardlink \
			--no-sources

		if [[ -n "$package" ]]; then
			# Export again with workspace members included, then filter the `./member`
			# entries out into a separate file. This lets us keep local packages on a
			# dedicated install path without polluting the third-party requirements.
			uv export "${package_args[@]}" --frozen --no-dev --no-editable -o /tmp/requirements-all.txt
			python - <<'PY' > /tmp/requirements-local.txt
from pathlib import Path

for line in Path("/tmp/requirements-all.txt").read_text().splitlines():
    if line.startswith("./"):
        print(line.strip())
PY
			copy_local_workspace_sources "$project_root" /tmp/requirements-local.txt
		else
			copy_project_sources "$project_root" "$output_dir"
		fi
	)
}

# By default, work directly from the read-only source mount for the fastest
# path. If hooks are configured we first create a writable project copy because
# user-defined commands may generate files, rewrite sources, or otherwise expect
# normal write access.
working_root=/src
temp_work_root=""

if [[ -n "$before_hooks" || -n "$after_hooks" ]]; then
	temp_work_root=$(mktemp -d /tmp/uv-python-lambda-project.XXXXXX)
	copy_project_sources /src "$temp_work_root"
	working_root="$temp_work_root"
fi

# Hook execution is intentionally wrapped around the export flow:
# - before hooks can prepare generated sources or other inputs
# - after hooks can inspect or mutate the finished staged asset
cd "$working_root"
run_hooks "$before_hooks"
run_export_from_directory "$working_root"
run_hooks "$after_hooks"

if [[ -n "$output_zip_path" ]]; then
	python - "$output_dir" "$output_zip_path" <<'PY'
from pathlib import Path
import sys
import zipfile

root = Path(sys.argv[1])
destination = Path(sys.argv[2])
temporary = destination.with_suffix(destination.suffix + ".tmp")

temporary.unlink(missing_ok=True)
destination.unlink(missing_ok=True)

with zipfile.ZipFile(
    temporary,
    mode="w",
    compression=zipfile.ZIP_DEFLATED,
) as archive:
    for path in sorted(root.rglob("*")):
        if path.is_file():
            archive.write(path, path.relative_to(root).as_posix())

temporary.replace(destination)
PY
fi

# Historical cleanup: older iterations wrote a file lock into the asset dir
rm -f "$output_dir/.lock"
