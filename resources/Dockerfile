# Use for the container image that uv-python-lambda will use to bundle one or more Lambda functions
# from a uv project (including those with one or more workspaces).

ARG IMAGE_ARCH=arm64   # or x86_64 (not amd64 as per Docker platform)
ARG UV_VERSION=0.5.27
ARG PYTHON_VERSION=3.12
ARG BUNDLING_IMAGE=public.ecr.aws/sam/build-python${PYTHON_VERSION}:latest-${IMAGE_ARCH}

FROM ghcr.io/astral-sh/uv:${UV_VERSION} AS uv
FROM ${BUNDLING_IMAGE}

COPY --from=uv /uv /uvx /bin/
COPY *.sh /opt/uv-python-lambda/
RUN chmod +x /opt/uv-python-lambda/*.sh
WORKDIR /opt/uv-python-lambda
ENTRYPOINT [ "/opt/uv-python-lambda/entrypoint.sh" ]
