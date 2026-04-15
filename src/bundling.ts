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
  'cdk/**',
  '.git/**',
  '.venv/**',
];

export const DEFAULT_ASSET_EXCLUDES = [
  '.venv/',
  'node_modules/',
  'cdk.out/',
  '.git/',
  'cdk',
];

const BUILDER_READY_LOG = 'Builder container is ready and waiting';

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
      hashableAssetExclude = HASHABLE_DEPENDENCIES_EXCLUDE,
      assetHashType = AssetHashType.SOURCE,
      assetHash,
      ...bundlingOptions
    } = options;

    const bundling = new Bundling(bundlingOptions);
    const cdkOutDir = getCdkOutDir();
    const hostFunctionOutputDir = bundling.getHostFunctionOutputDir(cdkOutDir);

    mkdirSync(hostFunctionOutputDir, { recursive: true });

    if (!bundling.skip) {
      bundling.ensureBuilderReady(cdkOutDir);
    }

    return Code.fromCustomCommand(
      hostFunctionOutputDir,
      bundling.createBundlingCommand(),
      {
        assetHash,
        assetHashType,
        exclude: hashableAssetExclude,
      },
    );
  }

  public readonly entrypoint?: string[];
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
    this.props = props;
    this.entrypoint = props.entrypoint;
    this.volumes = props.volumes;
    this.volumesFrom = props.volumesFrom;
    this.environment = props.environment;
    this.workingDirectory = props.workingDirectory;
    this.user = props.user;
    this.securityOpt = props.securityOpt;
    this.network = props.network;
    this.bundlingFileAccess = props.bundlingFileAccess;
    this.assetExcludes = props.assetExcludes ?? DEFAULT_ASSET_EXCLUDES;
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
      buildArgs: props.buildArgs,
      rootDir: props.rootDir,
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

    mkdirSync(hostUvBuildDir, { recursive: true });

    const dockerArgs = [
      'run',
      '-d',
      '--label',
      `${BUILDER_LABEL}=true`,
      '--label',
      `com.fourtheorem.uv-python-lambda.builder-key=${this.containerBuilderKey}`,
      '--name',
      this.containerBuilderName,
      '-v',
      `${hostUvBuildDir}:/uvbuild`,
      '-v',
      `${this.props.rootDir}:/src:ro`,
      buildImage.image,
    ];

    ensureBuilderContainer({
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
    const command = [
      'docker',
      'exec',
      this.containerBuilderName,
      '/root/export.sh',
      '--output',
      containerOutputDir,
    ];

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

    const buildImage = DockerImage.fromBuild(
      path.resolve(__dirname, '..', 'resources'),
      {
        buildArgs: {
          ...this.props.buildArgs,
          IMAGE: this.props.runtime.bundlingImage.image,
          IMAGE_ARCH:
            this.props.architecture === Architecture.X86_64
              ? 'x86_64'
              : 'arm64',
          PYTHON_VERSION: this.props.runtime.name.slice(6),
          BUNDLING_IMAGE: this.props.runtime.bundlingImage.image,
        },
        platform: (this.props.architecture ?? Architecture.ARM_64)
          .dockerPlatform,
      },
    );

    Bundling.buildImages[imageKey] = buildImage;
    return buildImage;
  }

  private getContainerFunctionOutputDir() {
    return toPosixPath(
      path.join('/uvbuild', this.functionOutDir, this.outputPathSuffix ?? ''),
    );
  }

  private getHostFunctionOutputDir(cdkOutDir: string) {
    return path.join(
      cdkOutDir,
      this.containerBuilderKey,
      this.functionOutDir,
      this.outputPathSuffix ?? '',
    );
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
  return cdkOutDir;
}

function sanitizeOutputComponent(value: string) {
  return value.replace(/[^A-Za-z0-9._-]/g, '_');
}

function toPosixPath(value: string) {
  return value.split(path.sep).join(path.posix.sep);
}
