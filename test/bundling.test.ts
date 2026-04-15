import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Bundling } from '../src/bundling';
import type { ICommandHooks } from '../src/types';

function decodeCommands(value: string) {
  return JSON.parse(Buffer.from(value, 'base64').toString('utf8')) as string[];
}

describe('Bundling', () => {
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
});
