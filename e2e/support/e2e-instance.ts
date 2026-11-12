import {createHash} from 'node:crypto';
import {existsSync, statSync} from 'node:fs';
import {basename, dirname, join, resolve} from 'node:path';

/*
 * Which e2e instance a checkout runs, so two checkouts never share a test database or a server. The prepare script drops
 * and recreates the database, and locally Playwright reuses whatever server already answers on the port, so a run in one
 * checkout could reset the data under another or test the other's build.
 */

/** The main checkout's and CI's instance: cgendio_test on ports 3100, 3102 and 3199. */
const DEFAULT = {database: 'cgendio_test', port: 3100, adminDevPort: 3102, mockResendPort: 3199};

export type E2eInstance = typeof DEFAULT & {
  /** null for the default instance. */
  name: string | null;
};

/**
 * The checkout a process runs in: the nearest folder at or above `from` holding `.git` (a folder in a clone, a file in a
 * git worktree). Walking up keeps a script started from a subfolder on its own checkout's instance.
 */
export const checkoutRoot = (from: string): string | null => {
  const dir = resolve(from);
  if (existsSync(join(dir, '.git'))) return dir;
  const parent = dirname(dir);
  return parent === dir ? null : checkoutRoot(parent);
};

const isWorktree = (root: string) => {
  try {
    return statSync(join(root, '.git')).isFile();
  } catch {
    return false;
  }
};

/** A readable part for the database name: letters, digits and underscores, without the repository's own name in front. */
const label = (raw: string) =>
  raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/^cgendio_v2(?:_|$)/, '')
    .slice(0, 30);

const shortHash = (value: string) => createHash('sha256').update(value).digest('hex').slice(0, 8);

/**
 * The instance for a process started in `cwd`. E2E_INSTANCE picks one by name (`default` for the main checkout's, and two
 * checkouts with the same name share it on purpose). Without it, a git worktree gets its own instance from its absolute
 * path, so worktrees with the same or similar folder names never share one; a clone (the main checkout) and CI get the
 * default. The database is `cgendio_<label>_<hash>_test` (prepare.mts only resets names ending in _test), and the ports
 * a block of three between 4100 and 4899 picked by the same hash. Two instances can still land on the same block (1 in
 * 200 a pair): prepare.mts refuses to run on a port that's already taken.
 */
export const resolveE2eInstance = (cwd: string, env: Record<string, string | undefined>): E2eInstance => {
  // Empty counts as unset (a shell or .envrc that exports it blank), so it never changes which instance a checkout gets
  const override = env.E2E_INSTANCE?.trim() || undefined;
  if (override?.toLowerCase() === 'default') return {name: null, ...DEFAULT};
  const root = override ? null : checkoutRoot(cwd);
  if (!override && (root === null || !isWorktree(root))) return {name: null, ...DEFAULT};
  const hash = shortHash(override ? `name:${override}` : `path:${root}`);
  const name = [label(override ?? basename(root ?? '')), hash].filter(Boolean).join('_');
  const port = 4100 + (Number.parseInt(hash, 16) % 200) * 4;
  return {name, database: `cgendio_${name}_test`, port, adminDevPort: port + 1, mockResendPort: port + 2};
};
