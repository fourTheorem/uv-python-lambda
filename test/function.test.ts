import { exec, execFile } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { promisify } from 'node:util';
import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import * as cxapi from 'aws-cdk-lib/cx-api';
import { PythonFunction } from '../src';
import {
  cleanupBuilderContainers,
  getManagedBuilderContainerNames,
} from '../src/build-container';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);
const resourcesPath = path.resolve(__dirname, 'resources');
const TEST_TIMEOUT = Number(process.env.TEST_TIMEOUT ?? '999999');

const UV_STABILIZING_ENV = {
  // Spurious open file count errors have occurred. These mitigations should not be required. WIP
  // UV_CONCURRENT_BUILDS: '1',
  // UV_CONCURRENT_INSTALLS: '1',
  // UV_CONCURRENT_DOWNLOADS: '1',
};

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

  stack.node.setContext(cxapi.ASSET_RESOURCE_METADATA_ENABLED_CONTEXT, true);

  return { app, stack };
}

const OLD_ENV = process.env;

beforeEach(async () => {
  jest.resetModules();
  cleanupBuilderContainers();
  process.env = { ...OLD_ENV };
  process.env.CDK_OUTDIR = await fs.mkdtemp(
    path.join(os.tmpdir(), 'uv-python-lambda-test-'),
  );
}, TEST_TIMEOUT);

afterEach(async () => {
  cleanupBuilderContainers();
  if (process.env.CDK_OUTDIR) {
    await fs.rm(process.env.CDK_OUTDIR, { recursive: true });
  }
  process.env = OLD_ENV;
}, TEST_TIMEOUT);

test('Create a function from basic_app', async () => {
  const { app, stack } = await createStack();

  new PythonFunction(stack, 'basic_app', {
    rootDir: path.join(resourcesPath, 'basic_app'),
    index: 'handler.py',
    handler: 'lambda_handler',
    runtime: Runtime.PYTHON_3_12,
    architecture: await getDockerHostArch(),
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
  const asset = await getFunctionAssetContents(functions[0], app);
  expect(asset.rootEntries).toContain('handler.py');
});

test('Create a function from basic_app with no .py index extension', async () => {
  const { stack } = await createStack();

  new PythonFunction(stack, 'basic_app', {
    rootDir: path.join(resourcesPath, 'basic_app'),
    index: 'handler',
    handler: 'lambda_handler',
    runtime: Runtime.PYTHON_3_12,
    architecture: await getDockerHostArch(),
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

  expect(() => {
    new PythonFunction(stack, 'basic_app', {
      rootDir: path.join(resourcesPath, 'basic_app'),
      index: 'handler',
      handler: 'lambda_handler',
      runtime: Runtime.PYTHON_3_12,
      architecture,
    });
  }).not.toThrow();

  expect(getManagedBuilderContainerNames()).toHaveLength(0);
  bundlingSpy.mockRestore();
});

test(
  'Create a function with workspaces_app',
  async () => {
    const { app, stack } = await createStack('wstest');

    new PythonFunction(stack, 'workspaces_app', {
      rootDir: path.join(resourcesPath, 'workspaces_app'),
      workspacePackage: 'app',
      index: 'app.app_handler.py',
      handler: 'handle_event',
      runtime: Runtime.PYTHON_3_10,
      architecture: await getDockerHostArch(),
      bundling: {
        environment: UV_STABILIZING_ENV,
      },
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'app.app_handler.handle_event',
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
    const asset = await getFunctionAssetContents(functions[0], app);

    expect(asset.rootEntries).toEqual(
      expect.arrayContaining(['app', 'common', 'httpx', 'pydantic']),
    );
    expect(asset.files).toEqual(
      expect.arrayContaining(['app/__init__.py', 'app/app_handler.py']),
    );
    expect(asset.files).toContain('common/__init__.py');
    expect(asset.files).not.toContain('_editable_impl_common.pth');
  },
  TEST_TIMEOUT,
);

test(
  'Create a function when rootDir and CDK_OUTDIR are relative paths',
  async () => {
    const relativeRootDir = path.relative(
      process.cwd(),
      path.join(resourcesPath, 'basic_app'),
    );
    const relativeOutDir = path.relative(
      process.cwd(),
      process.env.CDK_OUTDIR as string,
    );

    process.env.CDK_OUTDIR = relativeOutDir;
    const { app, stack } = await createStack('relative-paths');

    new PythonFunction(stack, 'basic_app_relative', {
      rootDir: relativeRootDir,
      index: 'handler.py',
      handler: 'lambda_handler',
      runtime: Runtime.PYTHON_3_12,
      architecture: await getDockerHostArch(),
    });

    const template = Template.fromStack(stack);
    const functions = Object.values(
      template.findResources('AWS::Lambda::Function'),
    );

    expect(functions).toHaveLength(1);
    const asset = await getFunctionAssetContents(functions[0], app);
    expect(asset.rootEntries).toContain('handler.py');
  },
  TEST_TIMEOUT,
);

test(
  'Create a function from basic_app with a custom minimal bundling image',
  async () => {
    const { app, stack } = await createStack('custom-image');

    new PythonFunction(stack, 'basic_app_custom_image', {
      rootDir: path.join(resourcesPath, 'basic_app'),
      index: 'handler.py',
      handler: 'lambda_handler',
      runtime: Runtime.PYTHON_3_12,
      architecture: await getDockerHostArch(),
      bundling: {
        buildArgs: {
          BUNDLING_IMAGE: 'python:3.12-slim',
        },
      },
    });

    const template = Template.fromStack(stack);
    const functions = Object.values(
      template.findResources('AWS::Lambda::Function'),
    );

    expect(functions).toHaveLength(1);
    const asset = await getFunctionAssetContents(functions[0], app);
    expect(asset.rootEntries).toContain('handler.py');
  },
  TEST_TIMEOUT,
);

test('Reuse one builder container for compatible functions', async () => {
  const { stack } = await createStack('shared');
  const architecture = await getDockerHostArch();

  new PythonFunction(stack, 'basic_app_one', {
    rootDir: path.join(resourcesPath, 'basic_app'),
    index: 'handler.py',
    handler: 'lambda_handler',
    runtime: Runtime.PYTHON_3_12,
    architecture,
  });

  new PythonFunction(stack, 'basic_app_two', {
    rootDir: path.join(resourcesPath, 'basic_app'),
    index: 'handler.py',
    handler: 'lambda_handler',
    runtime: Runtime.PYTHON_3_12,
    architecture,
  });

  expect(getManagedBuilderContainerNames()).toHaveLength(1);
});

test('Throw a clear error when CDK_OUTDIR is missing', async () => {
  const { stack } = await createStack('missing-outdir');
  process.env.CDK_OUTDIR = undefined;

  expect(() => {
    new PythonFunction(stack, 'basic_app', {
      rootDir: path.join(resourcesPath, 'basic_app'),
      index: 'handler.py',
      handler: 'lambda_handler',
      runtime: Runtime.PYTHON_3_12,
      architecture: Architecture.X86_64,
    });
  }).toThrow('CDK_OUTDIR must be set before bundling Lambda assets');
});

test('Reject non-python runtimes', async () => {
  const { stack } = await createStack('bad-runtime');

  expect(() => {
    new PythonFunction(stack, 'node_handler', {
      rootDir: path.join(resourcesPath, 'basic_app'),
      index: 'handler.py',
      handler: 'lambda_handler',
      runtime: Runtime.NODEJS_20_X,
    });
  }).toThrow('Only Python runtimes are supported');
});

// biome-ignore lint/suspicious/noExplicitAny: function resource shape comes from CDK assertions
async function getFunctionAssetContents(functionResource: any, app: App) {
  const assetRelPath = functionResource.Metadata['uv-python-lambda:asset-path'];
  const assetPath = path.join(app.outdir, assetRelPath);

  if (assetPath.endsWith('.zip')) {
    const files = await listZipEntries(assetPath);
    const rootEntries = [...new Set(files.map((file) => file.split('/')[0]))];
    return { rootEntries, files };
  }

  const rootEntries = await fs.readdir(assetPath);
  const files: string[] = [];

  async function walk(currentPath: string, relativePath = ''): Promise<void> {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const nextRelativePath = relativePath
        ? path.posix.join(relativePath, entry.name)
        : entry.name;
      const nextPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await walk(nextPath, nextRelativePath);
      } else {
        files.push(nextRelativePath);
      }
    }
  }

  await walk(assetPath);

  return { rootEntries, files };
}

async function listZipEntries(assetPath: string): Promise<string[]> {
  const command = [
    '-c',
    'import json, sys, zipfile; archive = zipfile.ZipFile(sys.argv[1]); print(json.dumps([info.filename for info in archive.infolist() if not info.is_dir()]))',
    assetPath,
  ];

  try {
    const { stdout } = await execFileAsync('python3', command);
    return JSON.parse(stdout) as string[];
  } catch {
    const { stdout } = await execFileAsync('python', command);
    return JSON.parse(stdout) as string[];
  }
}
