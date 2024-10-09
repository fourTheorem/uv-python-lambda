import * as fs from 'node:fs';
import * as path from 'node:path';
import { type BundlingOptions, Stack } from 'aws-cdk-lib';
import {
  // biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
  Function,
  type FunctionOptions,
  Runtime,
  RuntimeFamily,
} from 'aws-cdk-lib/aws-lambda';

import type { Construct } from 'constructs';
import { Bundling } from './bundling';

export interface PythonFunctionProps extends FunctionOptions {
  /**
   * Path where index and function dependencies can be found
   */
  readonly entry: string;

  /**
   * The runtime
   *
   * @default Runtime.PYTHON_3_12
   */
  readonly runtime?: Runtime;

  /**
   * The path to the index file containing the handler. Relative to #entry
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
      index = 'index.py',
      handler = 'handler',
      runtime = Runtime.PYTHON_3_12,
    } = props;

    const entry = path.resolve(props.entry);
    const resolvedIndex = path.resolve(entry, index);
    if (!fs.existsSync(resolvedIndex)) {
      throw new Error(`Cannot find index file at ${resolvedIndex}`);
    }

    const moduleName = path.parse(index).name;
    const resolvedHandler = `${moduleName}.${handler}`.replace(/\//g, '.');

    if (runtime.family !== RuntimeFamily.PYTHON) {
      throw new Error('Only Python runtimes are supported');
    }

    const code = Bundling.bundle({
      entry,
      runtime,
      skip: !Stack.of(scope).bundlingRequired,
      architecture: props.architecture,
      ...props.bundling,
    });
    super(scope, id, {
      ...props,
      runtime,
      code,
      handler: resolvedHandler,
    });
  }
}
