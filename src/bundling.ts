import {
  AssetHashType,
  AssetStaging,
  type BundlingFileAccess,
  DockerImage,
  type DockerRunOptions,
  type DockerVolume,
} from 'aws-cdk-lib';
import {
  Architecture,
  type AssetCode,
  Code,
  type Runtime,
} from 'aws-cdk-lib/aws-lambda';

export const HASHABLE_DEPENDENCIES_EXCLUDE = ['*.pyc'];

interface BundlingCommandOptions {
  readonly entry: string;
  readonly inputDir: string;
  readonly outputDir: string;
}

export interface BundlingProps extends DockerRunOptions {
  readonly entry: string;
  readonly runtime: Runtime;

  /**
   * Lambda CPU architecture
   *
   * @default Architecture.X86_64
   */
  readonly architecture?: Architecture;

  /**
   * Skip bundling process
   *
   * @default false
   */
  readonly skip?: boolean;

  /**
   * Docker image to use for bundling.
   *
   * @default - Default bundling image from the sam/build-python set
   */
  readonly image?: DockerImage;

  /**
   * Optional build arguments to pass to the bundling container when the default
   * image is used.
   *
   * @default - {}
   */
  readonly buildArgs?: { [key: string]: string };

  /**
   * Specifies how to copy files to/from the docker container. BIND_MOUNT is generally faster
   * but VOLUME_MOUNT works with remote Docker contexts.
   *
   * @default - BundlingFileAccess.BIND_MOUNT
   */
  readonly bundlingFileAccess?: BundlingFileAccess;
}

/**
 * Bundling options for Python Lambda assets
 */
export class Bundling {
  public static bundle(options: BundlingProps): AssetCode {
    return Code.fromAsset(options.entry, {
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
    const { entry, image, runtime, architecture = Architecture.X86_64 } = props;

    const bundlingCommands = this.createBundlingCommands({
      entry,
      inputDir: AssetStaging.BUNDLING_INPUT_DIR,
      outputDir: AssetStaging.BUNDLING_OUTPUT_DIR,
    });

    this.image =
      image ??
      DockerImage.fromBuild(__dirname, {
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
    return [`rsync -rLv ${options.inputDir}/ ${options.outputDir}`, 'uv sync'];
  }
}
