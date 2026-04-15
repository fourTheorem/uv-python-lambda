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
