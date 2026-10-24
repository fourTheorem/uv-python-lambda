import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
} from 'node:fs';
import * as path from 'node:path';
import { FileSystem, IgnoreMode } from 'aws-cdk-lib';
import { parse } from 'smol-toml';

/**
 * Bump when the layout of the cache or the key derivation changes.
 */
const CACHE_FORMAT_VERSION = 1;

/**
 * Generated directories that never contribute to an installed package.
 */
const KEY_NOISE_EXCLUDES = [
  '**/__pycache__/**',
  '**/*.pyc',
  '**/.pytest_cache/**',
  '**/.mypy_cache/**',
  '**/.ruff_cache/**',
  '**/.venv/**',
  '**/node_modules/**',
  '**/.git/**',
];

const LOCAL_SOURCE_KINDS = ['editable', 'virtual', 'directory'];

export interface BundleCacheKeyInput {
  /**
   * uv workspace root.
   */
  readonly rootDir: string;

  /**
   * Workspace package that the Lambda is exported from.
   */
  readonly workspacePackage?: string;

  /**
   * rsync-style patterns that the export leaves out of the asset.
   */
  readonly assetExcludes: string[];

  /**
   * Paths relative to `rootDir` whose contents also determine the bundle.
   */
  readonly extraInputs: string[];

  /**
   * Everything else that changes the bundle, such as the builder settings.
   */
  readonly buildInputs: unknown;
}

interface LockDependency {
  readonly name: string;
  readonly extra?: string[];
}

interface LockPackage {
  readonly name: string;
  readonly source?: Record<string, unknown>;
  readonly dependencies?: LockDependency[];
  readonly 'optional-dependencies'?: Record<string, LockDependency[]>;
}

/**
 * A content-addressed store of bundled archives.
 */
export class BundleCache {
  constructor(private readonly directory: string) {}

  public archivePath(key: string): string {
    return path.join(this.directory, `${key}.zip`);
  }

  public has(key: string): boolean {
    return existsSync(this.archivePath(key));
  }

  public restore(key: string, destination: string): void {
    mkdirSync(path.dirname(destination), { recursive: true });
    copyFileSync(this.archivePath(key), destination);
  }

  /**
   * Stores an archive. The rename keeps a reader from seeing a partial file.
   */
  public store(key: string, archive: string): void {
    if (!existsSync(archive)) {
      return;
    }
    mkdirSync(this.directory, { recursive: true });
    const temporary = `${this.archivePath(key)}.${process.pid}.tmp`;
    try {
      copyFileSync(archive, temporary);
      renameSync(temporary, this.archivePath(key));
    } finally {
      rmSync(temporary, { force: true });
    }
  }
}

/**
 * Derives the cache key of one Lambda bundle.
 *
 * The key covers the export closure of the workspace package: the package, the
 * local workspace members it depends on (directly or not), and the lock
 * entries of every third-party package that it installs. A change anywhere
 * else in the repository leaves the key unchanged.
 *
 * :returns: The key, or `undefined` when the closure cannot be determined. The
 *     caller must then bundle without the cache.
 */
export function computeBundleCacheKey(
  input: BundleCacheKeyInput,
): string | undefined {
  const rootDir = path.resolve(input.rootDir);
  const lockPath = path.join(rootDir, 'uv.lock');
  if (!existsSync(lockPath)) {
    return undefined;
  }

  let lockPackages: LockPackage[];
  try {
    const lock = parse(readFileSync(lockPath, 'utf8')) as {
      package?: LockPackage[];
    };
    lockPackages = lock.package ?? [];
  } catch {
    return undefined;
  }

  const hash = createHash('sha256');
  hash.update(JSON.stringify({ CACHE_FORMAT_VERSION, ...asRecord(input) }));

  const excludes = [...KEY_NOISE_EXCLUDES, ...rsyncToGlob(input.assetExcludes)];

  if (input.workspacePackage) {
    const closure = resolveClosure(lockPackages, input.workspacePackage);
    if (!closure) {
      return undefined;
    }
    for (const pkg of closure) {
      hash.update(JSON.stringify(sortKeys(pkg)));
      const localDir = localSourceDir(pkg);
      if (localDir !== undefined && localDir !== '.') {
        hash.update(
          `dir:${localDir}:${fingerprint(rootDir, localDir, excludes)}`,
        );
      }
    }
  } else {
    hash.update(readFileSync(lockPath));
    hash.update(`root:${fingerprint(rootDir, '.', excludes)}`);
  }

  for (const file of ['pyproject.toml', 'uv.toml', '.python-version']) {
    const full = path.join(rootDir, file);
    if (existsSync(full)) {
      hash.update(`${file}:`);
      hash.update(readFileSync(full));
    }
  }

  for (const extra of input.extraInputs) {
    const relative = extra.split(path.sep).join('/');
    if (!existsSync(path.join(rootDir, relative))) {
      return undefined;
    }
    hash.update(
      `extra:${relative}:${fingerprint(rootDir, relative, excludes)}`,
    );
  }

  return hash.digest('hex');
}

/**
 * Hashes the files of the library's builder resources.
 *
 * The export scripts decide what an archive holds, so a change to them must
 * change every key.
 */
export function hashDirectory(directory: string): string {
  const hash = createHash('sha256');
  for (const entry of readdirSync(directory).sort()) {
    const full = path.join(directory, entry);
    if (statSync(full).isFile()) {
      hash.update(entry);
      hash.update(readFileSync(full));
    }
  }
  return hash.digest('hex');
}

/**
 * Walks the lock from the target package the way `uv export --package` does
 * with `--no-dev`: runtime dependencies, plus the optional dependencies of the
 * extras that a dependent requests.
 */
function resolveClosure(
  packages: LockPackage[],
  target: string,
): LockPackage[] | undefined {
  const byName = new Map(packages.map((pkg) => [pkg.name, pkg]));
  const start = byName.get(target);
  if (!start || localSourceDir(start) === undefined) {
    return undefined;
  }

  const seen = new Set<string>();
  const closure = new Map<string, LockPackage>();
  const queue: Array<[string, string[]]> = [[target, []]];

  while (queue.length > 0) {
    const [name, extras] = queue.pop() as [string, string[]];
    const pkg = byName.get(name);
    if (!pkg) {
      return undefined;
    }
    for (const extra of [undefined, ...extras]) {
      const visit = `${name}[${extra ?? ''}]`;
      if (seen.has(visit)) {
        continue;
      }
      seen.add(visit);
      closure.set(name, pkg);
      const dependencies =
        extra === undefined
          ? pkg.dependencies
          : pkg['optional-dependencies']?.[extra];
      for (const dependency of dependencies ?? []) {
        queue.push([dependency.name, dependency.extra ?? []]);
      }
    }
  }

  return [...closure.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function localSourceDir(pkg: LockPackage): string | undefined {
  for (const kind of LOCAL_SOURCE_KINDS) {
    const value = pkg.source?.[kind];
    if (typeof value === 'string') {
      return value;
    }
  }
  return undefined;
}

function fingerprint(
  rootDir: string,
  relative: string,
  exclude: string[],
): string {
  const full = path.join(rootDir, relative);
  if (!existsSync(full)) {
    return 'missing';
  }
  return FileSystem.fingerprint(full, {
    exclude,
    ignoreMode: IgnoreMode.GLOB,
  });
}

/**
 * Converts the rsync patterns that the export uses into globs.
 *
 * rsync matches a pattern with no inner slash at any depth. Patterns that the
 * export removes from the asset cannot change the archive, so the key leaves
 * them out as well.
 */
function rsyncToGlob(patterns: string[]): string[] {
  const globs: string[] = [];
  for (const pattern of patterns) {
    const bare = pattern.replace(/\/+$/, '');
    if (!bare) {
      continue;
    }
    if (bare.includes('/')) {
      globs.push(bare, `${bare}/**`);
    } else {
      globs.push(`**/${bare}`, `**/${bare}/**`);
    }
  }
  return globs;
}

function asRecord(input: BundleCacheKeyInput): Record<string, unknown> {
  return {
    workspacePackage: input.workspacePackage ?? null,
    assetExcludes: [...input.assetExcludes].sort(),
    buildInputs: input.buildInputs,
  };
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, sortKeys(entry)]),
    );
  }
  return value;
}
