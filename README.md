# uv-python-lambda

CDK Construct for Python Lambda Functions using [uv](https://docs.astral.sh/uv/)

## Goals

- ⚡️ Package and deploy Lambda Functions faster with `uv`'s speed
- 📦 Support workspaces in a monorepo with [uv workspaces](https://docs.astral.sh/uv/concepts/workspaces/)

`uv-python-lambda` is based on [aws-lambda-python-alpha](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-lambda-python-alpha-readme.html) with some differences:

- It only supports `uv` for packaging - there is no Poetry or pip support
- It supports workspaces so you can build multiple Lambda functions from different uv workspaces and have their dependencies included correctly. This is useful for, but not limited to, monorepos.

## API

See [API.md](API.md)

## Example

```python
from fourtheorem.uv_python_lambda import PythonFunction
from constructs import Construct

# The root path should be relative to your CDK source file
root_path = Path(__file__).parent.parent.parent


class CdkStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        fn = PythonFunction(
          self,
          "fn",
          root_dir=str(root_path),
          index="fetcher_lambda.py",
          workspace_package="fetcher",  # Use a workspace package as the top-level Lambda entry point.
          handler="handle_event",
          bundling={
              "asset_excludes": [
                  ".venv/",
                  "node_modules/",
                  "cdk/",
                  ".git/",
                  ".idea/",
                  "dist/",
              ]
          },
          timeout=Duration.seconds(30),
        )
```