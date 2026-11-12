import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterAll, describe, expect, it} from 'vitest';
import {checkoutRoot, resolveE2eInstance} from './e2e-instance';

/*
 * This decides which database prepare.mts drops WITH (FORCE), so every way a worktree could fall back to the main
 * checkout's cgendio_test, or two checkouts could land on one instance, has a case here.
 */

const sandbox = mkdtempSync(join(tmpdir(), 'e2e-instance-'));
afterAll(() => rmSync(sandbox, {recursive: true, force: true}));

/** A clone (`.git` folder) or a git worktree (`.git` file) at this path inside the sandbox. */
const checkout = (path: string, kind: 'clone' | 'worktree') => {
  const root = join(sandbox, path);
  mkdirSync(root, {recursive: true});
  if (kind === 'clone') mkdirSync(join(root, '.git'));
  else writeFileSync(join(root, '.git'), 'gitdir: /somewhere/.git/worktrees/x\n');
  return root;
};

const DEFAULT = {name: null, database: 'cgendio_test', port: 3100, adminDevPort: 3102, mockResendPort: 3199};

const main = checkout('cgendio-v2', 'clone');
const worktree = checkout('cgendio-v2-out-redirect', 'worktree');

describe('the default instance', () => {
  it('is the main checkout and CI', () => {
    expect(resolveE2eInstance(main, {})).toEqual(DEFAULT);
    expect(resolveE2eInstance(join(sandbox, 'no-checkout-here'), {})).toEqual(DEFAULT);
  });

  it('is what E2E_INSTANCE=default picks, in any case and even in a worktree', () => {
    expect(resolveE2eInstance(worktree, {E2E_INSTANCE: 'default'})).toEqual(DEFAULT);
    expect(resolveE2eInstance(worktree, {E2E_INSTANCE: ' Default '})).toEqual(DEFAULT);
  });
});

describe('a git worktree', () => {
  it('gets its own database and ports, named after its folder', () => {
    const instance = resolveE2eInstance(worktree, {});
    expect(instance.name).toMatch(/^out_redirect_[0-9a-f]{8}$/);
    expect(instance.database).toBe(`cgendio_${instance.name}_test`);
    expect(instance.port).toBeGreaterThanOrEqual(4100);
    expect(instance.port + 2).toBeLessThanOrEqual(4899);
    expect([instance.adminDevPort, instance.mockResendPort]).toEqual([instance.port + 1, instance.port + 2]);
  });

  it('keeps its instance when a process starts in a subfolder', () => {
    const sub = join(worktree, 'e2e', 'support');
    mkdirSync(sub, {recursive: true});
    expect(checkoutRoot(sub)).toBe(worktree);
    expect(resolveE2eInstance(sub, {})).toEqual(resolveE2eInstance(worktree, {}));
  });

  it('keeps the same instance on every run', () => {
    expect(resolveE2eInstance(worktree, {})).toEqual(resolveE2eInstance(worktree, {}));
  });

  it("ignores an empty E2E_INSTANCE rather than falling back to the main checkout's", () => {
    expect(resolveE2eInstance(worktree, {E2E_INSTANCE: ''})).toEqual(resolveE2eInstance(worktree, {}));
    expect(resolveE2eInstance(worktree, {E2E_INSTANCE: '  '})).toEqual(resolveE2eInstance(worktree, {}));
  });

  it('never maps to the default, whatever its folder is called', () => {
    for (const name of ['default', 'cgendio-v2-default', 'cgendio-v2-', '---']) {
      const instance = resolveE2eInstance(checkout(`odd/${name}`, 'worktree'), {});
      expect(instance.name, name).not.toBeNull();
      expect(instance.database, name).not.toBe('cgendio_test');
      expect(instance.database, name).toMatch(/^[a-z0-9_]+_test$/);
    }
  });
});

describe('two worktrees never share an instance by name', () => {
  const databases = (...paths: string[]) => paths.map((path) => resolveE2eInstance(checkout(path, 'worktree'), {}).database);

  it('when their folder names match in different parent folders', () => {
    const [a, b] = databases('.worktrees-a/bugfix/nav', '.worktrees-b/feature/nav');
    expect(a).not.toBe(b);
  });

  it('when their names only differ in punctuation', () => {
    const [a, b] = databases('feature-a', 'feature_a');
    expect(a).not.toBe(b);
  });

  it('when their names only differ after the readable part is cut short', () => {
    const long = 'cgendio-v2-feature-phase-12-admin-dashboard-analytics';
    const [a, b] = databases(`${long}-a`, `${long}-b`);
    expect(a).not.toBe(b);
    expect(a.length).toBeLessThanOrEqual(63); // Postgres identifiers are cut at 63 bytes
  });
});

describe('E2E_INSTANCE by name', () => {
  it('gives the same instance to every checkout that sets the same name', () => {
    const fromMain = resolveE2eInstance(main, {E2E_INSTANCE: 'spike'});
    expect(fromMain.name).toMatch(/^spike_[0-9a-f]{8}$/);
    expect(resolveE2eInstance(worktree, {E2E_INSTANCE: 'spike'})).toEqual(fromMain);
  });
});
