import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { PythonFunction } from '../src';

const resourcesPath = path.resolve(__dirname, 'resources');


test('Create a function', async () => {
  const app = new App({});
  const stack = new Stack(app, 'test');
  new PythonFunction(stack, 'basic_app', {
    rootDir: path.join(resourcesPath, 'basic_app'),
    index: 'handler.py',
    handler: 'lambda_handler',
    runtime: Runtime.PYTHON_3_12,
  });

  const template = Template.fromStack(stack);
  console.log(JSON.stringify(template.toJSON(), null, ' '));

  template.hasResourceProperties('AWS::Lambda::Function', {
    Handler: 'handler.lambda_handler',
    Runtime: 'python3.12',
    Code: {
      S3Bucket: Match.anyValue(),
      S3Key: Match.anyValue(),
    },
  });
  const functions = Object.values(template.findResources('AWS::Lambda::Function'));
  expect(functions.length).toBe(1);
  expect(functions[0].Properties.Handler).toBe('handler.lambda_handler');
  expect(functions[0].Properties.Runtime).toBe('python3.12');
  const [assetHash] = functions[0].Properties.Code.S3Key.split('.');
  const assetPath = path.join(app.outdir, `asset.${assetHash}`);
  const contents = await fs.readdir(assetPath);
  expect(contents).toContain('handler.py');
});
