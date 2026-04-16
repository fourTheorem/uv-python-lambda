# uv-python-lambda

CDK construct for packaging Python Lambda functions from `uv` projects.

## Why use it

- Packages Lambda assets from a `uv` project.
- Supports `uv` workspaces, so you can package one workspace package while resolving dependencies from the workspace root.
- Keeps the usual CDK Lambda experience: `PythonFunction` extends `aws_lambda.Function`, derives the handler from `index` and `handler`
- Reuses builder containers across compatible functions during synthesis to reduce repeated setup work.

☝️ NOTE: This construct defaults to Python 3.12 on **ARM64**.

This library is published for TypeScript/JavaScript and Python.

## Install

TypeScript / JavaScript:

```bash
npm install uv-python-lambda aws-cdk-lib constructs
```

Python:

```bash
uv add uv-python-lambda aws-cdk-lib constructs
```

Docker is required for bundling.

## Usage

TypeScript:

```ts
import * as path from 'node:path';
import { Stack, Duration } from 'aws-cdk-lib';
import { PythonFunction } from 'uv-python-lambda';
import type { Construct } from 'constructs';

export class ExampleStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new PythonFunction(this, 'Fn', {
      rootDir: path.join(__dirname, '..', '..', 'services', 'fetcher'),
      index: 'handler.py',
      handler: 'lambda_handler',
      timeout: Duration.seconds(30),
    });
  }
}
```

Python:

```python
from pathlib import Path

from aws_cdk import Duration, Stack
from constructs import Construct
from uv_python_lambda import PythonFunction


class ExampleStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        root_dir = Path(__file__).resolve().parents[2] / "services" / "fetcher"

        PythonFunction(
            self,
            "Fn",
            root_dir=str(root_dir),
            index="handler.py",
            handler="lambda_handler",
            timeout=Duration.seconds(30),
        )
```

## Using workspaces

Point `rootDir` or `root_dir` at the workspace root, then set `workspacePackage` or `workspace_package` to the package that contains the Lambda entrypoint.

```ts
new PythonFunction(this, 'WorkspaceFn', {
  rootDir: path.join(__dirname, '..', '..'),
  workspacePackage: 'fetcher',
  index: 'fetcher_lambda.py',
  handler: 'handle_event',
});
```

```python
PythonFunction(
    self,
    "WorkspaceFn",
    root_dir=str(root_dir),
    workspace_package="fetcher",
    index="fetcher_lambda.py",
    handler="handle_event",
)
```

## Notes

- `index` can be passed as `handler.py` or `handler`.
- Use `bundling` to pass Docker environment variables, asset excludes, build args, command hooks, or a custom builder image.
- Set `bundling.buildArgs.BUNDLING_IMAGE` to swap the Python base image used by the default builder.
- Set `bundling.image` to provide a fully custom builder image.
- `bundling.volumes`, `bundling.volumesFrom`, `bundling.network`, and `bundling.securityOpt` are applied to the reusable builder container.
- `bundling.entrypoint`, `bundling.command`, `bundling.workingDirectory`, and `bundling.platform` are deprecated in this construct and will emit warnings if used.
- See [API.md](API.md) for the full API reference.

## Customizing The Builder Image

If you want to keep the default `uv-python-lambda` builder logic but use a different Python base image, override `BUNDLING_IMAGE`:

```ts
new PythonFunction(this, 'Fn', {
  rootDir: path.join(__dirname, '..', '..', 'services', 'fetcher'),
  bundling: {
    buildArgs: {
      BUNDLING_IMAGE: 'python:3.12-slim',
    },
  },
});
```

When you override `BUNDLING_IMAGE`, the library still uses its own default
builder scripts. Those scripts need `bash`, `rsync`, and a few standard Unix
utilities, so the default builder image now installs them on top of the chosen
base image. The conditional `RUN if command -v ...` block in
`resources/Dockerfile` exists to do that across common Debian, RPM, and
Alpine-based images.

If you need full control over the builder container, pass `bundling.image` instead. Custom images must include Python, `uv`, and the `/opt/uv-python-lambda` scripts expected by this library.

For the default builder container, this construct also supports a safe subset
of Docker run options: `volumes`, `volumesFrom`, `network`, and
`securityOpt`. Other generic Docker run options such as `entrypoint`,
`command`, `workingDirectory`, and `platform` do not fit the reusable
builder-container model and are deprecated here.

```ts
import { DockerImage } from 'aws-cdk-lib';

new PythonFunction(this, 'Fn', {
  rootDir: path.join(__dirname, '..', '..', 'services', 'fetcher'),
  bundling: {
    image: DockerImage.fromBuild(path.join(__dirname, '..', '..'), {
      file: 'docker/uv-python-lambda-builder.Dockerfile',
    }),
  },
});
```
