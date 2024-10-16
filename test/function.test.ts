import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { PythonFunction } from '../src';

const resourcesPath = path.resolve(__dirname, 'resources');


test('Create a function from basic_app', async () => {
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
  expect(functions).toHaveLength(1);
  const contents = await getFunctionAssetContents(functions[0], app);
  expect(contents).toContain('handler.py');
});

test('Create a function with workspaces_app', async () => {
  const app = new App({});
  const stack = new Stack(app, 'wstest');
  new PythonFunction(stack, 'workspaces_app', {
    rootDir: path.join(resourcesPath, 'workspaces_app'),
    workspacePackage: 'app',
    index: 'app_handler.py',
    handler: 'handle_event',
    runtime: Runtime.PYTHON_3_10,
  });

  const template = Template.fromStack(stack);
  console.log(JSON.stringify(template.toJSON(), null, ' '));

  template.hasResourceProperties('AWS::Lambda::Function', {
    Handler: 'app_handler.handle_event',
    Runtime: 'python3.10',
    Code: {
      S3Bucket: Match.anyValue(),
      S3Key: Match.anyValue(),
    },
  });

  const functions = Object.values(template.findResources('AWS::Lambda::Function'));
  expect(functions).toHaveLength(1);
  const contents = await getFunctionAssetContents(functions[0], app);
  for (const entry of [
    'app',
    'common',
    'pydantic',
    'httpx',
    '_common.pth',
    'app_handler.py',
  ]) {
    expect(contents).toContain(entry);
  }
});

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
async function getFunctionAssetContents(functionResource: any, app: App) {
  const [assetHash] = functionResource.Properties.Code.S3Key.split('.');
  const assetPath = path.join(app.outdir, `asset.${assetHash}`);
  const contents = await fs.readdir(assetPath);
  return contents;
}

