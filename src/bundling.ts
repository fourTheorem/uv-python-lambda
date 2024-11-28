import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
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
import { BundlingStrategy } from './types';

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
  public static bundle(options: BundlingProps): AssetCode {
    const {
      hashableAssetExclude = HASHABLE_DEPENDENCIES_EXCLUDE,
      ...bundlingOptions
    } = options;
    switch (options.bundlingStrategy) {
      case BundlingStrategy.PACKAGE_VERSION:
        return Bundling.packageVersionStrategy(bundlingOptions);
      default:
        return Bundling.sourceStrategy(bundlingOptions);
    }
  }

  /**
   * Uses the AssetHashType.SOURCE strategy to calculate the asset hash.
   *
   * If there are multiple functions being created from a workspace they will all be rebuilt if the source changes.
   *
   * @param options
   * @private
   */
  private static sourceStrategy(options: BundlingProps): AssetCode {
    return Code.fromAsset(options.rootDir, {
      assetHashType: AssetHashType.SOURCE,
      exclude: options.hashableAssetExclude,
      bundling: new Bundling(options),
    });
  }

  /**
   * Uses the AssetHashType.CUSTOM strategy and uv tree output to calculate the asset hash.
   *
   * This strategy uses the output of `uv tree` to calculate the asset hash. If there are multiple packages in a workspace this method will only
   * rebuild the asset for a package if the package or a dependency version changes. This will not pick up local changes to the source unless they
   * also change the package version in pyproject.toml.
   *
   * @param options
   * @private
   */
  private static packageVersionStrategy(options: BundlingProps): AssetCode {
    const workspacePackage = options.workspacePackage;
    const uvPackageArgs = workspacePackage
      ? `--package ${workspacePackage}`
      : '';
    const uvTreeOptions = [
      '--frozen', // don't try and update the lock file
    ];
    const command = `cd ${options.rootDir} && uv tree ${uvTreeOptions.join(' ')} ${uvPackageArgs}`;
    // TODO: find something that works on Windows, maybe automatically changing directory and running the command
    const tree = execSync(command).toString().trim();
    const assetHash = createHash('sha256').update(tree).digest('hex');

    return Code.fromAsset(options.rootDir, {
      assetHashType: AssetHashType.CUSTOM,
      assetHash,
      exclude: options.hashableAssetExclude,
      bundling: new Bundling(options),
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
      commandHooks,
      assetExcludes = DEFAULT_ASSET_EXCLUDES,
    } = props;

    const bundlingCommands = props.skip
      ? []
      : this.createBundlingCommands({
          rootDir,
          workspacePackage,
          assetExcludes,
          commandHooks,
          inputDir: AssetStaging.BUNDLING_INPUT_DIR,
          outputDir: AssetStaging.BUNDLING_OUTPUT_DIR,
        });

    this.image = image ?? this.createDockerImage(props);

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

  private createDockerImage(props: BundlingProps): DockerImage {
    // If skip is true then don't call DockerImage.fromBuild as that calls dockerExec.
    // Return a dummy object of the right type as it's not going to be used.
    if (props.skip) {
      return new DockerImage('skipped');
    }

    return DockerImage.fromBuild(path.resolve(__dirname, '..', 'resources'), {
      buildArgs: {
        ...props.buildArgs,
        IMAGE: props.runtime.bundlingImage.image,
      },
      platform: (props.architecture ?? Architecture.ARM_64).dockerPlatform,
    });
  }

  private createBundlingCommands(options: BundlingCommandOptions): string[] {
    const excludeArgs = options.assetExcludes.map(
      (exclude) => `--exclude="${exclude}"`,
    );
    const workspacePackage = options.workspacePackage;
    const uvCommonArgs = `--directory ${options.outputDir}`;
    const uvPackageArgs = workspacePackage
      ? `--package ${workspacePackage}`
      : '';
    const reqsFile = `/tmp/requirements${workspacePackage || ''}.txt`;
    const commands = [];
    commands.push(
      ...(options.commandHooks?.beforeBundling(
        options.inputDir,
        options.outputDir,
      ) ?? []),
    );
    commands.push(
      ...[
        `rsync -rLv ${excludeArgs.join(' ')} ${options.inputDir}/ ${options.outputDir}`,
        `cd ${options.outputDir}`, // uv pip install needs to be run from here for editable deps to relative paths to be resolved
        `uv sync ${uvCommonArgs} ${uvPackageArgs} --python-preference=only-system --compile-bytecode --no-dev --frozen --no-editable --link-mode=copy`,
        `uv export ${uvCommonArgs} ${uvPackageArgs} --no-dev --frozen --no-editable > ${reqsFile}`,
        `uv pip install -r ${reqsFile} --target ${options.outputDir} --reinstall --compile-bytecode --link-mode=copy`,
        `rm -rf ${options.outputDir}/.venv`,
      ],
    );
    commands.push(
      ...(options.commandHooks?.afterBundling(
        options.inputDir,
        options.outputDir,
      ) ?? []),
    );

    return commands;
  }
}
