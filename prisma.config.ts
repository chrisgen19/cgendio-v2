import {existsSync} from 'node:fs';
import {defineConfig} from 'prisma/config';

// The Prisma CLI doesn't read .env on its own. Node's loader covers local development;
// Coolify and CI provide DATABASE_URL directly, so a missing file is fine.
if (existsSync('.env')) process.loadEnvFile('.env');

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // Node 24 runs TypeScript directly; the generated client uses .ts import extensions for this
    seed: 'node prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
