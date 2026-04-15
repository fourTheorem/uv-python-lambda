#!/bin/bash

# /uvbuild is the working directory for caches and staged outputs.
# /src is the project root mounted from the host.

set -euo pipefail

export LOCK_FILE=/uvbuild/uv-python-lambda.lock
export UV_LINK_MODE=hardlink
export UV_NO_INSTALLER_METADATA=1
export UV_PYTHON_LAMBDA_NOFILE_LIMIT="${UV_PYTHON_LAMBDA_NOFILE_LIMIT:-1048576}"

ulimit -n "$UV_PYTHON_LAMBDA_NOFILE_LIMIT"

rm -f "$LOCK_FILE"

mkdir -p /uvbuild/uvcache
mkdir -p /root/.cache
ln -sf /uvbuild/uvcache /root/.cache/uv

touch "$LOCK_FILE"

echo Builder container is ready and waiting

while true; do
    sleep 1
done
