import { awscdk } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Eoin Shanaghy',
  authorAddress: 'eoin.shanaghy@fourtheorem.com',
  cdkVersion: '2.161.1',
  constructsVersion: '10.3.0',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.5.0',
  name: 'uv-python-lambda',
  projenrcTs: true,
  repositoryUrl: 'git@github.com:fourtheorem/uv-python-lambda.git',
  publishToPypi: {
    distName: 'uv-python-lambda',
    module: 'uv_python_lambda',
  },
  // cdkVersion: '2.1.0',    /* CDK version to use. */
  // cdkDependencies: [],     /* CDK dependencies of this module. */
  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  devDeps: ['@biomejs/biome'] /* Build dependencies for this module. */,
  // packageName: undefined,  /* The "name" in package.json. */
  jestOptions: {
    extraCliOptions: ['--testTimeout=300000'],
  },
});
project.files;
project.synth();
