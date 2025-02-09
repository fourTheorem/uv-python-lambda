import * as path from 'node:path';
const hash = require('object-hash');
import { runDockerContainerAndWait } from './build-container';

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
import type { BundlingOptions } from './types';
import { mkdirSync } from 'node:fs';

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

// interface BundlingCommandOptions {
//   readonly rootDir: string;
//   readonly workspacePackage?: string;
//   readonly inputDir: string;
//   readonly outputDir: string;
//   readonly assetExcludes: string[];
// }

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
    const bundling = new Bundling(bundlingOptions);
    const buildContainerId = Bundling.containerBuilders[bundling.containerBuilderKey];
    if (!buildContainerId) {
      throw new Error("Bundling container not found");
    }

    const hostFunctionOutputDir = `${process.env.CDK_OUTDIR}/${bundling.containerBuilderKey}/${bundling.functionOutDir}`;
    // mkdirSync(hostFunctionOutputDir, { recursive: true });

    return Code.fromCustomCommand(
      hostFunctionOutputDir,
      [
        "docker",
        "exec",
        bundling.containerBuilderKey ?? "",  // Key is only unset in 'skip' mode
        "/root/export.sh",
        "--package",
        options.workspacePackage ?? "uh-oh",  // TODO - add support for root package
        "--output",
        `/uvbuild/${bundling.functionOutDir}/`,
      ],
      {
        assetHashType: AssetHashType.SOURCE,
        exclude: hashableAssetExclude,
        // bundling: new Bundling(bundlingOptions),
      });
  }

  public readonly entrypoint?: string[] | undefined;
  public readonly volumes?: DockerVolume[] | undefined;
  public readonly volumesFrom?: string[] | undefined;
  public readonly environment?: { [key: string]: string } | undefined;
  public readonly workingDirectory?: string | undefined;
  public readonly user?: string | undefined;
  public readonly securityOpt?: string | undefined;
  public readonly network?: string | undefined;
  public readonly bundlingFileAccess?: BundlingFileAccess | undefined;

  /**
   * Unique key for the container for this bundling configuration.
   * Containers can be shared between multiple functions if their architecture, etc., are the same
   */
  private containerBuilderKey: string;

  /**
   * Unique output directory where the function code and dependencies will be written
   */
  private functionOutDir: string;

  /**
   * Cache of builder container IDs by key
   */
  private static readonly containerBuilders: Record<string, string> = {};

  constructor(props: BundlingProps) {
    // const {
    //   rootDir,
    //   workspacePackage,
    //   assetExcludes = DEFAULT_ASSET_EXCLUDES,
    // } = props;

    // inputdir: assetStaging.BUNDLING_INPUT_DIR,
    // outputDir: AssetStaging.BUNDLING_OUTPUT_DIR,


    // const bundlingCommands = props.skip
    //   ? []
    //   : this.createBundlingCommands({
    //     rootDir,
    //     workspacePackage,
    //     assetExcludes,
    //     commandHooks,
    //   });

    this.entrypoint = props.entrypoint;
    this.volumes = props.volumes;
    this.volumesFrom = props.volumesFrom;
    this.environment = props.environment;
    this.workingDirectory = props.workingDirectory;
    this.user = props.user;
    this.securityOpt = props.securityOpt;
    this.network = props.network;
    this.bundlingFileAccess = props.bundlingFileAccess;

    // If skip is true then don't call DockerImage.fromBuild as that calls dockerExec.
    // Return a dummy object of the right type as it's not going to be used.
    if (props.skip) {
      this.containerBuilderKey = "NONE";
      this.functionOutDir = "NONE";
      return;
    }

    const hashableProperties = {
      runtime: props.runtime,
      architecture: props.architecture,
      buildArgs: props.buildArgs,
      rootDir: props.rootDir,
    };

    // Create a hash of the props to use as a key for the build container cache
    this.containerBuilderKey = `uv-bundling-${hash(hashableProperties)}`;
    this.functionOutDir = props.workspacePackage ?? "";
    const existingBuilder = Bundling.containerBuilders[this.containerBuilderKey];
    if (!existingBuilder) {
      const buildImage = DockerImage.fromBuild(path.resolve(__dirname, '..', 'resources'), {
        buildArgs: {
          ...props.buildArgs,
          IMAGE: props.runtime.bundlingImage.image,
          IMAGE_ARCH: props.architecture === Architecture.X86_64 ? 'x86_64' : 'arm64',
          PYTHON_VERSION: props.runtime.name.slice(6),
          BUNDLING_IMAGE: props.runtime.bundlingImage.image,
        },
        platform: (props.architecture ?? Architecture.ARM_64).dockerPlatform,
      });

      const hostUvBuildDir = `${process.env.CDK_OUTDIR}/${this.containerBuilderKey}`;
      mkdirSync(hostUvBuildDir, { recursive: true });

      // Spawn a docker run process in -d daemon mode using buildImage.image
      const dockerArgs = [
        "run",
        "-d",
        "--cap-add=SYS_ADMIN",  // required for overlay fs
        "--name",
        this.containerBuilderKey,
        "-v",
        `${hostUvBuildDir}:/uvbuild`,
        "-v",
        `${props.rootDir}:/src`,
        buildImage.image,
      ]

      const containerId = runDockerContainerAndWait(
        this.containerBuilderKey,
        dockerArgs, "Builder container is ready and waiting"
      );

      Bundling.containerBuilders[this.containerBuilderKey] = containerId;
    }
  }

}
