#!/bin/bash
set -eu
trap 'echo "$NAME: Failed at line $LINENO" >&2' ERR
NAME=${0##*/}

export LOCK_FILE=/uvbuild/uv-python-lambda.lock

print_help() {
	echo "Usage: $NAME --package <package_name>" >&2
	exit 1
}

getopt -T &>/dev/null && rc=$? || rc=$?
if ((rc != 4))
then
	echo "This script requires GNU getopt" >&2
	exit 1
fi

opts=$(getopt --name "$NAME" --options hp:o:vd --longoptions help,package:,output:,verbose,debug -- "$@") || print_help
eval set -- "$opts"

declare package="" output="" verbose=0 debug=0
while (($#))
do
	case $1 in
		-h|--help)    print_help;;
		-p|--package) package=$2; shift;;
		-o|--output)  output=$2; shift;;
		-v|--verbose) ((++verbose));;
		-d|--debug)   debug=1;;
		--)           shift; break;;
		# Without "set -e" + ERR trap, replace "false" with an error message and exit.
		*)            false  # Should not happen under normal conditions
	esac
	shift
done

${package+echo "Exporting package: '$package'"}
${output+echo "Exporting output: '$output'"}

# Wait for lock file to exist
while [ ! -f $LOCK_FILE ]; do
	echo "Waiting for lock file to exist"
	sleep 1
done

#for i in verbose debug
#do
#	echo "${i} value is ${!i}"
#done

# Additional arguments
#if (($#))
#then
#	echo "$# arguments:"
#	printf "  %q\n" "$@"
#else
#	echo "No arguments"
#fi

if [ ! -n "${package}" ]; then
    echo "ERROR: No package specified" >&2
    print_help
fi

if [ ! -n "${output}" ]; then
    echo "ERROR: No output (directory) specified" >&2
    print_help
fi

# Changing the default UV_LINK_MODE silences warnings about not being able to
# use hard links since the cache and sync target may be on separate file systems.
export UV_LINK_MODE=copy

WORK_DIR=/tmp/overlay/merged
cd ${WORK_DIR}

export reqsFile=${WORK_DIR}/requirements-${package}.txt
export outputDir=${output}
uv sync --python-preference=only-system --compile-bytecode --no-dev --frozen --no-editable
uv export --package "${package}" --no-dev --frozen --no-editable --no-sources > "${reqsFile}"

# --no-sources installs workspace packages properly, not just providing a .pth file
uv pip install -r "${reqsFile}" --target "${outputDir}" --compile-bytecode --link-mode=copy --exact --no-sources