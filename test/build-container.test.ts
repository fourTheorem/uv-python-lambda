type SpawnSyncResult = {
  readonly status?: number | null;
  readonly stdout?: string;
  readonly stderr?: string;
};

type BuildContainerModule = typeof import('../src/build-container');

function dockerResult(result: SpawnSyncResult = {}): SpawnSyncResult {
  return {
    status: 0,
    stdout: '',
    stderr: '',
    ...result,
  };
}

function loadBuildContainerModule(spawnSyncMock: jest.Mock) {
  let loadedModule: BuildContainerModule | undefined;

  jest.isolateModules(() => {
    jest.doMock('node:child_process', () => ({
      spawnSync: spawnSyncMock,
    }));
    loadedModule = require('../src/build-container') as BuildContainerModule;
  });

  if (!loadedModule) {
    throw new Error('Failed to load build-container module');
  }

  return loadedModule;
}

describe('build-container', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('throws when docker run fails to start the builder container', () => {
    const spawnSyncMock = jest
      .fn()
      .mockReturnValueOnce(dockerResult())
      .mockReturnValueOnce(dockerResult())
      .mockReturnValueOnce(dockerResult({ status: 1, stderr: 'boom' }));

    const buildContainer = loadBuildContainerModule(spawnSyncMock);

    expect(() =>
      buildContainer.ensureBuilderContainer({
        name: 'builder',
        args: ['run', 'image'],
        readyLog: 'ready',
      }),
    ).toThrow('Failed to start uv-python-lambda builder container: boom');
  });

  test('removes the container when it exits before becoming ready', () => {
    const spawnSyncMock = jest
      .fn()
      .mockReturnValueOnce(dockerResult())
      .mockReturnValueOnce(dockerResult())
      .mockReturnValueOnce(dockerResult({ stdout: 'container-id\n' }))
      .mockReturnValueOnce(dockerResult({ stdout: 'exited' }))
      .mockReturnValueOnce(dockerResult({ stderr: 'container failed' }))
      .mockReturnValueOnce(dockerResult());

    const buildContainer = loadBuildContainerModule(spawnSyncMock);

    expect(() =>
      buildContainer.ensureBuilderContainer({
        name: 'builder',
        args: ['run', 'image'],
        readyLog: 'ready',
      }),
    ).toThrow('exited before becoming ready');

    expect(spawnSyncMock).toHaveBeenLastCalledWith(
      'docker',
      ['rm', '-f', 'container-id'],
      { encoding: 'utf8' },
    );
  });

  test('throws when pruning exited builder containers fails', () => {
    const spawnSyncMock = jest
      .fn()
      .mockReturnValueOnce(
        dockerResult({ status: 1, stderr: 'docker ps failed' }),
      );

    const buildContainer = loadBuildContainerModule(spawnSyncMock);

    expect(() => buildContainer.pruneExitedBuilderContainers()).toThrow(
      'Failed to list exited builder containers: docker ps failed',
    );
  });

  test('prunes exited builder containers by id', () => {
    const spawnSyncMock = jest
      .fn()
      .mockReturnValueOnce(dockerResult({ stdout: 'a\nb\n' }))
      .mockReturnValueOnce(dockerResult())
      .mockReturnValueOnce(dockerResult());

    const buildContainer = loadBuildContainerModule(spawnSyncMock);

    buildContainer.pruneExitedBuilderContainers();

    expect(spawnSyncMock).toHaveBeenNthCalledWith(
      2,
      'docker',
      ['rm', '-f', 'a'],
      { encoding: 'utf8' },
    );
    expect(spawnSyncMock).toHaveBeenNthCalledWith(
      3,
      'docker',
      ['rm', '-f', 'b'],
      { encoding: 'utf8' },
    );
  });

  test('removes stale running builders for the same key when the owner pid is gone', () => {
    const spawnSyncMock = jest
      .fn()
      .mockReturnValueOnce(dockerResult())
      .mockReturnValueOnce(dockerResult({ stdout: 'stale-container\n' }))
      .mockReturnValueOnce(dockerResult({ stdout: '/builder-key-123\n123\n' }))
      .mockReturnValueOnce(dockerResult())
      .mockReturnValueOnce(dockerResult())
      .mockReturnValueOnce(dockerResult({ stdout: 'container-id\n' }))
      .mockReturnValueOnce(dockerResult({ stdout: 'running' }))
      .mockReturnValueOnce(dockerResult({ stdout: 'ready' }));
    const processKillSpy = jest
      .spyOn(process, 'kill')
      .mockImplementation(((_pid: number, _signal?: number | NodeJS.Signals) => {
        const error = new Error('missing process') as NodeJS.ErrnoException;
        error.code = 'ESRCH';
        throw error;
      }) as typeof process.kill);

    const buildContainer = loadBuildContainerModule(spawnSyncMock);

    buildContainer.ensureBuilderContainer({
      name: 'builder-key-999',
      builderKey: 'builder-key',
      args: ['run', 'image'],
      readyLog: 'ready',
    });

    expect(processKillSpy).toHaveBeenCalledWith(123, 0);
    expect(spawnSyncMock).toHaveBeenCalledWith(
      'docker',
      ['rm', '-f', 'stale-container'],
      { encoding: 'utf8' },
    );

    processKillSpy.mockRestore();
  });

  test('keeps running builders for the same key when the owner pid is still alive', () => {
    const spawnSyncMock = jest
      .fn()
      .mockReturnValueOnce(dockerResult())
      .mockReturnValueOnce(dockerResult({ stdout: 'live-container\n' }))
      .mockReturnValueOnce(dockerResult({ stdout: '/builder-key-456\n456\n' }))
      .mockReturnValueOnce(dockerResult())
      .mockReturnValueOnce(dockerResult({ stdout: 'container-id\n' }))
      .mockReturnValueOnce(dockerResult({ stdout: 'running' }))
      .mockReturnValueOnce(dockerResult({ stdout: 'ready' }));
    const processKillSpy = jest
      .spyOn(process, 'kill')
      .mockImplementation(
        ((_pid: number, _signal?: number | NodeJS.Signals) =>
          true) as typeof process.kill,
      );

    const buildContainer = loadBuildContainerModule(spawnSyncMock);

    buildContainer.ensureBuilderContainer({
      name: 'builder-key-999',
      builderKey: 'builder-key',
      args: ['run', 'image'],
      readyLog: 'ready',
    });

    expect(processKillSpy).toHaveBeenCalledWith(456, 0);
    expect(spawnSyncMock).not.toHaveBeenCalledWith(
      'docker',
      ['rm', '-f', 'live-container'],
      { encoding: 'utf8' },
    );

    processKillSpy.mockRestore();
  });

  test('falls back to the builder name pid when older containers lack an owner label', () => {
    const spawnSyncMock = jest
      .fn()
      .mockReturnValueOnce(dockerResult())
      .mockReturnValueOnce(dockerResult({ stdout: 'stale-container\n' }))
      .mockReturnValueOnce(dockerResult({ stdout: '/builder-key-123\n\n' }))
      .mockReturnValueOnce(dockerResult())
      .mockReturnValueOnce(dockerResult())
      .mockReturnValueOnce(dockerResult({ stdout: 'container-id\n' }))
      .mockReturnValueOnce(dockerResult({ stdout: 'running' }))
      .mockReturnValueOnce(dockerResult({ stdout: 'ready' }));
    const processKillSpy = jest
      .spyOn(process, 'kill')
      .mockImplementation(((_pid: number, _signal?: number | NodeJS.Signals) => {
        const error = new Error('missing process') as NodeJS.ErrnoException;
        error.code = 'ESRCH';
        throw error;
      }) as typeof process.kill);

    const buildContainer = loadBuildContainerModule(spawnSyncMock);

    buildContainer.ensureBuilderContainer({
      name: 'builder-key-999',
      builderKey: 'builder-key',
      args: ['run', 'image'],
      readyLog: 'ready',
    });

    expect(processKillSpy).toHaveBeenCalledWith(123, 0);
    expect(spawnSyncMock).toHaveBeenCalledWith(
      'docker',
      ['rm', '-f', 'stale-container'],
      { encoding: 'utf8' },
    );

    processKillSpy.mockRestore();
  });

  test('times out when the builder never becomes ready', () => {
    const spawnSyncMock = jest
      .fn()
      .mockReturnValueOnce(dockerResult())
      .mockReturnValueOnce(dockerResult())
      .mockReturnValueOnce(dockerResult({ stdout: 'container-id\n' }))
      .mockReturnValueOnce(dockerResult({ status: 1 }))
      .mockReturnValueOnce(dockerResult({ stdout: 'still starting' }))
      .mockReturnValueOnce(dockerResult({ stdout: 'still starting' }))
      .mockReturnValueOnce(dockerResult());

    const nowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(2);

    const buildContainer = loadBuildContainerModule(spawnSyncMock);

    expect(() =>
      buildContainer.ensureBuilderContainer({
        name: 'builder',
        args: ['run', 'image'],
        readyLog: 'ready',
        timeoutMs: 1,
      }),
    ).toThrow('did not become ready within 1ms');

    expect(spawnSyncMock).toHaveBeenLastCalledWith(
      'docker',
      ['rm', '-f', 'container-id'],
      { encoding: 'utf8' },
    );

    nowSpy.mockRestore();
  });

  test('registers signal cleanup handlers that stop managed containers', () => {
    const spawnSyncMock = jest
      .fn()
      .mockReturnValueOnce(dockerResult())
      .mockReturnValueOnce(dockerResult())
      .mockReturnValueOnce(dockerResult({ stdout: 'container-id\n' }))
      .mockReturnValueOnce(dockerResult({ stdout: 'running' }))
      .mockReturnValueOnce(dockerResult({ stdout: 'ready' }))
      .mockReturnValueOnce(dockerResult());

    const listeners = new Map<string, () => void>();
    const processOnSpy = jest.spyOn(process, 'on').mockImplementation(((
      event: string,
      listener: () => void,
    ) => {
      listeners.set(event, listener);
      return process;
    }) as typeof process.on);
    const processExitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation(
        ((_code?: number) => undefined as never) as typeof process.exit,
      );

    const buildContainer = loadBuildContainerModule(spawnSyncMock);

    buildContainer.ensureBuilderContainer({
      name: 'builder',
      args: ['run', 'image'],
      readyLog: 'ready',
    });

    expect(listeners.has('beforeExit')).toBe(true);
    expect(listeners.has('exit')).toBe(true);
    listeners.get('SIGINT')?.();

    expect(buildContainer.getManagedBuilderContainerNames()).toHaveLength(0);
    expect(processExitSpy).toHaveBeenCalledWith(1);
    expect(spawnSyncMock).toHaveBeenLastCalledWith(
      'docker',
      ['rm', '-f', 'container-id'],
      { encoding: 'utf8' },
    );

    processOnSpy.mockRestore();
    processExitSpy.mockRestore();
  });
});
