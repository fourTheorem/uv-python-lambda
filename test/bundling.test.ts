import { DockerImage } from 'aws-cdk-lib';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Bundling, DEFAULT_UV_VERSION } from '../src/bundling';
import type { ICommandHooks } from '../src/types';

function decodeCommands(value: string) {
  return JSON.parse(Buffer.from(value, 'base64').toString('utf8')) as string[];
}

describe('Bundling', () => {
  afterEach(() => {
    jest.restoreAllMocks();
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

    expect(fromBuildSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        buildArgs: expect.objectContaining({
          UV_VERSION: DEFAULT_UV_VERSION,
        }),
      }),
    );
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
          UV_VERSION: '0.11.6',
        }),
      }),
    );
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
});
