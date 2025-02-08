import { awscdk } from 'projen';
import { JobPermission } from 'projen/lib/github/workflows-model';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Eoin Shanaghy',
  authorAddress: 'eoin.shanaghy@fourtheorem.com',
  cdkVersion: '2.161.1',
  constructsVersion: '10.3.0',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.5.0',
  name: 'uv-python-lambda',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/fourTheorem/uv-python-lambda',
  publishToPypi: {
    distName: 'uv-python-lambda',
    module: 'uv_python_lambda',
  },
  tsconfig: {
    compilerOptions: {
      esModuleInterop: true,
    },
  },
  // cdkVersion: '2.1.0',    /* CDK version to use. */
  // cdkDependencies: [],     /* CDK dependencies of this module. */
  bundledDeps: ['object-hash', 'atomic-sleep'],                /* Dependencies which should be bundled in the package. */
  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  devDeps: ['@biomejs/biome', '@types/object-hash', '@types/atomic-sleep'] /* Build dependencies for this module. */,
  // packageName: undefined,  /* The "name" in package.json. */
  jestOptions: {
    extraCliOptions: ['--testTimeout=300000'],
  },
  eslint: false,
});
const biomeWorkflow = project.github?.addWorkflow('biome');
biomeWorkflow?.on({
  pullRequest: {
    branches: ['main'],
  },
});
biomeWorkflow?.addJobs({
  biome: {
    runsOn: ['ubuntu-latest'],
    permissions: {
      contents: JobPermission.READ,
      idToken: JobPermission.WRITE,
    },
    steps: [
      {
        uses: 'actions/checkout@v4',
      },
      {
        uses: 'actions/setup-node@v4',
        with: {
          'node-version': '20',
        },
      },
      {
        run: 'yarn install',
      },
      {
        run: 'npx biome check',
      },
    ],
  },
});

project.files;
project.synth();
