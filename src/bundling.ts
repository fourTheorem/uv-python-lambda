import { mkdirSync } from 'node:fs';
import * as path from 'node:path';
const hash = require('object-hash');

import {
  AssetHashType,
  type BundlingFileAccess,
  DockerImage,
  type DockerVolume,
} from 'aws-cdk-lib';
import {
  Architecture,
  type AssetCode,
  Code,
  type Runtime,
} from 'aws-cdk-lib/aws-lambda';
import { BUILDER_LABEL, ensureBuilderContainer } from './build-container';
import type { BundlingOptions, ICommandHooks } from './types';

export const HASHABLE_DEPENDENCIES_EXCLUDE = [
  '*.pyc',
  'cdk.out/**',
  '**/cdk.out/**',
  'cdk/**',
  '**/cdk/**',
  '.git/**',
  '.venv/**',
];

export const DEFAULT_ASSET_EXCLUDES = [
  '.venv/',
  'node_modules/',
  'cdk.out/',
  '**/cdk.out/**',
  'cdk/',
  '**/cdk/**',
  '.git/',
];

export const DEFAULT_UV_VERSION = '0.5.27';

const BUILDER_TOOL_DIR = '/opt/uv-python-lambda';
const BUILDER_READY_LOG = 'Builder container is ready and waiting';
const BUILDER_NOFILE_LIMIT = '1048576:1048576';
const BUILDER_OWNER_PID_LABEL =
  'com.fourtheorem.uv-python-lambda.builder-owner-pid';

export interface BundlingProps extends BundlingOptions {
  /**
   * uv project root (workspace root)
   */
  readonly rootDir: string;

  /**
   * uv package to use for the Lambda Function
   */
  readonly workspacePackage?: string;

  /**
   * Lambda runtime (must be one of the Python runtimes)
   */
  readonly runtime: Runtime;

  /**
   * Lambda CPU architecture
   *
   * @default Architecture.ARM_64
   */
  readonly architecture?: Architecture;

  /**
   * Skip bundling process
   *
   * @default false
   */
  readonly skip?: boolean;

  /**
   * Glob patterns to exclude from asset hash fingerprinting used for source change
   * detection
   *
   * @default HASHABLE_DEPENDENCIES_EXCLUDE
   */
  readonly hashableAssetExclude?: string[];
}

/**
 * Bundling options for Python Lambda assets
 */
export class Bundling {
  private static readonly buildImages: Record<string, DockerImage> = {};

  public static bundle(options: BundlingProps): AssetCode {
    const {
      hashableAssetExclude,
      assetHashType = AssetHashType.SOURCE,
      assetHash,
      ...bundlingOptions
    } = options;
    const mergedHashableAssetExclude = dedupePatterns([
      ...HASHABLE_DEPENDENCIES_EXCLUDE,
      ...(hashableAssetExclude ?? []),
    ]);

    const bundling = new Bundling(bundlingOptions);
    const cdkOutDir = getCdkOutDir();
    const hostFunctionOutputDir = bundling.getHostFunctionOutputDir(cdkOutDir);
    const hostFunctionWorkspaceDir =
      bundling.getHostFunctionWorkspaceDir(cdkOutDir);
    const hostFunctionArchivePath =
      bundling.getHostFunctionArchivePath(cdkOutDir);

    if (bundling.skip) {
      mkdirSync(hostFunctionOutputDir, { recursive: true });
      return Code.fromCustomCommand(
        hostFunctionOutputDir,
        bundling.createBundlingCommand(),
        {
          assetHash,
          assetHashType,
          exclude: mergedHashableAssetExclude,
        },
      );
    }

    mkdirSync(hostFunctionWorkspaceDir, { recursive: true });

    bundling.ensureBuilderReady(cdkOutDir);

    return Code.fromCustomCommand(
      hostFunctionArchivePath,
      bundling.createBundlingCommand(),
      {
        assetHash,
        assetHashType,
        exclude: mergedHashableAssetExclude,
      },
    );
  }

  public readonly entrypoint?: string[];
  public readonly command?: string[];
  public readonly volumes?: DockerVolume[];
  public readonly volumesFrom?: string[];
  public readonly environment?: { [key: string]: string };
  public readonly workingDirectory?: string;
  public readonly user?: string;
  public readonly securityOpt?: string;
  public readonly network?: string;
  public readonly bundlingFileAccess?: BundlingFileAccess;
  public readonly skip: boolean;

  private readonly assetExcludes: string[];
  private readonly commandHooks?: ICommandHooks;
  private readonly containerBuilderKey: string;
  private readonly containerBuilderName: string;
  private readonly functionOutDir: string;
  private readonly outputPathSuffix?: string;
  private readonly props: BundlingProps;

  constructor(props: BundlingProps) {
    warnForUnsupportedOptions(props);
    this.props = props;
    this.entrypoint = props.entrypoint;
    this.command = props.command;
    this.volumes = props.volumes;
    this.volumesFrom = props.volumesFrom;
    this.environment = props.environment;
    this.workingDirectory = props.workingDirectory;
    this.user = props.user;
    this.securityOpt = props.securityOpt;
    this.network = props.network;
    this.bundlingFileAccess = props.bundlingFileAccess;
    this.assetExcludes = dedupePatterns([
      ...DEFAULT_ASSET_EXCLUDES,
      ...(props.assetExcludes ?? []),
    ]);
    this.commandHooks = props.commandHooks;
    this.outputPathSuffix = props.outputPathSuffix;
    this.skip = !!props.skip;

    if (props.skip) {
      this.containerBuilderKey = 'skipped';
      this.containerBuilderName = 'skipped';
      this.functionOutDir = 'skipped';
      return;
    }

    const hashableProperties = {
      runtime: props.runtime.name,
      architecture: props.architecture ?? Architecture.ARM_64,
      environment: getBuilderEnvironment(props.environment),
      rootDir: path.resolve(props.rootDir),
      builderImage: props.image
        ? { image: props.image.image }
        : {
            buildArgs: this.getDefaultBuilderBuildArgs(),
          },
    };

    this.containerBuilderKey = `uv-bundling-${hash(hashableProperties)}`;
    this.containerBuilderName = `${this.containerBuilderKey}-${process.pid}`;
    this.functionOutDir = sanitizeOutputComponent(
      props.workspacePackage ?? '$$uv_root',
    );
  }

  private ensureBuilderReady(cdkOutDir: string) {
    const buildImage = this.createDockerImage();
    const hostUvBuildDir = path.join(cdkOutDir, this.containerBuilderKey);
    const hostRootDir = path.resolve(this.props.rootDir);
    const builderUser = getDockerUserArg();

    mkdirSync(hostUvBuildDir, { recursive: true });

    const dockerArgs = [
      'run',
      '-d',
      '--label',
      `${BUILDER_LABEL}=true`,
      '--label',
      `com.fourtheorem.uv-python-lambda.builder-key=${this.containerBuilderKey}`,
      '--label',
      `${BUILDER_OWNER_PID_LABEL}=${process.pid}`,
      '--name',
      this.containerBuilderName,
    ];

    if (builderUser) {
      dockerArgs.push('--user', builderUser);
    }

    if (this.network) {
      dockerArgs.push('--network', this.network);
    }

    if (this.securityOpt) {
      dockerArgs.push('--security-opt', this.securityOpt);
    }

    for (const volume of this.volumes ?? []) {
      const mount = `${volume.hostPath}:${volume.containerPath}`;
      const consistency = volume.consistency ? `:${volume.consistency}` : '';
      dockerArgs.push('-v', `${mount}${consistency}`);
    }

    for (const volumeSource of this.volumesFrom ?? []) {
      dockerArgs.push('--volumes-from', volumeSource);
    }

    for (const [name, value] of this.getBuilderEnvironmentEntries()) {
      dockerArgs.push('--env', `${name}=${value}`);
    }

    dockerArgs.push(
      '--ulimit',
      `nofile=${BUILDER_NOFILE_LIMIT}`,
      '-v',
      `${hostUvBuildDir}:/uvbuild`,
      '-v',
      `${hostRootDir}:/src:ro`,
      buildImage.image,
    );

    ensureBuilderContainer({
      builderKey: this.containerBuilderKey,
      name: this.containerBuilderName,
      args: dockerArgs,
      readyLog: BUILDER_READY_LOG,
    });
  }

  private createBundlingCommand(): string[] {
    if (this.skip) {
      return [process.execPath, '-e', 'process.exit(0)'];
    }

    const containerOutputDir = this.getContainerFunctionOutputDir();
    const containerArchivePath = this.getContainerFunctionArchivePath();
    const command = ['docker', 'exec'];
    const builderUser = getDockerUserArg();

    if (builderUser) {
      command.push('--user', builderUser);
    }

    for (const [name, value] of this.getBuilderEnvironmentEntries()) {
      command.push('-e', `${name}=${value}`);
    }

    command.push(
      this.containerBuilderName,
      `${BUILDER_TOOL_DIR}/export.sh`,
      '--output',
      containerOutputDir,
      '--output-zip',
      containerArchivePath,
    );

    if (this.props.workspacePackage) {
      command.push('--package', this.props.workspacePackage);
    }

    for (const exclude of this.assetExcludes) {
      command.push('--exclude', exclude);
    }

    const beforeHooks = this.commandHooks?.beforeBundling(
      '/src',
      containerOutputDir,
    );
    if (beforeHooks && beforeHooks.length > 0) {
      command.push('--before-hooks', encodeCommands(beforeHooks));
    }

    const afterHooks = this.commandHooks?.afterBundling(
      '/src',
      containerOutputDir,
    );
    if (afterHooks && afterHooks.length > 0) {
      command.push('--after-hooks', encodeCommands(afterHooks));
    }

    return command;
  }

  private createDockerImage(): DockerImage {
    const imageKey = this.containerBuilderKey;
    const existing = Bundling.buildImages[imageKey];
    if (existing) {
      return existing;
    }

    const buildImage =
      this.props.image ??
      DockerImage.fromBuild(path.resolve(__dirname, '..', 'resources'), {
        buildArgs: this.getDefaultBuilderBuildArgs(),
        platform: (this.props.architecture ?? Architecture.ARM_64)
          .dockerPlatform,
      });

    Bundling.buildImages[imageKey] = buildImage;
    return buildImage;
  }

  private getContainerFunctionOutputDir() {
    return toPosixPath(
      path.join(
        '/uvbuild',
        this.functionOutDir,
        'bundle',
        this.outputPathSuffix ?? '',
      ),
    );
  }

  private getHostFunctionOutputDir(cdkOutDir: string) {
    return path.join(
      this.getHostFunctionWorkspaceDir(cdkOutDir),
      'bundle',
      this.outputPathSuffix ?? '',
    );
  }

  private getContainerFunctionArchivePath() {
    return toPosixPath(path.join('/uvbuild', this.functionOutDir, 'asset.zip'));
  }

  private getHostFunctionWorkspaceDir(cdkOutDir: string) {
    return path.join(
      cdkOutDir,
      this.containerBuilderKey,
      this.functionOutDir,
    );
  }

  private getHostFunctionArchivePath(cdkOutDir: string) {
    return path.join(
      this.getHostFunctionWorkspaceDir(cdkOutDir),
      'asset.zip',
    );
  }

  private getBuilderEnvironmentEntries(): [string, string][] {
    return Object.entries(getBuilderEnvironment(this.environment)).sort(
      ([a], [b]) => a.localeCompare(b),
    );
  }

  private getDefaultBuilderBuildArgs(): Record<string, string> {
    return {
      ...this.props.buildArgs,
      UV_VERSION: this.props.uvVersion ?? DEFAULT_UV_VERSION,
      BUNDLING_IMAGE:
        this.props.buildArgs?.BUNDLING_IMAGE ??
        this.props.runtime.bundlingImage.image,
    };
  }
}

function encodeCommands(commands: string[]) {
  return Buffer.from(JSON.stringify(commands), 'utf8').toString('base64');
}

function getCdkOutDir() {
  const cdkOutDir = process.env.CDK_OUTDIR;
  if (!cdkOutDir) {
    throw new Error('CDK_OUTDIR must be set before bundling Lambda assets');
  }
  return path.resolve(cdkOutDir);
}

function sanitizeOutputComponent(value: string) {
  return value.replace(/[^A-Za-z0-9._-]/g, '_');
}

function toPosixPath(value: string) {
  return value.split(path.sep).join(path.posix.sep);
}

function dedupePatterns(patterns: string[]) {
  return [...new Set(patterns)];
}

function getBuilderEnvironment(
  environment?: Record<string, string>,
): Record<string, string> {
  return {
    UV_PYTHON_LAMBDA_NOFILE_LIMIT: BUILDER_NOFILE_LIMIT.split(':')[0],
    // Cap uv concurrency to avoid system-wide file descriptor exhaustion
    // during parallel extraction (os error 23: ENFILE).
    UV_CONCURRENT_DOWNLOADERS: '4',
    UV_CONCURRENT_BUILDS: '2',
    ...environment,
  };
}

function getDockerUserArg() {
  if (
    typeof process.getuid !== 'function' ||
    typeof process.getgid !== 'function'
  ) {
    return undefined;
  }

  return `${process.getuid()}:${process.getgid()}`;
}

function warnForUnsupportedOptions(props: BundlingProps) {
  if (props.entrypoint) {
    emitDeprecatedBundlingOptionWarning(
      'entrypoint',
      'This construct manages the reusable builder container entrypoint internally. Use bundling.image for a fully custom builder image.',
    );
  }

  if (props.command) {
    emitDeprecatedBundlingOptionWarning(
      'command',
      'This construct manages the reusable builder container command internally. Use bundling.image for a fully custom builder image.',
    );
  }

  if (props.workingDirectory) {
    emitDeprecatedBundlingOptionWarning(
      'workingDirectory',
      'The reusable builder container manages its own working directory. Use command hooks or bundling.image if you need different behavior.',
    );
  }

  if (props.platform) {
    emitDeprecatedBundlingOptionWarning(
      'platform',
      'The builder image platform is derived from the Lambda architecture option. Set architecture instead.',
    );
  }
}

function emitDeprecatedBundlingOptionWarning(option: string, details: string) {
  process.emitWarning(
    `bundling.${option} is deprecated and ignored. ${details}`,
    'DeprecationWarning',
  );
}
