import {statSync} from 'node:fs';
import {basename, join} from 'node:path';

/*
 * Which e2e instance a checkout runs, so two checkouts never share a test database or a server. The prepare script drops
 * and recreates the database, and locally Playwright reuses whatever server already answers on the port, so a run in one
 * checkout could reset the data under another or test the other's build.
 */

/** The main checkout's and CI's instance: cgendio_test on ports 3100, 3102 and 3199. */
const DEFAULT = {database: 'cgendio_test', port: 3100, adminDevPort: 3102, mockResendPort: 3199};

/** In a git worktree, `.git` is a file pointing at the main repository; in a clone it is a folder. */
const isWorktree = (root: string) => {
  try {
    return statSync(join(root, '.git')).isFile();
  } catch {
    return false;
  }
};

/**
 * The instance name: E2E_INSTANCE when set (`default` picks the main checkout's), else the worktree's folder name, else
 * null for the default. Lowercased to letters, digits and underscores, without the repository's own name in front.
 */
export const e2eInstanceName = (root: string, env: Record<string, string | undefined>) => {
  const raw = env.E2E_INSTANCE ?? (isWorktree(root) ? basename(root) : 'default');
  const name = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/^cgendio_v2_/, '');
  return name === '' || name === 'default' ? null : name.slice(0, 40);
};

/** A stable number from the name, so the same worktree always gets the same ports. */
const hash = (name: string) => [...name].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);

/**
 * The database and ports for an instance. A named one gets `cgendio_<name>_test` (prepare.mts only resets names ending
 * in _test) and a block of three ports between 4100 and 4899, picked from the name. Two names can land on the same block
 * (1 in 200): set E2E_INSTANCE in one checkout to move it.
 */
export const e2eInstance = (name: string | null) => {
  if (name === null) return DEFAULT;
  const port = 4100 + (hash(name) % 200) * 4;
  return {database: `cgendio_${name}_test`, port, adminDevPort: port + 1, mockResendPort: port + 2};
};
