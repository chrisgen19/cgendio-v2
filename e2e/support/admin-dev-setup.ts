import {spawnSync} from 'node:child_process';

export default function setup() {
  // Prisma's generated ESM client runs in Node's native TypeScript loader, like test:e2e:prepare.
  const result = spawnSync(process.execPath, ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', 'e2e/support/admin-dev-fixtures.mts'], {
    stdio: 'inherit',
  });
  if (result.status !== 0) throw new Error(`Admin development fixture setup failed (${result.status}).`);
}
