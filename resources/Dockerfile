# Use for the container image that uv-python-lambda will use to bundle one or more Lambda functions
# from a uv project (including those with one or more workspaces).

ARG UV_VERSION=0.5.27
ARG BUNDLING_IMAGE=public.ecr.aws/sam/build-python3.12:latest-arm64

FROM ghcr.io/astral-sh/uv:${UV_VERSION} AS uv
FROM ${BUNDLING_IMAGE}

# The default builder scripts depend on a few basic Unix tools that are present
# in the SAM build images but may be missing from slimmer custom base images
# such as `python:3.12-slim`.
# - `bash` is required because `entrypoint.sh` and `export.sh` are bash scripts.
# - `coreutils` / `util-linux` provide commands used by the scripts such as
#   `realpath`, `mktemp`, and `flock`-adjacent utilities across distros.
# - `rsync` is used to stage workspace and source files efficiently.
#
# We detect the distro package manager here so `BUNDLING_IMAGE` can point at a
# broader range of Debian, RPM, or Alpine-based Python images without requiring
# users to maintain a separate custom builder image just to install these tools.
RUN if command -v apt-get >/dev/null 2>&1; then \
      apt-get update && \
      apt-get install -y --no-install-recommends bash coreutils rsync util-linux && \
      rm -rf /var/lib/apt/lists/*; \
    elif command -v dnf >/dev/null 2>&1; then \
      dnf install -y bash coreutils rsync util-linux && \
      dnf clean all; \
    elif command -v yum >/dev/null 2>&1; then \
      yum install -y bash coreutils rsync util-linux && \
      yum clean all; \
    elif command -v apk >/dev/null 2>&1; then \
      apk add --no-cache bash coreutils rsync util-linux; \
    else \
      echo "Unsupported base image: install bash, coreutils, rsync, and util-linux in the custom BUNDLING_IMAGE" >&2; \
      exit 1; \
    fi

COPY --from=uv /uv /uvx /bin/
COPY *.sh /opt/uv-python-lambda/
RUN chmod +x /opt/uv-python-lambda/*.sh
WORKDIR /opt/uv-python-lambda
ENTRYPOINT [ "/opt/uv-python-lambda/entrypoint.sh" ]
