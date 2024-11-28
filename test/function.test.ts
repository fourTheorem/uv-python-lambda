import { exec } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { promisify } from 'node:util';
import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import * as cxapi from 'aws-cdk-lib/cx-api';
import { BundlingStrategy, PythonFunction } from '../src';

const execAsync = promisify(exec);

const resourcesPath = path.resolve(__dirname, 'resources');

/**
 * Determine the optimal Lambda Function architecture based on the Docker host's CPU
 * architecture. This allows GHA runners to work without slow QEMU Arm emulation.
 *
 * @returns The Lambda Architecture
 */
async function getDockerHostArch(): Promise<Architecture> {
  try {
    const { stdout } = await execAsync(
      'docker info --format "{{.Architecture}}"',
    );
    const arch = stdout.trim();
    return arch === 'aarch64' ? Architecture.ARM_64 : Architecture.X86_64;
  } catch (error) {
    console.error('Error getting Docker host architecture:', error);
    throw error;
  }
}

/**
 * Create a new CDK App and Stack with the given name and set the context to ensure
 * that the 'aws:asset:path' metadata is set.
 *
 * @returns The App and Stack
 */
async function createStack(name = 'test'): Promise<{ app: App; stack: Stack }> {
  const app = new App({});
  const stack = new Stack(app, name);

  // This ensures that the 'aws:asset:path' metadata is set
  stack.node.setContext(cxapi.ASSET_RESOURCE_METADATA_ENABLED_CONTEXT, true);

  return { app, stack };
}

// Need to have CDK_OUTDIR set to something sensible as it's used to create the codePath when aws:asset:path is set
const OLD_ENV = process.env;

beforeEach(async () => {
  jest.resetModules();
  process.env = { ...OLD_ENV };
  process.env.CDK_OUTDIR = await fs.mkdtemp(
    path.join(os.tmpdir(), 'uv-python-lambda-test-'),
  );
});

afterEach(async () => {
  if (process.env.CDK_OUTDIR) {
    await fs.rm(process.env.CDK_OUTDIR, { recursive: true });
  }
  process.env = OLD_ENV;
});

describe('When bundlingStrategy is set to BundlingStrategy.SOURCE', () => {
  test('Create a function from basic_app', async () => {
    const { app, stack } = await createStack();

    new PythonFunction(stack, 'basic_app', {
      rootDir: path.join(resourcesPath, 'basic_app'),
      index: 'handler.py',
      handler: 'lambda_handler',
      runtime: Runtime.PYTHON_3_12,
      architecture: await getDockerHostArch(),
      bundling: {
        bundlingStrategy: BundlingStrategy.SOURCE,
      },
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'handler.lambda_handler',
      Runtime: 'python3.12',
      Code: {
        S3Bucket: Match.anyValue(),
        S3Key: Match.anyValue(),
      },
    });
    const functions = Object.values(
      template.findResources('AWS::Lambda::Function'),
    );
    expect(functions).toHaveLength(1);
    const contents = await getFunctionAssetContents(functions[0], app);
    expect(contents).toContain('handler.py');
  });

  test('Create a function from basic_app with no .py index extension', async () => {
    const { stack } = await createStack();

    new PythonFunction(stack, 'basic_app', {
      rootDir: path.join(resourcesPath, 'basic_app'),
      index: 'handler',
      handler: 'lambda_handler',
      runtime: Runtime.PYTHON_3_12,
      architecture: await getDockerHostArch(),
      bundling: {
        bundlingStrategy: BundlingStrategy.SOURCE,
      },
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'handler.lambda_handler',
      Runtime: 'python3.12',
      Code: {
        S3Bucket: Match.anyValue(),
        S3Key: Match.anyValue(),
      },
    });
  });

  test('Create a function from basic_app when skip is true', async () => {
    const { stack } = await createStack();

    const bundlingSpy = jest
      .spyOn(stack, 'bundlingRequired', 'get')
      .mockReturnValue(false);
    const architecture = await getDockerHostArch();

    // To see this fail, comment out the `if (skip) { return; } code in the PythonFunction constructor
    expect(() => {
      new PythonFunction(stack, 'basic_app', {
        rootDir: path.join(resourcesPath, 'basic_app'),
        index: 'handler',
        handler: 'lambda_handler',
        runtime: Runtime.PYTHON_3_12,
        architecture,
        bundling: {
          bundlingStrategy: BundlingStrategy.SOURCE,
        },
      });
    }).not.toThrow();

    bundlingSpy.mockRestore();
  });

  test('Create a function with workspaces_app', async () => {
    const { app, stack } = await createStack('wstest');

    new PythonFunction(stack, 'workspaces_app', {
      rootDir: path.join(resourcesPath, 'workspaces_app'),
      workspacePackage: 'app',
      index: 'app_handler.py',
      handler: 'handle_event',
      runtime: Runtime.PYTHON_3_10,
      architecture: await getDockerHostArch(),
      bundling: {
        bundlingStrategy: BundlingStrategy.SOURCE,
      },
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'app_handler.handle_event',
      Runtime: 'python3.10',
      Code: {
        S3Bucket: Match.anyValue(),
        S3Key: Match.anyValue(),
      },
    });

    const functions = Object.values(
      template.findResources('AWS::Lambda::Function'),
    );
    expect(functions).toHaveLength(1);
    const contents = await getFunctionAssetContents(functions[0], app);
    for (const entry of [
      'app',
      'common',
      'pydantic',
      'httpx',
      '_common.pth',
      'app_handler.py',
    ]) {
      expect(contents).toContain(entry);
    }
  });
});

describe('When bundlingStrategy is set to BundlingStrategy.PACKAGE_VERSION', () => {
  test('Create a function from basic_app', async () => {
    const { app, stack } = await createStack();

    new PythonFunction(stack, 'basic_app', {
      rootDir: path.join(resourcesPath, 'basic_app'),
      index: 'handler.py',
      handler: 'lambda_handler',
      runtime: Runtime.PYTHON_3_12,
      architecture: await getDockerHostArch(),
      bundling: {
        bundlingStrategy: BundlingStrategy.PACKAGE_VERSION,
      },
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'handler.lambda_handler',
      Runtime: 'python3.12',
      Code: {
        S3Bucket: Match.anyValue(),
        S3Key: Match.anyValue(),
      },
    });
    const functions = Object.values(
      template.findResources('AWS::Lambda::Function'),
    );
    expect(functions).toHaveLength(1);
    const contents = await getFunctionAssetContents(functions[0], app);
    expect(contents).toContain('handler.py');
  });

  test('Create a function from basic_app with no .py index extension', async () => {
    const { stack } = await createStack();

    new PythonFunction(stack, 'basic_app', {
      rootDir: path.join(resourcesPath, 'basic_app'),
      index: 'handler',
      handler: 'lambda_handler',
      runtime: Runtime.PYTHON_3_12,
      architecture: await getDockerHostArch(),
      bundling: {
        bundlingStrategy: BundlingStrategy.PACKAGE_VERSION,
      },
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'handler.lambda_handler',
      Runtime: 'python3.12',
      Code: {
        S3Bucket: Match.anyValue(),
        S3Key: Match.anyValue(),
      },
    });
  });

  test('Create a function from basic_app when skip is true', async () => {
    const { stack } = await createStack();

    const bundlingSpy = jest
      .spyOn(stack, 'bundlingRequired', 'get')
      .mockReturnValue(false);
    const architecture = await getDockerHostArch();

    // To see this fail, comment out the `if (skip) { return; } code in the PythonFunction constructor
    expect(() => {
      new PythonFunction(stack, 'basic_app', {
        rootDir: path.join(resourcesPath, 'basic_app'),
        index: 'handler',
        handler: 'lambda_handler',
        runtime: Runtime.PYTHON_3_12,
        architecture,
        bundling: {
          bundlingStrategy: BundlingStrategy.PACKAGE_VERSION,
        },
      });
    }).not.toThrow();

    bundlingSpy.mockRestore();
  });

  test('Create a function with workspaces_app', async () => {
    const { app, stack } = await createStack('wstest');

    new PythonFunction(stack, 'workspaces_app', {
      rootDir: path.join(resourcesPath, 'workspaces_app'),
      workspacePackage: 'app',
      index: 'app_handler.py',
      handler: 'handle_event',
      runtime: Runtime.PYTHON_3_10,
      architecture: await getDockerHostArch(),
      bundling: {
        bundlingStrategy: BundlingStrategy.PACKAGE_VERSION,
      },
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'app_handler.handle_event',
      Runtime: 'python3.10',
      Code: {
        S3Bucket: Match.anyValue(),
        S3Key: Match.anyValue(),
      },
    });

    const functions = Object.values(
      template.findResources('AWS::Lambda::Function'),
    );
    expect(functions).toHaveLength(1);
    const contents = await getFunctionAssetContents(functions[0], app);
    console.log('contents', contents);
    for (const entry of [
      'app',
      'common',
      'pydantic',
      'httpx',
      '_common.pth',
      'app_handler.py',
    ]) {
      expect(contents).toContain(entry);
    }
  });
});

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
async function getFunctionAssetContents(functionResource: any, app: App) {
  const [assetHash] = functionResource.Properties.Code.S3Key.split('.');
  const assetPath = path.join(app.outdir, `asset.${assetHash}`);
  return await fs.readdir(assetPath);
}

// async function setFunctionAssetContents(
//   functionResource: any,
//   app: App,
//   contents: string[],
// ) {
//   const [assetHash] = functionResource.Properties.Code.S3Key.split('.');
//   const assetPath = path.join(app.outdir, `asset.${assetHash}`);
//   console.log({ assetPath });
//   // remove all existing contents and add the new ones as empty files
//   const existingContents = await fs.readdir(assetPath);
//   for (const entry of existingContents) {
//     await fs.rm(entry, { recursive: true });
//   }
//   for (const entry of contents) {
//     await fs.writeFile(path.join(assetPath, entry), '');
//   }
// }
