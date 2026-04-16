import { DockerImage } from 'aws-cdk-lib';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Bundling, DEFAULT_UV_VERSION } from '../src/bundling';
import type { ICommandHooks } from '../src/types';

type BundlingModule = typeof import('../src/bundling');

function decodeCommands(value: string) {
  return JSON.parse(Buffer.from(value, 'base64').toString('utf8')) as string[];
}

function getExpectedDockerUserArg() {
  if (
    typeof process.getuid !== 'function' ||
    typeof process.getgid !== 'function'
  ) {
    throw new Error('process.getuid() and process.getgid() are required');
  }

  return `${process.getuid()}:${process.getgid()}`;
}

function loadBundlingModule(ensureBuilderContainerMock: jest.Mock) {
  let loadedModule: BundlingModule | undefined;

  jest.isolateModules(() => {
    jest.doMock('../src/build-container', () => ({
      BUILDER_LABEL: 'com.fourtheorem.uv-python-lambda.builder',
      ensureBuilderContainer: ensureBuilderContainerMock,
    }));
    loadedModule = require('../src/bundling') as BundlingModule;
  });

  if (!loadedModule) {
    throw new Error('Failed to load bundling module');
  }

  return loadedModule;
}

describe('Bundling', () => {
  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  test('warns when deprecated unsupported bundling options are used', () => {
    const emitWarningSpy = jest
      .spyOn(process, 'emitWarning')
      .mockImplementation(() => undefined);

    new Bundling({
      rootDir: '/tmp/project-deprecated-options',
      runtime: Runtime.PYTHON_3_12,
      architecture: Architecture.X86_64,
      entrypoint: ['/bin/sh', '-c'],
      command: ['echo', 'hello'],
      workingDirectory: '/tmp',
      platform: 'linux/amd64',
    });

    expect(emitWarningSpy).toHaveBeenCalledTimes(4);
    expect(emitWarningSpy).toHaveBeenCalledWith(
      expect.stringContaining('bundling.entrypoint is deprecated and ignored'),
      'DeprecationWarning',
    );
    expect(emitWarningSpy).toHaveBeenCalledWith(
      expect.stringContaining('bundling.command is deprecated and ignored'),
      'DeprecationWarning',
    );
    expect(emitWarningSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'bundling.workingDirectory is deprecated and ignored',
      ),
      'DeprecationWarning',
    );
    expect(emitWarningSpy).toHaveBeenCalledWith(
      expect.stringContaining('bundling.platform is deprecated and ignored'),
      'DeprecationWarning',
    );
  });

  test('returns a no-op command when bundling is skipped', () => {
    const bundling = new Bundling({
      rootDir: '/tmp/project',
      runtime: Runtime.PYTHON_3_12,
      architecture: Architecture.X86_64,
      skip: true,
    });

    const command = Reflect.get(bundling, 'createBundlingCommand').call(
      bundling,
    ) as string[];

    expect(command).toEqual([process.execPath, '-e', 'process.exit(0)']);
  });

  test('encodes before and after command hooks into the export command', () => {
    const commandHooks: ICommandHooks = {
      beforeBundling: jest.fn().mockReturnValue(['echo before']),
      afterBundling: jest.fn().mockReturnValue(['echo after']),
    };

    const bundling = new Bundling({
      rootDir: '/tmp/project',
      runtime: Runtime.PYTHON_3_12,
      architecture: Architecture.X86_64,
      workspacePackage: 'app',
      commandHooks,
    });

    const command = Reflect.get(bundling, 'createBundlingCommand').call(
      bundling,
    ) as string[];

    const beforeIndex = command.indexOf('--before-hooks');
    const afterIndex = command.indexOf('--after-hooks');

    expect(beforeIndex).toBeGreaterThan(-1);
    expect(afterIndex).toBeGreaterThan(-1);
    expect(decodeCommands(command[beforeIndex + 1])).toEqual(['echo before']);
    expect(decodeCommands(command[afterIndex + 1])).toEqual(['echo after']);
    expect(commandHooks.beforeBundling).toHaveBeenCalledWith(
      '/src',
      '/uvbuild/app',
    );
    expect(commandHooks.afterBundling).toHaveBeenCalledWith(
      '/src',
      '/uvbuild/app',
    );
  });

  test('omits hook flags when hooks return no commands', () => {
    const bundling = new Bundling({
      rootDir: '/tmp/project',
      runtime: Runtime.PYTHON_3_12,
      architecture: Architecture.X86_64,
      workspacePackage: 'app',
      commandHooks: {
        beforeBundling: () => [],
        afterBundling: () => [],
      },
    });

    const command = Reflect.get(bundling, 'createBundlingCommand').call(
      bundling,
    ) as string[];

    expect(command).not.toContain('--before-hooks');
    expect(command).not.toContain('--after-hooks');
  });

  test('passes bundling environment variables to export commands', () => {
    const bundling = new Bundling({
      rootDir: '/tmp/project-env',
      runtime: Runtime.PYTHON_3_12,
      architecture: Architecture.X86_64,
      workspacePackage: 'app',
      environment: {
        UV_CONCURRENT_INSTALLS: '1',
        UV_CONCURRENT_BUILDS: '2',
      },
    });

    const command = Reflect.get(bundling, 'createBundlingCommand').call(
      bundling,
    ) as string[];

    expect(command).toContain('-e');
    expect(command).toContain('UV_CONCURRENT_INSTALLS=1');
    expect(command).toContain('UV_CONCURRENT_BUILDS=2');
    expect(command).toContain('UV_PYTHON_LAMBDA_NOFILE_LIMIT=1048576');
  });

  test('runs export commands as the host user when uid and gid are available', () => {
    const bundling = new Bundling({
      rootDir: '/tmp/project-user',
      runtime: Runtime.PYTHON_3_12,
      architecture: Architecture.X86_64,
      workspacePackage: 'app',
    });

    const command = Reflect.get(bundling, 'createBundlingCommand').call(
      bundling,
    ) as string[];

    expect(command).toContain('--user');
    expect(command).toContain(getExpectedDockerUserArg());
    expect(command).toContain('/opt/uv-python-lambda/export.sh');
  });

  test('builds the builder image with the default uv version', () => {
    const fromBuildSpy = jest
      .spyOn(DockerImage, 'fromBuild')
      .mockReturnValue({ image: 'mock-image' } as DockerImage);

    const bundling = new Bundling({
      rootDir: '/tmp/project-default-uv',
      runtime: Runtime.PYTHON_3_12,
      architecture: Architecture.X86_64,
    });

    Reflect.get(bundling, 'createDockerImage').call(bundling);

    const [, options] = fromBuildSpy.mock.calls[0];

    expect(fromBuildSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        buildArgs: expect.objectContaining({
          BUNDLING_IMAGE: Runtime.PYTHON_3_12.bundlingImage.image,
          UV_VERSION: DEFAULT_UV_VERSION,
        }),
      }),
    );
    expect(options?.buildArgs).not.toHaveProperty('IMAGE');
    expect(options?.buildArgs).not.toHaveProperty('IMAGE_ARCH');
    expect(options?.buildArgs).not.toHaveProperty('PYTHON_VERSION');
  });

  test('builds the builder image with an overridden uv version', () => {
    const fromBuildSpy = jest
      .spyOn(DockerImage, 'fromBuild')
      .mockReturnValue({ image: 'mock-image' } as DockerImage);

    const bundling = new Bundling({
      rootDir: '/tmp/project-overridden-uv',
      runtime: Runtime.PYTHON_3_12,
      architecture: Architecture.X86_64,
      uvVersion: '0.11.6',
    });

    Reflect.get(bundling, 'createDockerImage').call(bundling);

    expect(fromBuildSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        buildArgs: expect.objectContaining({
          BUNDLING_IMAGE: Runtime.PYTHON_3_12.bundlingImage.image,
          UV_VERSION: '0.11.6',
        }),
      }),
    );
  });

  test('allows overriding the default bundling base image via build args', () => {
    const fromBuildSpy = jest
      .spyOn(DockerImage, 'fromBuild')
      .mockReturnValue({ image: 'mock-image' } as DockerImage);

    const bundling = new Bundling({
      rootDir: '/tmp/project-custom-base',
      runtime: Runtime.PYTHON_3_12,
      architecture: Architecture.X86_64,
      buildArgs: {
        BUNDLING_IMAGE: 'python:3.12-slim',
        PIP_INDEX_URL: 'https://example.com/simple',
      },
    });

    Reflect.get(bundling, 'createDockerImage').call(bundling);

    expect(fromBuildSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        buildArgs: {
          BUNDLING_IMAGE: 'python:3.12-slim',
          PIP_INDEX_URL: 'https://example.com/simple',
          UV_VERSION: DEFAULT_UV_VERSION,
        },
      }),
    );
  });

  test('uses a provided custom builder image without rebuilding the default one', () => {
    const fromBuildSpy = jest.spyOn(DockerImage, 'fromBuild');
    const customImage = { image: 'custom-builder' } as DockerImage;
    const bundling = new Bundling({
      rootDir: '/tmp/project-custom-image',
      runtime: Runtime.PYTHON_3_12,
      architecture: Architecture.X86_64,
      image: customImage,
      buildArgs: {
        BUNDLING_IMAGE: 'python:3.12-slim',
      },
    });

    const buildImage = Reflect.get(bundling, 'createDockerImage').call(
      bundling,
    ) as DockerImage;

    expect(buildImage).toBe(customImage);
    expect(fromBuildSpy).not.toHaveBeenCalled();
  });

  test('uses different builder cache keys for different uv versions', () => {
    const defaultBundling = new Bundling({
      rootDir: '/tmp/project-cache-key',
      runtime: Runtime.PYTHON_3_12,
      architecture: Architecture.X86_64,
    });
    const overriddenBundling = new Bundling({
      rootDir: '/tmp/project-cache-key',
      runtime: Runtime.PYTHON_3_12,
      architecture: Architecture.X86_64,
      uvVersion: '0.11.6',
    });

    expect(Reflect.get(defaultBundling, 'containerBuilderKey')).not.toEqual(
      Reflect.get(overriddenBundling, 'containerBuilderKey'),
    );
  });

  test('uses different builder cache keys for different bundling environments', () => {
    const defaultBundling = new Bundling({
      rootDir: '/tmp/project-cache-key-env',
      runtime: Runtime.PYTHON_3_12,
      architecture: Architecture.X86_64,
    });
    const overriddenBundling = new Bundling({
      rootDir: '/tmp/project-cache-key-env',
      runtime: Runtime.PYTHON_3_12,
      architecture: Architecture.X86_64,
      environment: {
        UV_CONCURRENT_INSTALLS: '1',
      },
    });

    expect(Reflect.get(defaultBundling, 'containerBuilderKey')).not.toEqual(
      Reflect.get(overriddenBundling, 'containerBuilderKey'),
    );
  });

  test('uses different builder cache keys for different custom builder images', () => {
    const firstBundling = new Bundling({
      rootDir: '/tmp/project-cache-key-image',
      runtime: Runtime.PYTHON_3_12,
      architecture: Architecture.X86_64,
      image: { image: 'custom-builder-one' } as DockerImage,
    });
    const secondBundling = new Bundling({
      rootDir: '/tmp/project-cache-key-image',
      runtime: Runtime.PYTHON_3_12,
      architecture: Architecture.X86_64,
      image: { image: 'custom-builder-two' } as DockerImage,
      buildArgs: {
        BUNDLING_IMAGE: 'python:3.12-slim',
      },
    });

    expect(Reflect.get(firstBundling, 'containerBuilderKey')).not.toEqual(
      Reflect.get(secondBundling, 'containerBuilderKey'),
    );
  });

  test('starts the builder container as the host user when uid and gid are available', () => {
    const ensureBuilderContainerMock = jest.fn();
    const bundlingModule = loadBundlingModule(ensureBuilderContainerMock);
    const fromBuildSpy = jest
      .spyOn(DockerImage, 'fromBuild')
      .mockReturnValue({ image: 'mock-image' } as DockerImage);

    const bundling = new bundlingModule.Bundling({
      rootDir: '/tmp/project-run-user',
      runtime: Runtime.PYTHON_3_12,
      architecture: Architecture.X86_64,
    });

    Reflect.get(bundling, 'ensureBuilderReady').call(
      bundling,
      '/tmp/cdk-run-user',
    );

    expect(fromBuildSpy).toHaveBeenCalled();
    expect(ensureBuilderContainerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        args: expect.arrayContaining([
          '--user',
          getExpectedDockerUserArg(),
          'mock-image',
        ]),
      }),
    );
  });

  test('passes supported docker run options to the builder container', () => {
    const ensureBuilderContainerMock = jest.fn();
    const bundlingModule = loadBundlingModule(ensureBuilderContainerMock);
    jest
      .spyOn(DockerImage, 'fromBuild')
      .mockReturnValue({ image: 'mock-image' } as DockerImage);

    const bundling = new bundlingModule.Bundling({
      rootDir: '/tmp/project-run-options',
      runtime: Runtime.PYTHON_3_12,
      architecture: Architecture.X86_64,
      network: 'test-network',
      securityOpt: 'label=disable',
      volumes: [
        {
          hostPath: '/tmp/cache',
          containerPath: '/cache',
        },
      ],
      volumesFrom: ['shared-container'],
    });

    Reflect.get(bundling, 'ensureBuilderReady').call(
      bundling,
      '/tmp/cdk-run-options',
    );

    expect(ensureBuilderContainerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        args: expect.arrayContaining([
          '--network',
          'test-network',
          '--security-opt',
          'label=disable',
          '-v',
          '/tmp/cache:/cache',
          '--volumes-from',
          'shared-container',
          'mock-image',
        ]),
      }),
    );
  });
});
