import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { Architecture, Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import {
  BundleCache,
  type BundleCacheKeyInput,
  computeBundleCacheKey,
} from '../src/bundle-cache';
import { Bundling } from '../src/bundling';

const FIXTURE = path.join(__dirname, 'resources', 'workspaces_app');

function keyInput(
  rootDir: string,
  overrides: Partial<BundleCacheKeyInput> = {},
): BundleCacheKeyInput {
  return {
    rootDir,
    workspacePackage: 'app',
    assetExcludes: ['.venv/', 'node_modules/', 'cdk.out/'],
    extraInputs: [],
    buildInputs: { runtime: 'python3.12' },
    ...overrides,
  };
}

function write(file: string, content: string) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
}

describe('computeBundleCacheKey', () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), 'uv-bundle-cache-'));
    cpSync(FIXTURE, root, { recursive: true });
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  test('is stable for unchanged inputs', () => {
    expect(computeBundleCacheKey(keyInput(root))).toBe(
      computeBundleCacheKey(keyInput(root)),
    );
  });

  test('changes with the package source', () => {
    const before = computeBundleCacheKey(keyInput(root));
    write(path.join(root, 'app/src/app/extra.py'), 'VALUE = 1\n');
    expect(computeBundleCacheKey(keyInput(root))).not.toBe(before);
  });

  test('changes with the source of a workspace dependency', () => {
    const before = computeBundleCacheKey(keyInput(root));
    write(path.join(root, 'common/src/common/extra.py'), 'VALUE = 1\n');
    expect(computeBundleCacheKey(keyInput(root))).not.toBe(before);
  });

  test('ignores members that the package does not depend on', () => {
    const before = computeBundleCacheKey(
      keyInput(root, { workspacePackage: 'common' }),
    );
    write(path.join(root, 'app/src/app/extra.py'), 'VALUE = 1\n');
    expect(
      computeBundleCacheKey(keyInput(root, { workspacePackage: 'common' })),
    ).toBe(before);
  });

  test('ignores unrelated files in the repository', () => {
    const before = computeBundleCacheKey(keyInput(root));
    write(path.join(root, 'docs/guide.md'), '# Guide\n');
    write(path.join(root, 'dashboard/src/index.ts'), 'export {};\n');
    expect(computeBundleCacheKey(keyInput(root))).toBe(before);
  });

  test('ignores generated files', () => {
    const before = computeBundleCacheKey(keyInput(root));
    write(path.join(root, 'app/src/app/__pycache__/app.cpython-312.pyc'), 'x');
    write(path.join(root, 'common/.pytest_cache/state'), 'x');
    expect(computeBundleCacheKey(keyInput(root))).toBe(before);
  });

  test('ignores files that the export leaves out of the asset', () => {
    const before = computeBundleCacheKey(keyInput(root));
    write(path.join(root, 'app/node_modules/pkg/index.js'), 'x');
    write(path.join(root, 'app/sub/cdk.out/manifest.json'), '{}');
    expect(computeBundleCacheKey(keyInput(root))).toBe(before);
  });

  test('changes with a locked third-party dependency of the package', () => {
    const before = computeBundleCacheKey(keyInput(root));
    const lockPath = path.join(root, 'uv.lock');
    const lock = readFileSync(lockPath, 'utf8');
    const changed = lock.replace(
      /(name = "httpx"\nversion = ")[^"]+"/,
      '$19.9.9"',
    );
    expect(changed).not.toBe(lock);
    writeFileSync(lockPath, changed);
    expect(computeBundleCacheKey(keyInput(root))).not.toBe(before);
  });

  test('changes with the build inputs', () => {
    expect(computeBundleCacheKey(keyInput(root))).not.toBe(
      computeBundleCacheKey(
        keyInput(root, { buildInputs: { runtime: 'python3.13' } }),
      ),
    );
  });

  test('changes with an extra input', () => {
    write(path.join(root, 'shared/data.txt'), 'one');
    const input = keyInput(root, { extraInputs: ['shared'] });
    const before = computeBundleCacheKey(input);
    write(path.join(root, 'shared/data.txt'), 'two, and longer');
    expect(computeBundleCacheKey(input)).not.toBe(before);
  });

  test('is unavailable when an extra input is missing', () => {
    expect(
      computeBundleCacheKey(keyInput(root, { extraInputs: ['missing'] })),
    ).toBeUndefined();
  });

  test('is unavailable without a lock file', () => {
    rmSync(path.join(root, 'uv.lock'));
    expect(computeBundleCacheKey(keyInput(root))).toBeUndefined();
  });

  test('is unavailable for a package that the lock does not hold', () => {
    expect(
      computeBundleCacheKey(keyInput(root, { workspacePackage: 'nope' })),
    ).toBeUndefined();
  });

  test('is unavailable when the lock cannot be parsed', () => {
    writeFileSync(path.join(root, 'uv.lock'), 'not = [valid');
    expect(computeBundleCacheKey(keyInput(root))).toBeUndefined();
  });
});

describe('computeBundleCacheKey for a single project', () => {
  let root: string;
  const input = () => keyInput(root, { workspacePackage: undefined });

  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), 'uv-bundle-cache-single-'));
    cpSync(path.join(__dirname, 'resources', 'basic_app'), root, {
      recursive: true,
    });
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  test('is available and stable', () => {
    const key = computeBundleCacheKey(input());
    expect(key).toBeDefined();
    expect(computeBundleCacheKey(input())).toBe(key);
  });

  test('changes with a project source file', () => {
    const before = computeBundleCacheKey(input());
    writeFileSync(path.join(root, 'handler.py'), '# edited\n');
    expect(computeBundleCacheKey(input())).not.toBe(before);
  });

  test('changes with the lock file', () => {
    const before = computeBundleCacheKey(input());
    const lockPath = path.join(root, 'uv.lock');
    writeFileSync(lockPath, `${readFileSync(lockPath, 'utf8')}\n# edited\n`);
    expect(computeBundleCacheKey(input())).not.toBe(before);
  });

  test('ignores generated files and files that the export omits', () => {
    const before = computeBundleCacheKey(input());
    write(path.join(root, '__pycache__/handler.cpython-312.pyc'), 'x');
    write(path.join(root, 'node_modules/pkg/index.js'), 'x');
    write(path.join(root, 'cdk.out/manifest.json'), '{}');
    expect(computeBundleCacheKey(input())).toBe(before);
  });
});

describe('computeBundleCacheKey with extras', () => {
  let root: string;

  const lock = (extraDepVersion: string, otherVersion: string) => `
version = 1

[[package]]
name = "svc"
version = "0.1.0"
source = { editable = "svc" }
dependencies = [
    { name = "lib", extra = ["fast"] },
]

[[package]]
name = "lib"
version = "0.1.0"
source = { editable = "lib" }
dependencies = [
    { name = "basedep" },
]

[package.optional-dependencies]
fast = [
    { name = "extradep" },
]
slow = [
    { name = "slowdep" },
]

[[package]]
name = "basedep"
version = "1.0.0"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "extradep"
version = "${extraDepVersion}"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "slowdep"
version = "1.0.0"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "other"
version = "${otherVersion}"
source = { registry = "https://pypi.org/simple" }
`;

  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), 'uv-bundle-cache-extras-'));
    write(path.join(root, 'pyproject.toml'), '[project]\nname = "root"\n');
    write(path.join(root, 'svc/pyproject.toml'), '[project]\nname = "svc"\n');
    write(path.join(root, 'lib/pyproject.toml'), '[project]\nname = "lib"\n');
    write(path.join(root, 'uv.lock'), lock('1.0.0', '1.0.0'));
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  const key = () =>
    computeBundleCacheKey(keyInput(root, { workspacePackage: 'svc' }));

  test('includes the dependencies of a requested extra', () => {
    const before = key();
    write(path.join(root, 'uv.lock'), lock('2.0.0', '1.0.0'));
    expect(key()).not.toBe(before);
  });

  test('ignores locked packages outside the closure', () => {
    const before = key();
    write(path.join(root, 'uv.lock'), lock('1.0.0', '2.0.0'));
    expect(key()).toBe(before);
  });
});

describe('BundleCache', () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(path.join(tmpdir(), 'uv-bundle-store-'));
  });

  afterEach(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  test('stores and restores an archive', () => {
    const cache = new BundleCache(path.join(directory, 'cache'));
    const archive = path.join(directory, 'asset.zip');
    writeFileSync(archive, 'zip-bytes');

    expect(cache.has('abc')).toBe(false);
    cache.store('abc', archive);
    expect(cache.has('abc')).toBe(true);

    const restored = path.join(directory, 'out', 'asset.zip');
    cache.restore('abc', restored);
    expect(readFileSync(restored, 'utf8')).toBe('zip-bytes');
  });

  test('stores nothing when the archive is missing', () => {
    const cache = new BundleCache(path.join(directory, 'cache'));
    cache.store('abc', path.join(directory, 'missing.zip'));
    expect(cache.has('abc')).toBe(false);
  });
});

describe('Bundling with a bundle cache', () => {
  let root: string;
  let cdkOut: string;
  let cacheDir: string;
  const originalCdkOutdir = process.env.CDK_OUTDIR;

  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), 'uv-bundle-int-'));
    cpSync(FIXTURE, root, { recursive: true });
    cdkOut = mkdtempSync(path.join(tmpdir(), 'uv-bundle-out-'));
    cacheDir = mkdtempSync(path.join(tmpdir(), 'uv-bundle-dir-'));
    process.env.CDK_OUTDIR = cdkOut;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.CDK_OUTDIR = originalCdkOutdir;
    for (const dir of [root, cdkOut, cacheDir]) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  function bundle(workspacePackage = 'app') {
    return Bundling.bundle({
      rootDir: root,
      runtime: Runtime.PYTHON_3_12,
      architecture: Architecture.ARM_64,
      workspacePackage,
      bundleCacheDir: cacheDir,
    });
  }

  function mockBuild() {
    return jest
      .spyOn(Code, 'fromCustomCommand')
      .mockImplementation((output, command) => {
        if (command[0] === 'docker') {
          write(output, `built:${Date.now()}:${Math.random()}`);
        }
        return {} as ReturnType<typeof Code.fromCustomCommand>;
      });
  }

  test('rebuilds only after the closure changes', () => {
    const fromCustomCommand = mockBuild();
    const builderStarts = jest
      .spyOn(
        jest.requireActual('../src/build-container') as {
          ensureBuilderContainer: () => void;
        },
        'ensureBuilderContainer',
      )
      .mockImplementation(() => undefined);

    bundle();
    expect(fromCustomCommand.mock.calls.at(-1)?.[1][0]).toBe('docker');
    expect(builderStarts).toHaveBeenCalledTimes(1);

    bundle();
    expect(fromCustomCommand.mock.calls.at(-1)?.[1][0]).not.toBe('docker');
    expect(builderStarts).toHaveBeenCalledTimes(1);

    write(path.join(root, 'docs/guide.md'), 'unrelated');
    bundle();
    expect(fromCustomCommand.mock.calls.at(-1)?.[1][0]).not.toBe('docker');

    write(path.join(root, 'common/src/common/new.py'), 'VALUE = 1\n');
    bundle();
    expect(fromCustomCommand.mock.calls.at(-1)?.[1][0]).toBe('docker');
    expect(builderStarts).toHaveBeenCalledTimes(2);
  });

  test('restores the cached archive to the output path', () => {
    mockBuild();
    jest
      .spyOn(
        jest.requireActual('../src/build-container') as {
          ensureBuilderContainer: () => void;
        },
        'ensureBuilderContainer',
      )
      .mockImplementation(() => undefined);

    bundle();
    const archive = Reflect.get(
      jest.mocked(Code.fromCustomCommand).mock.calls.at(-1) ?? [],
      0,
    ) as string;
    const built = readFileSync(archive, 'utf8');
    rmSync(archive);

    bundle();
    expect(existsSync(archive)).toBe(true);
    expect(readFileSync(archive, 'utf8')).toBe(built);
  });
});
