# Use for the container image that uv-python-lambda will use to bundle one or more Lambda functions
# from a uv project (including those with one or more workspaces).

ARG UV_VERSION=0.5.27
ARG BUNDLING_IMAGE=public.ecr.aws/sam/build-python3.12:latest-arm64

FROM ghcr.io/astral-sh/uv:${UV_VERSION} AS uv
FROM ${BUNDLING_IMAGE}

# The default builder scripts need:
# - `bash` because `entrypoint.sh` and `export.sh` are bash scripts
# - `rsync` for efficient source/workspace staging
# - GNU `getopt` for argument parsing in `export.sh`
# - a `realpath` implementation that supports `-m`
#
# Many base images already provide some or all of these. Install only what is
# missing so RPM-based images such as Amazon Linux 2023 can keep using
# `coreutils-single` without conflicting with the full `coreutils` package.
RUN set -eu; \
    packages=''; \
    if ! command -v bash >/dev/null 2>&1; then \
      packages="$packages bash"; \
    fi; \
    if ! command -v rsync >/dev/null 2>&1; then \
      packages="$packages rsync"; \
    fi; \
    if ! getopt -T >/dev/null 2>&1; then \
      packages="$packages util-linux"; \
    fi; \
    if ! realpath -m / >/dev/null 2>&1; then \
      packages="$packages coreutils"; \
    fi; \
    if [ -z "$packages" ]; then \
      exit 0; \
    elif command -v apt-get >/dev/null 2>&1; then \
      apt-get update && \
      apt-get install -y --no-install-recommends $packages && \
      rm -rf /var/lib/apt/lists/*; \
    elif command -v dnf >/dev/null 2>&1; then \
      dnf install -y $packages && \
      dnf clean all; \
    elif command -v yum >/dev/null 2>&1; then \
      yum install -y $packages && \
      yum clean all; \
    elif command -v apk >/dev/null 2>&1; then \
      apk add --no-cache $packages; \
    else \
      echo "Unsupported base image: install bash, rsync, util-linux, and any package providing 'realpath -m' in the custom BUNDLING_IMAGE" >&2; \
      exit 1; \
    fi

COPY --from=uv /uv /uvx /bin/
COPY *.sh /opt/uv-python-lambda/
RUN chmod +x /opt/uv-python-lambda/*.sh
WORKDIR /opt/uv-python-lambda
ENTRYPOINT [ "/opt/uv-python-lambda/entrypoint.sh" ]
