ARG IMAGE_ARCH=arm64   # or x86_64 (not amd64 as per Docker platform)
ARG UV_VERSION=0.5.27
ARG PYTHON_VERSION=3.12
FROM ghcr.io/astral-sh/uv:${UV_VERSION} AS uv
FROM public.ecr.aws/sam/build-python${PYTHON_VERSION}:latest-${IMAGE_ARCH}
# FROM public.ecr.aws/lambda/python:3.12-$IMAGE_ARCH
COPY --from=uv /uv /uvx /bin/
COPY *.sh /root
WORKDIR /root
ENTRYPOINT [ "/root/entrypoint.sh" ]