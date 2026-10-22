import {existsSync} from 'node:fs';
import {defineConfig} from 'prisma/config';

// The Prisma CLI doesn't read .env on its own. Node's loader covers local development;
// Coolify and CI provide DATABASE_URL directly, so a missing file is fine.
if (existsSync('.env')) process.loadEnvFile('.env');

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // Node 24 runs TypeScript directly (the generated client uses .ts import paths for this). The package isn't
    // "type": "module", so Node warns that it re-parses those files as ES modules; that warning is expected here.
    seed: 'node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON prisma/seed.mts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
