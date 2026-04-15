#!/bin/bash

# /uvbuild is the working directory for caches and staged outputs.
# /src is the project root mounted from the host.

set -euo pipefail

export LOCK_FILE=/uvbuild/uv-python-lambda.lock
export UV_LINK_MODE=copy
export UV_NO_INSTALLER_METADATA=1

rm -f "$LOCK_FILE"

mkdir -p /uvbuild/uvcache
mkdir -p /root/.cache
ln -sf /uvbuild/uvcache /root/.cache/uv

touch "$LOCK_FILE"

echo Builder container is ready and waiting

while true; do
    sleep 1
done
