# Build arg defaults (allow simple `docker build .` when testing)
ARG PYTHON_VERSION=3.13
ARG UV_VERSION
FROM ghcr.io/astral-sh/uv:${UV_VERSION:+${UV_VERSION}-}python${PYTHON_VERSION}-bookworm-slim

RUN apt-get update && \
    apt-get install -y rsync && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /.cache/uv && \
    chmod 777 /.cache/uv

CMD [ "python" ]
