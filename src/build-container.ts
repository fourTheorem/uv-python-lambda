import { spawnSync } from 'node:child_process';

export const BUILDER_LABEL = 'com.fourtheorem.uv-python-lambda.builder';
const BUILDER_KEY_LABEL = 'com.fourtheorem.uv-python-lambda.builder-key';
const BUILDER_PID_LABEL = 'com.fourtheorem.uv-python-lambda.builder-owner-pid';

const managedBuilders = new Map<string, string>();

let cleanupRegistered = false;
let cleanupInProgress = false;

interface DockerResult {
  readonly stdout: string;
  readonly stderr: string;
  readonly status: number;
}

export interface BuilderContainerOptions {
  readonly name: string;
  readonly args: string[];
  readonly readyLog: string;
  readonly builderKey?: string;
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
  if (options.builderKey) {
    pruneOrphanedBuilderContainers(options.builderKey, options.name);
  }
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
  if (cleanupInProgress) {
    return;
  }

  cleanupInProgress = true;
  for (const containerId of managedBuilders.values()) {
    removeContainer(containerId);
  }
  managedBuilders.clear();
  cleanupInProgress = false;
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

function pruneOrphanedBuilderContainers(builderKey: string, currentName: string) {
  const matching = runDockerCommand([
    'ps',
    '-aq',
    '--filter',
    `label=${BUILDER_LABEL}=true`,
    '--filter',
    `label=${BUILDER_KEY_LABEL}=${builderKey}`,
  ]);

  if (matching.status !== 0) {
    throw new Error(
      `Failed to list builder containers for ${builderKey}: ${matching.stderr}`,
    );
  }

  for (const containerId of matching.stdout.split(/\s+/).filter(Boolean)) {
    const metadata = inspectBuilderMetadata(containerId);
    if (!metadata) {
      continue;
    }

    if (metadata.name === currentName) {
      continue;
    }

    const ownerPid =
      metadata.ownerPid ?? parsePidFromBuilderName(metadata.name, builderKey);
    if (ownerPid === undefined || isProcessAlive(ownerPid)) {
      continue;
    }

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

function inspectBuilderMetadata(containerId: string) {
  const result = runDockerCommand([
    'inspect',
    '--format',
    `{{.Name}}\n{{index .Config.Labels "${BUILDER_PID_LABEL}"}}`,
    containerId,
  ]);

  if (result.status !== 0) {
    return undefined;
  }

  const [rawName = '', rawOwnerPid = ''] = result.stdout.split('\n');
  return {
    name: rawName.replace(/^\//, '').trim(),
    ownerPid: parseOptionalPid(rawOwnerPid),
  };
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

  for (const event of ['beforeExit', 'exit'] as const) {
    process.once(event, cleanupBuilderContainers);
  }

  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP'] as const) {
    process.once(signal, () => {
      cleanupBuilderContainers();
      process.exit(1);
    });
  }
}

function sleep(ms: number) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function parseOptionalPid(value: string) {
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function parsePidFromBuilderName(name: string, builderKey: string) {
  const prefix = `${builderKey}-`;
  if (!name.startsWith(prefix)) {
    return undefined;
  }

  return parseOptionalPid(name.slice(prefix.length));
}

function isProcessAlive(pid: number) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'EPERM'
    ) {
      return true;
    }

    return false;
  }
}
