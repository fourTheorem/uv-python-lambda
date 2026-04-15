import { spawnSync } from 'node:child_process';

export const BUILDER_LABEL = 'com.fourtheorem.uv-python-lambda.builder';

const managedBuilders = new Map<string, string>();

let cleanupRegistered = false;

interface DockerResult {
  readonly stdout: string;
  readonly stderr: string;
  readonly status: number;
}

export interface BuilderContainerOptions {
  readonly name: string;
  readonly args: string[];
  readonly readyLog: string;
  readonly timeoutMs?: number;
}

export function ensureBuilderContainer(
  options: BuilderContainerOptions,
): string {
  registerCleanupHandlers();

  const existing = managedBuilders.get(options.name);
  if (existing) {
    return existing;
  }

  pruneExitedBuilderContainers();
  removeContainer(options.name);

  const dockerRun = runDockerCommand(options.args);
  if (dockerRun.status !== 0) {
    throw new Error(
      `Failed to start uv-python-lambda builder container: ${dockerRun.stderr}`,
    );
  }

  const containerId = dockerRun.stdout.trim();

  try {
    waitForContainerReady(
      containerId,
      options.readyLog,
      options.timeoutMs ?? 60_000,
    );
  } catch (error) {
    removeContainer(containerId);
    throw error;
  }

  managedBuilders.set(options.name, containerId);
  return containerId;
}

export function cleanupBuilderContainers() {
  for (const containerId of managedBuilders.values()) {
    removeContainer(containerId);
  }
  managedBuilders.clear();
}

export function getManagedBuilderContainerNames(): string[] {
  return [...managedBuilders.keys()];
}

export function pruneExitedBuilderContainers() {
  const exited = runDockerCommand([
    'ps',
    '-aq',
    '--filter',
    `label=${BUILDER_LABEL}=true`,
    '--filter',
    'status=exited',
  ]);

  if (exited.status !== 0) {
    throw new Error(
      `Failed to list exited builder containers: ${exited.stderr}`,
    );
  }

  for (const containerId of exited.stdout.split(/\s+/).filter(Boolean)) {
    removeContainer(containerId);
  }
}

function waitForContainerReady(
  containerId: string,
  readyLog: string,
  timeoutMs: number,
) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const state = inspectContainerState(containerId);
    const logs = readContainerLogs(containerId);

    if (state === 'running' && logs.includes(readyLog)) {
      return;
    }

    if (state === 'exited') {
      throw new Error(
        `Builder container ${containerId} exited before becoming ready.\n${logs}`,
      );
    }

    sleep(250);
  }

  throw new Error(
    `Builder container ${containerId} did not become ready within ${timeoutMs}ms.\n${readContainerLogs(
      containerId,
    )}`,
  );
}

function inspectContainerState(
  containerId: string,
): 'running' | 'exited' | 'missing' {
  const result = runDockerCommand([
    'inspect',
    '--format',
    '{{if .State.Running}}running{{else}}exited{{end}}',
    containerId,
  ]);

  if (result.status !== 0) {
    return 'missing';
  }

  return result.stdout.trim() === 'running' ? 'running' : 'exited';
}

function readContainerLogs(containerId: string): string {
  const result = runDockerCommand(['logs', containerId]);
  return [result.stdout, result.stderr].filter(Boolean).join('\n');
}

function removeContainer(containerIdOrName: string) {
  runDockerCommand(['rm', '-f', containerIdOrName]);
}

function runDockerCommand(args: string[]): DockerResult {
  const result = spawnSync('docker', args, {
    encoding: 'utf8',
  });

  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    status: result.status ?? 1,
  };
}

function registerCleanupHandlers() {
  if (cleanupRegistered) {
    return;
  }

  cleanupRegistered = true;

  process.on('exit', cleanupBuilderContainers);
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, () => {
      cleanupBuilderContainers();
      process.exit(1);
    });
  }
}

function sleep(ms: number) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}
