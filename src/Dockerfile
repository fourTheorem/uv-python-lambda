# From https://github.com/aws/aws-cdk/blob/95f8cef0505dd2deb8ee5e45ab98c6ab1b764b02/packages/%40aws-cdk/aws-lambda-python-alpha/lib/Dockerfile
# The correct AWS SAM build image based on the runtime of the function will be
# passed as build arg. The default allows to do `docker build .` when testing.
ARG PYTHON_VERSION=3.7
ARG UV_VERSION=0.4.20
ARG IMAGE=public.ecr.aws/sam/build-python${PYTHON_VERSION}
FROM $IMAGE

ARG PIP_INDEX_URL
ARG PIP_EXTRA_INDEX_URL
ARG HTTPS_PROXY
ARG POETRY_VERSION=1.5.1

ENV PIP_CACHE_DIR=/tmp/pip-cache
ENV UV_CACHE_DIR=/tmp/uv-cache

# RUN mkdir /tmp/pip-cache && \
#     chmod -R 777 /tmp/pip-cache && \
#     mkdir /tmp/uv-cache && \
#     chmod -R 777 /tmp/uv-cache && \
#     pip install uv==${UV_VERSION} \
#     rm -rf /tmp/uv-cache/* /tmp/pip-cache/*

CMD [ "python" ]
