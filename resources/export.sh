#!/bin/bash
set -euo pipefail
trap 'echo "$NAME: Failed at line $LINENO" >&2' ERR
NAME=${0##*/}

export LOCK_FILE=/uvbuild/uv-python-lambda.lock
export UV_LINK_MODE=copy
export UV_NO_INSTALLER_METADATA=1

print_help() {
	echo "Usage: $NAME --output <output_dir> [--package <package_name>] [--exclude <glob>] [--before-hooks <base64_json>] [--after-hooks <base64_json>]" >&2
	exit 1
}

getopt -T &>/dev/null && rc=$? || rc=$?
if ((rc != 4))
then
	echo "This script requires GNU getopt" >&2
	exit 1
fi

opts=$(getopt --name "$NAME" --options hp:o:e:vd --longoptions help,package:,output:,exclude:,before-hooks:,after-hooks:,verbose,debug -- "$@") || print_help
eval set -- "$opts"

declare package="" output="" before_hooks="" after_hooks="" verbose=0 debug=0
declare -a excludes=()
while (($#))
do
	case $1 in
		-h|--help)         print_help;;
		-p|--package)      package=$2; shift;;
		-o|--output)       output=$2; shift;;
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

while [[ ! -f "$LOCK_FILE" ]]; do
	sleep 1
done

output_dir=$(realpath -m "$output")
mkdir -p "$(dirname "$output_dir")"

lock_dir="${output_dir}.lock"
while ! mkdir "$lock_dir" 2>/dev/null; do
	sleep 0.1
done
trap 'rm -rf "$lock_dir"' EXIT

rm -rf "$output_dir"
mkdir -p "$output_dir"

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

copy_local_workspace_sources() {
	local source_root=$1
	local workspace_paths_file=$2
	local local_root
	local local_paths=()

	while IFS= read -r relative_path; do
		[[ -z "$relative_path" ]] && continue
		local_paths+=("$relative_path")
	done < "$workspace_paths_file"

	if ((${#local_paths[@]} == 0)); then
		return
	fi

	local_root=$(mktemp -d /tmp/uv-python-lambda-workspace.XXXXXX)
	trap 'rm -rf "$local_root"; rm -rf "$lock_dir"' EXIT

	for relative_path in "${local_paths[@]}"; do
		mkdir -p "$local_root/$(dirname "$relative_path")"
		rsync -a "$source_root/${relative_path#./}/" "$local_root/${relative_path#./}/"
	done

	(
		cd "$local_root"
		uv pip install \
			--target "$output_dir" \
			--python-preference only-system \
			--compile-bytecode \
			--link-mode=copy \
			--no-sources \
			"${local_paths[@]}"
	)

	rm -rf "$local_root"
	trap 'rm -rf "$lock_dir"' EXIT
}

copy_project_sources() {
	local project_root=$1
	local destination=$2
	local -a rsync_args=('-a')

	for exclude in "${excludes[@]}"; do
		rsync_args+=("--exclude=$exclude")
	done

	rsync "${rsync_args[@]}" "$project_root/" "$destination/"
}

run_export_from_directory() {
	local project_root=$1
	local package_args=()

	if [[ -n "$package" ]]; then
		package_args+=(--package "$package")
	fi

	(
		cd "$project_root"
		uv export "${package_args[@]}" --frozen --no-emit-workspace --no-dev --no-editable -o /tmp/requirements-third.txt
		uv pip install \
			-r /tmp/requirements-third.txt \
			--target "$output_dir" \
			--python-preference only-system \
			--compile-bytecode \
			--link-mode=copy \
			--no-sources

		if [[ -n "$package" ]]; then
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

working_root=/src
temp_work_root=""

if [[ -n "$before_hooks" || -n "$after_hooks" ]]; then
	temp_work_root=$(mktemp -d /tmp/uv-python-lambda-project.XXXXXX)
	trap 'rm -rf "$temp_work_root"; rm -rf "$lock_dir"' EXIT
	copy_project_sources /src "$temp_work_root"
	working_root="$temp_work_root"
fi

cd "$working_root"
run_hooks "$before_hooks"
run_export_from_directory "$working_root"
run_hooks "$after_hooks"

rm -f "$output_dir/.lock"
