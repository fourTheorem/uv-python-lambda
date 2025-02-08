#!/bin/bash

# /uvbuild is the working directory for things like cache and staged outputs
# /src is the project root, where the top-level pyproject.toml/uv.lock exists

set -euo pipefail

export LOCK_FILE=/uvbuild/uv-python-lambda.lock

rm -f $LOCK_FILE

# Changing the default UV_LINK_MODE silences warnings about not being able to use hard links
# since the cache and sync target may be on separate file systems.
export UV_LINK_MODE=copy
mkdir -p /src/uvbuild/uvcache
mkdir -p /root/.cache
ln -sf /src/uvbuild/uvcache /root/.cache/uv

# Set up overlay filesystem
#mkdir -p /src/uvbuild/overlay/upper /src/uvbuild/overlay/work /src/uvbuild/overlay/merged
mkdir -p /tmp/overlay
mount -t tmpfs tmpfs /tmp/overlay
mkdir -p /tmp/overlay/{upper,work,merged}
mount -t overlay overlay -o rw,lowerdir=/src,upperdir=/tmp/overlay/upper,workdir=/tmp/overlay/work /tmp/overlay/merged

echo Overlay has been set up

cd /tmp/overlay/merged
rm -rf .venv  # Remove (hide) any host system venv from the overlay filesystem

uv venv --python-preference=only-system
uv sync --compile-bytecode --no-dev --frozen --no-editable

touch $LOCK_FILE

echo Builder container is ready and waiting
while true; do
    sleep 1
done