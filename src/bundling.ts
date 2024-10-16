import * as path from 'node:path';
import {
  AssetHashType,
  AssetStaging,
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
import type { BundlingOptions, ICommandHooks } from './types';

export const HASHABLE_DEPENDENCIES_EXCLUDE = ['*.pyc'];

export const DEFAULT_ASSET_EXCLUDES = [
  '.venv/',
  'node_modules/',
  'cdk.out/',
  '.git/',
];

interface BundlingCommandOptions {
  readonly rootDir: string;
  readonly workspacePackage?: string;
  readonly inputDir: string;
  readonly outputDir: string;
  readonly assetExcludes: string[];
  readonly commandHooks?: ICommandHooks;
}

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
}

/**
 * Bundling options for Python Lambda assets
 */
export class Bundling {
  public static bundle(options: BundlingProps): AssetCode {
    return Code.fromAsset(options.rootDir, {
      assetHashType: AssetHashType.SOURCE,
      exclude: HASHABLE_DEPENDENCIES_EXCLUDE,
      bundling: options.skip ? undefined : new Bundling(options),
    });
  }

  public readonly image: DockerImage;
  public readonly entrypoint?: string[] | undefined;
  public readonly command: string[] | undefined;
  public readonly volumes?: DockerVolume[] | undefined;
  public readonly volumesFrom?: string[] | undefined;
  public readonly environment?: { [key: string]: string } | undefined;
  public readonly workingDirectory?: string | undefined;
  public readonly user?: string | undefined;
  public readonly securityOpt?: string | undefined;
  public readonly network?: string | undefined;
  public readonly bundlingFileAccess?: BundlingFileAccess | undefined;

  constructor(props: BundlingProps) {
    const {
      rootDir,
      workspacePackage,
      image,
      runtime,
      commandHooks,
      assetExcludes = DEFAULT_ASSET_EXCLUDES,
      architecture = Architecture.ARM_64,
    } = props;

    const bundlingCommands = this.createBundlingCommands({
      rootDir,
      workspacePackage,
      assetExcludes,
      commandHooks,
      inputDir: AssetStaging.BUNDLING_INPUT_DIR,
      outputDir: AssetStaging.BUNDLING_OUTPUT_DIR,
    });

    this.image =
      image ??
      DockerImage.fromBuild(path.resolve(__dirname, '..', 'resources'), {
        buildArgs: {
          ...props.buildArgs,
          IMAGE: runtime.bundlingImage.image,
        },
        platform: architecture.dockerPlatform,
      });

    this.command = props.command ?? [
      'bash',
      '-c',
      bundlingCommands.join(' && '),
    ];
    this.entrypoint = props.entrypoint;
    this.volumes = props.volumes;
    this.volumesFrom = props.volumesFrom;
    this.environment = props.environment;
    this.workingDirectory = props.workingDirectory;
    this.user = props.user;
    this.securityOpt = props.securityOpt;
    this.network = props.network;
    this.bundlingFileAccess = props.bundlingFileAccess;
  }

  private createBundlingCommands(options: BundlingCommandOptions): string[] {
    const excludeArgs = options.assetExcludes.map((exclude) => `--exclude="${exclude}"`);
    const workspacePackage = options.workspacePackage;
    const uvCommonArgs = `--directory ${options.outputDir}`;
    const uvPackageArgs = workspacePackage ? `--package ${workspacePackage}` : '';
    const reqsFile = `/tmp/requirements${workspacePackage || ''}.txt`;
    const commands = [];
    commands.push(
      ...options.commandHooks?.beforeBundling(options.inputDir, options.outputDir) ?? [],
    );
    commands.push(...[
      `rsync -rLv ${excludeArgs.join(' ')} ${options.inputDir}/ ${options.outputDir}`,
      `cd ${options.outputDir}`, // uv pip install needs to be run from here for editable deps to relative paths to be resolved
      `uv sync ${uvCommonArgs} ${uvPackageArgs} --python-preference=only-system --compile-bytecode --no-dev --frozen --no-editable --link-mode=copy`,
      `uv export ${uvCommonArgs} ${uvPackageArgs} --no-dev --frozen --no-editable > ${reqsFile}`,
      `uv pip install -r ${reqsFile} --target ${options.outputDir} --reinstall --compile-bytecode --link-mode=copy`, // --editable $(grep -e "^\./" ${reqsFile})`,
      `rm -rf ${options.outputDir}/.venv`,
    ]);
    commands.push(
      ...options.commandHooks?.afterBundling(options.inputDir, options.outputDir) ?? [],
    );

    return commands;
  }
}
