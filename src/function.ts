import * as path from 'node:path';
import { Stack } from 'aws-cdk-lib';
import {
  Architecture,
  type CfnFunction,
  // biome-ignore lint/suspicious/noShadowRestrictedNames: shadows 'function'
  Function,
  type FunctionOptions,
  Runtime,
  RuntimeFamily,
} from 'aws-cdk-lib/aws-lambda';

import type { Construct } from 'constructs';
import { Bundling } from './bundling';
import type { BundlingOptions } from './types';

export interface PythonFunctionProps extends FunctionOptions {
  /**
   * UV project root directory (workspace root)
   */
  readonly rootDir: string;

  /**
   * Optional UV project workspace, used to specify a specific package to be used
   * as a Lambda Function entry.
   */
  readonly workspacePackage?: string;

  /**
   * The runtime
   *
   * @default Runtime.PYTHON_3_12
   */
  readonly runtime?: Runtime;

  /**
   * The path to the index file with the project or (or workspace, if specified) containing the handler.
   *
   * @default index.py
   */
  readonly index?: string;

  /**
   * The name of the exported handler function in the #index
   *
   * @default handler
   */
  readonly handler?: string;

  /**
   * Custom bundling options, including build architecture and bundling container image
   */
  readonly bundling?: BundlingOptions;
}

export class PythonFunction extends Function {
  constructor(scope: Construct, id: string, props: PythonFunctionProps) {
    const {
      workspacePackage,
      handler = 'handler',
      index = 'index.py',
      runtime = Runtime.PYTHON_3_12,
    } = props;

    const architecture = props.architecture ?? Architecture.ARM_64;
    const rootDir = path.resolve(props.rootDir);

    // Strip .py from the end of handler if it exists
    const strippedIndex = index.endsWith('.py') ? index.slice(0, -3) : index;

    const resolvedHandler = `${strippedIndex}.${handler}`.replace(/\//g, '.');

    if (runtime.family !== RuntimeFamily.PYTHON) {
      throw new Error('Only Python runtimes are supported');
    }

    const skip = !Stack.of(scope).bundlingRequired;

    const code = Bundling.bundle({
      rootDir,
      runtime,
      skip: skip,
      architecture,
      workspacePackage,
      ...props.bundling,
    });

    const environment = props.environment ?? {};

    super(scope, id, {
      ...props,
      environment,
      architecture,
      runtime,
      code,
      handler: resolvedHandler,
    });
    const assetRelPath = path.relative(process.env.CDK_OUTDIR ?? "", code.path);
    (this.node.defaultChild as CfnFunction).addMetadata('uv-python-lambda:asset-path', assetRelPath);
  }
}
