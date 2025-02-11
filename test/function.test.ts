import { exec } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { promisify } from 'node:util';
import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import * as cxapi from 'aws-cdk-lib/cx-api';
import * as fsextra from 'fs-extra';
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
    path.join(os.tmpdir(), 'uv-python-lambda-function'),
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
    const functions = getFunctions(template);
    expect(functions).toHaveLength(1);
    const contents = await getAssetContent(functions[0], app);
    expect(contents).toContain('handler.py');
  }, 40000); // need long timeout as working with file system

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

    const functions = getFunctions(template);
    expect(functions).toHaveLength(1);
    const contents = await getAssetContent(functions[0], app);
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
  }, 40000); // need long timeout as working with file system

  test('Create multiple functions with workspaces_app', async () => {
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

    new PythonFunction(stack, 'workspaces_backend', {
      rootDir: path.join(resourcesPath, 'workspaces_app'),
      workspacePackage: 'backend',
      index: 'backend_handler.py',
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
    });

    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'backend_handler.handle_event',
    });

    const functions = getFunctions(template);
    expect(functions).toHaveLength(2);
    const appContents = await getAssetContent(functions[0], app);
    for (const entry of [
      'app',
      'backend',
      'common',
      'pydantic',
      'httpx',
      '_common.pth',
      'app_handler.py',
    ]) {
      expect(appContents).toContain(entry);
    }
    expect(appContents).not.toContain('backend_handler.py');
    expect(appContents).not.toContain('pathlib');
    const backendContents = await getAssetContent(functions[1], app);
    for (const entry of [
      'app',
      'backend',
      'common',
      'pydantic',
      'httpx',
      '_common.pth',
      'backend_handler.py',
    ]) {
      expect(backendContents).toContain(entry);
    }
    expect(backendContents).not.toContain('app_handler.py');
    expect(backendContents).not.toContain('flask');
  }, 30000);
});

describe('When bundlingStrategy is set to BundlingStrategy.GIT', () => {
  jest.setTimeout(30000); // we are doing integration tests with the file system so give tests more time

  test('Create a function from basic_app', async () => {
    const { app, stack } = await createStack();

    new PythonFunction(stack, 'basic_app', {
      rootDir: path.join(resourcesPath, 'basic_app'),
      index: 'handler.py',
      handler: 'lambda_handler',
      runtime: Runtime.PYTHON_3_12,
      architecture: await getDockerHostArch(),
      bundling: {
        bundlingStrategy: BundlingStrategy.GIT,
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
    const functions = getFunctions(template);
    expect(functions).toHaveLength(1);
    const contents = await getAssetContent(functions[0], app);
    expect(contents).toContain('handler.py');
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
          bundlingStrategy: BundlingStrategy.GIT,
        },
      });
    }).not.toThrow();

    bundlingSpy.mockRestore();
  });

  test('Create a function from basic_app only gets rebuild when source changes', async () => {
    const createBasicAppStack = async (workspacePath: string) => {
      const { app, stack } = await createStack();

      new PythonFunction(stack, 'basic_app', {
        rootDir: path.join(workspacePath, 'basic_app'),
        index: 'handler.py',
        handler: 'lambda_handler',
        runtime: Runtime.PYTHON_3_12,
        architecture: await getDockerHostArch(),
        bundling: {
          bundlingStrategy: BundlingStrategy.GIT,
        },
      });

      return { app, stack };
    };

    const workspacePath = await copyWorkspaceToTemp('basic_app', { git: true });

    let { app, stack } = await createBasicAppStack(workspacePath);
    let template = Template.fromStack(stack);

    const run1Functions = getFunctions(template);
    const basicAppAssetPath = getAssetPath(run1Functions[0], app);
    expect(run1Functions).toHaveLength(1);
    const contents = await getAssetContent(run1Functions[0], app);
    expect(contents).toContain('handler.py');
    // change the contents of the folder so we can verify what is rebuilt
    await setAssetContents(run1Functions[0], app, ['basic_app.text']);

    // Need to create the stack again as synthesize is only called once otherwise
    ({ app, stack } = await createBasicAppStack(workspacePath));
    template = Template.fromStack(stack);
    const run2Functions = getFunctions(template);
    // validate that same folder is used because the hash is the same
    expect(getAssetPath(run2Functions[0], app)).toEqual(basicAppAssetPath);
    expect(await getAssetContent(run2Functions[0], app)).toEqual([
      'basic_app.text',
    ]);

    // Now modify the source folder and check that the function is rebuilt
    await replaceStringInFile(
      path.join(workspacePath, 'basic_app', 'handler.py'),
      'Hello',
      'Hi',
    );

    ({ app, stack } = await createBasicAppStack(workspacePath));
    template = Template.fromStack(stack);
    const run3Functions = getFunctions(template);
    // validate that different folder is used because the hash is different
    expect(getAssetPath(run3Functions[0], app)).not.toEqual(basicAppAssetPath);
    expect(await getAssetContent(run3Functions[0], app)).toContain(
      'handler.py',
    );
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
        bundlingStrategy: BundlingStrategy.GIT,
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

    const functions = getFunctions(template);
    expect(functions).toHaveLength(1);
    const contents = await getAssetContent(functions[0], app);
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

  const createWorkspaceAppStack = async (workspacePath: string) => {
    const { app, stack } = await createStack();

    new PythonFunction(stack, 'workspaces_app', {
      rootDir: path.join(workspacePath, 'workspaces_app'),
      workspacePackage: 'app',
      index: 'app_handler.py',
      handler: 'handle_event',
      runtime: Runtime.PYTHON_3_10,
      architecture: await getDockerHostArch(),
      bundling: {
        bundlingStrategy: BundlingStrategy.GIT,
      },
    });

    return { app, stack };
  };

  test('Create a function with workspaces_app gets rebuilt if app changes', async () => {
    const workspacePath = await copyWorkspaceToTemp('workspaces_app', {
      git: true,
    });

    let { app, stack } = await createWorkspaceAppStack(workspacePath);

    let template = Template.fromStack(stack);

    const run1Functions = getFunctions(template);
    expect(run1Functions).toHaveLength(1);
    const appAssetPath = getAssetPath(run1Functions[0], app);
    const contents = await getAssetContent(run1Functions[0], app);
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

    // change the contents of the folder so we can verify what is rebuilt
    await setAssetContents(run1Functions[0], app, ['app.text']);

    // Need to create the stack again as synthesize is only called once otherwise
    ({ app, stack } = await createWorkspaceAppStack(workspacePath));
    template = Template.fromStack(stack);
    const run2Functions = getFunctions(template);
    // validate that same folder is used because the hash is the same
    expect(getAssetPath(run2Functions[0], app)).toEqual(appAssetPath);
    expect(await getAssetContent(run2Functions[0], app)).toEqual(['app.text']);

    // Now modify the source folder and check that the function is rebuilt
    await replaceStringInFile(
      path.join(workspacePath, 'workspaces_app', 'app', 'app_handler.py'),
      'Corolla',
      'Auris',
    );

    ({ app, stack } = await createWorkspaceAppStack(workspacePath));
    template = Template.fromStack(stack);
    const run3Functions = getFunctions(template);
    const run3AssetPath = getAssetPath(run3Functions[0], app);
    // validate that different folder is used because the hash is different
    expect(run3AssetPath).not.toEqual(appAssetPath);
    expect(await getAssetContent(run3Functions[0], app)).toContain(
      'app_handler.py',
    );
  });

  test('Create a function with workspaces_app gets rebuilt if dependency changes', async () => {
    const workspacePath = await copyWorkspaceToTemp('workspaces_app', {
      git: true,
    });

    let { app, stack } = await createWorkspaceAppStack(workspacePath);

    let template = Template.fromStack(stack);

    const run1Functions = getFunctions(template);
    expect(run1Functions).toHaveLength(1);
    const appAssetPath = getAssetPath(run1Functions[0], app);
    const contents = await getAssetContent(run1Functions[0], app);
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

    // change the contents of the folder so we can verify what is rebuilt
    await setAssetContents(run1Functions[0], app, ['app.text']);

    // Now modify the dependency source folder and check that the function is rebuilt
    await replaceStringInFile(
      path.join(workspacePath, 'workspaces_app', 'common', 'README.md'),
      'Common',
      'Shared',
    );

    ({ app, stack } = await createWorkspaceAppStack(workspacePath));
    template = Template.fromStack(stack);
    const run3Functions = getFunctions(template);
    const run3AssetPath = getAssetPath(run3Functions[0], app);
    // validate that different folder is used because the hash is different
    expect(run3AssetPath).not.toEqual(appAssetPath);
    expect(await getAssetContent(run3Functions[0], app)).toContain(
      'app_handler.py',
    );
  });

  test('Create a function with workspaces_app does NOT get rebuilt if unrelated code changes', async () => {
    const workspacePath = await copyWorkspaceToTemp('workspaces_app', {
      git: true,
    });

    let { app, stack } = await createWorkspaceAppStack(workspacePath);

    let template = Template.fromStack(stack);

    const run1Functions = getFunctions(template);
    expect(run1Functions).toHaveLength(1);
    const appAssetPath = getAssetPath(run1Functions[0], app);
    const contents = await getAssetContent(run1Functions[0], app);
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

    // change the contents of the folder so we can verify what is rebuilt
    await setAssetContents(run1Functions[0], app, ['app.text']);

    // Now modify the unrelated app source and check that the function is not rebuilt
    await replaceStringInFile(
      path.join(
        workspacePath,
        'workspaces_app',
        'backend',
        'backend_handler.py',
      ),
      'Skyline',
      'Juke',
    );

    ({ app, stack } = await createWorkspaceAppStack(workspacePath));
    template = Template.fromStack(stack);
    const run3Functions = getFunctions(template);
    const run3AssetPath = getAssetPath(run3Functions[0], app);
    // validate that same folder is used because the hash is the same
    expect(run3AssetPath).toEqual(appAssetPath);
    expect(await getAssetContent(run3Functions[0], app)).toContain('app.text');
  });

  async function createMultipleFunctionStack(
    workspacePath?: string,
  ): Promise<{ app: App; stack: Stack }> {
    const { app, stack } = await createStack('wstest');
    const rootPath = workspacePath ?? resourcesPath;

    new PythonFunction(stack, 'workspaces_app', {
      rootDir: path.join(rootPath, 'workspaces_app'),
      workspacePackage: 'app',
      index: 'app_handler.py',
      handler: 'handle_event',
      runtime: Runtime.PYTHON_3_10,
      architecture: await getDockerHostArch(),
      bundling: {
        bundlingStrategy: BundlingStrategy.GIT,
      },
    });

    new PythonFunction(stack, 'workspaces_backend', {
      rootDir: path.join(rootPath, 'workspaces_app'),
      workspacePackage: 'backend',
      index: 'backend_handler.py',
      handler: 'handle_event',
      runtime: Runtime.PYTHON_3_10,
      architecture: await getDockerHostArch(),
      bundling: {
        bundlingStrategy: BundlingStrategy.GIT,
      },
    });

    return { app, stack };
  }

  test('Create multiple functions with workspaces_app', async () => {
    const { app, stack } = await createMultipleFunctionStack();
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'app_handler.handle_event',
    });

    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'backend_handler.handle_event',
    });

    const functions = getFunctions(template);
    expect(functions).toHaveLength(2);
    const appContents = await getAssetContent(functions[0], app);
    for (const entry of [
      'app',
      'backend',
      'common',
      'pydantic',
      'httpx',
      '_common.pth',
      'app_handler.py',
    ]) {
      expect(appContents).toContain(entry);
    }
    expect(appContents).not.toContain('backend_handler.py');
    expect(appContents).not.toContain('pathlib');
    const backendContents = await getAssetContent(functions[1], app);
    for (const entry of [
      'app',
      'backend',
      'common',
      'pydantic',
      'httpx',
      '_common.pth',
      'backend_handler.py',
    ]) {
      expect(backendContents).toContain(entry);
    }
    expect(backendContents).not.toContain('app_handler.py');
    expect(backendContents).not.toContain('flask');
  });

  test("Doesn't rebuild multiple functions if they haven't changed", async () => {
    let { app, stack } = await createMultipleFunctionStack();
    let template = Template.fromStack(stack);

    const run1Functions = getFunctions(template);
    const appAssetPath = getAssetPath(run1Functions[0], app);
    const backendAssetPath = getAssetPath(run1Functions[1], app);
    // change the contents of the folder so we can verify they are not rebuilt
    await setAssetContents(run1Functions[0], app, ['app.text']);
    await setAssetContents(run1Functions[1], app, ['backend.text']);

    // Need to create the stack again as synthesize is only called once otherwise
    ({ app, stack } = await createMultipleFunctionStack());

    template = Template.fromStack(stack);
    const run2Functions = getFunctions(template);
    // validate that the same folder is being used for the functions
    expect(getAssetPath(run2Functions[0], app)).toEqual(appAssetPath);
    expect(getAssetPath(run2Functions[1], app)).toEqual(backendAssetPath);

    // validate they contain the content we put in above, i.e. haven't been overwritten
    expect(await getAssetContent(run2Functions[0], app)).toEqual(['app.text']);
    expect(await getAssetContent(run2Functions[1], app)).toEqual([
      'backend.text',
    ]);
  });

  test('Rebuild single function when its content changes', async () => {
    // copy the workspace so we can edit it without affecting the original
    const workspacePath = await copyWorkspaceToTemp('workspaces_app', {
      git: true,
    });
    let { app, stack } = await createMultipleFunctionStack(workspacePath);
    let template = Template.fromStack(stack);

    const run1Functions = getFunctions(template);
    const appAssetPath = getAssetPath(run1Functions[0], app);
    const backendAssetPath = getAssetPath(run1Functions[1], app);
    // change the contents of the folder so we can verify what is rebuilt
    await setAssetContents(run1Functions[0], app, ['app.text']);
    await setAssetContents(run1Functions[1], app, ['backend.text']);

    // Now modify the source folder and check that the function is rebuilt
    await replaceStringInFile(
      path.join(workspacePath, 'workspaces_app', 'app', 'app_handler.py'),
      'Corolla',
      'Auris',
    );
    // Need to create the stack again as synthesize is only called once otherwise
    ({ app, stack } = await createMultipleFunctionStack(workspacePath));

    template = Template.fromStack(stack);
    const run2Functions = getFunctions(template);
    // validate that different folder for updated function but same one for unchanged
    expect(getAssetPath(run2Functions[0], app)).not.toEqual(appAssetPath);
    expect(getAssetPath(run2Functions[1], app)).toEqual(backendAssetPath);

    // validate app has been rebuild but backend hasn't been touched
    const appContents = await getAssetContent(run2Functions[0], app);
    for (const entry of [
      'app',
      'backend',
      'common',
      'pydantic',
      'httpx',
      '_common.pth',
      'app_handler.py',
    ]) {
      expect(appContents).toContain(entry);
    }
    expect(await getAssetContent(run2Functions[1], app)).toEqual([
      'backend.text',
    ]);
  });

  test('Rebuild any function when its dependency version changes', async () => {
    // copy the workspace so we can edit it without affecting the original
    const workspacePath = await copyWorkspaceToTemp('workspaces_app', {
      git: true,
    });
    let { app, stack } = await createMultipleFunctionStack(workspacePath);
    let template = Template.fromStack(stack);

    const run1Functions = getFunctions(template);
    const appAssetPath = getAssetPath(run1Functions[0], app);
    const backendAssetPath = getAssetPath(run1Functions[1], app);
    // change the contents of the folder so we can verify what is rebuilt
    await setAssetContents(run1Functions[0], app, ['app.text']);
    await setAssetContents(run1Functions[1], app, ['backend.text']);

    // Now modify the dependency source folder and check that both functions are rebuilt
    await replaceStringInFile(
      path.join(workspacePath, 'workspaces_app', 'common', 'README.md'),
      'Common',
      'Shared',
    );
    // Need to create the stack again as synthesize is only called once otherwise
    ({ app, stack } = await createMultipleFunctionStack(workspacePath));

    template = Template.fromStack(stack);
    const run2Functions = getFunctions(template);
    // validate that different folder for both updated functions
    expect(getAssetPath(run2Functions[0], app)).not.toEqual(appAssetPath);
    expect(getAssetPath(run2Functions[1], app)).not.toEqual(backendAssetPath);

    // validate app and backend have both been rebuilt
    const appContents = await getAssetContent(run2Functions[0], app);
    for (const entry of [
      'app',
      'backend',
      'common',
      'pydantic',
      'httpx',
      '_common.pth',
      'app_handler.py',
    ]) {
      expect(appContents).toContain(entry);
    }
    const backendContents = await getAssetContent(run2Functions[1], app);
    for (const entry of [
      'app',
      'backend',
      'common',
      'pydantic',
      'httpx',
      '_common.pth',
      'backend_handler.py',
    ]) {
      expect(backendContents).toContain(entry);
    }
  });
});

/**
 * Copy the workspace to a temporary directory and return the path to the temporary directory.
 * The workspace is copied to ensure that the original workspace is not modified when we change it during tests.
 *
 * @param workspace
 * @param git - if true, a git repository is initialized in the copied workspace
 */
async function copyWorkspaceToTemp(
  workspace: string,
  { git = false }: { git?: boolean } = { git: false },
): Promise<string> {
  const tempDir = await fs.mkdtemp(
    path.join(os.tmpdir(), 'uv-python-lambda-workspace'),
  );
  await fsextra.copy(
    path.join(resourcesPath, workspace),
    path.join(tempDir, workspace),
  );

  if (git) {
    const gitPath = path.join(tempDir, workspace);
    await execAsync('git init', { cwd: gitPath });
    await execAsync('git add .', { cwd: gitPath });
    await execAsync('git config user.email "test@example.com"', {
      cwd: gitPath,
    });
    await execAsync('git config user.name "Testy McTestface"', {
      cwd: gitPath,
    });

    await execAsync('git commit -m "commit for test purposes"', {
      cwd: gitPath,
    });
  }
  return tempDir;
}

/**
 * Replace all occurrences of a string in a file. Used to make modifications to workspace copies for testing purposes.
 *
 * @param filePath
 * @param searchString
 * @param replaceString
 */
async function replaceStringInFile(
  filePath: string,
  searchString: string,
  replaceString: string,
): Promise<void> {
  try {
    // Read the file content
    const content = await fs.readFile(filePath, 'utf-8');

    // Perform the replacement
    const updatedContent = content.replace(
      new RegExp(searchString, 'g'),
      replaceString,
    );

    // Write the modified content back to the file
    await fs.writeFile(filePath, updatedContent, 'utf-8');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to replace string in file: ${error.message}`);
    }
    throw error;
  }
}

// biome-ignore lint/suspicious/noExplicitAny: any is what is returned from the CDK template.findResources method
function getFunctions(template: Template): any[] {
  return Object.values(template.findResources('AWS::Lambda::Function'));
}

// biome-ignore lint/suspicious/noExplicitAny: any is what is returned from the CDK template.findResources method
function getAssetPath(functionResource: any, app: App): string {
  const [assetHash] = functionResource.Properties.Code.S3Key.split('.');
  return path.join(app.outdir, `asset.${assetHash}`);
}

// biome-ignore lint/suspicious/noExplicitAny: any is what is returned from the CDK template.findResources method
async function getAssetContent(functionResource: any, app: App) {
  return await fs.readdir(getAssetPath(functionResource, app));
}

async function setAssetContents(
  // biome-ignore lint/suspicious/noExplicitAny: any is what is returned from the CDK template.findResources method
  functionResource: any,
  app: App,
  contents: string[],
) {
  const assetPath = getAssetPath(functionResource, app);

  // remove all existing contents and add the new ones as empty files
  const existingContents = await fs.readdir(assetPath);
  for (const entry of existingContents) {
    await fs.rm(path.join(assetPath, entry), { force: true, recursive: true });
  }
  for (const entry of contents) {
    await fs.writeFile(path.join(assetPath, entry), '');
  }
}
