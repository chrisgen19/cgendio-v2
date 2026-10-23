/**
 * Gets the e2e database ready: recreates it, applies the migrations, seeds the Phase 3 content, points the contact
 * email at the test inbox, and signs in a test admin (cookies saved for the Playwright `admin` project).
 *
 * Run with `pnpm test:e2e:prepare` (part of `pnpm test:e2e`), before the build: the build prerenders from this data.
 */
import {spawnSync} from 'node:child_process';
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {PrismaPg} from '@prisma/adapter-pg';
import {betterAuth} from 'better-auth';
import {prismaAdapter} from 'better-auth/adapters/prisma';
import {testUtils} from 'better-auth/plugins';
import pg from 'pg';
import {PrismaClient} from '../../src/generated/prisma/client.ts';
import {ADMIN_EMAIL, ADMIN_STORAGE_STATE, CONTACT_EMAIL, testEnv} from './test-env.ts';

const databaseUrl = new URL(testEnv.DATABASE_URL);
const databaseName = databaseUrl.pathname.slice(1);
if (!/^[a-z0-9_]+_test$/.test(databaseName)) throw new Error(`Refusing to reset "${databaseName}": the e2e database name must end in _test`);

/** Drop and create the test database from the server's maintenance database. FORCE closes a running e2e server's connections. */
const recreateDatabase = async () => {
  const client = new pg.Client({connectionString: Object.assign(new URL(databaseUrl), {pathname: '/postgres'}).toString()});
  await client.connect();
  try {
    await client.query(`DROP DATABASE IF EXISTS "${databaseName}" WITH (FORCE)`);
    await client.query(`CREATE DATABASE "${databaseName}"`);
  } finally {
    await client.end();
  }
};

const prisma = (...args: string[]) => {
  const result = spawnSync('pnpm', ['exec', 'prisma', ...args], {stdio: 'inherit', env: {...process.env, ...testEnv}});
  if (result.status !== 0) throw new Error(`prisma ${args.join(' ')} failed with exit code ${result.status}`);
};

/** A session for the allowlisted test admin, made with Better Auth's test-utils plugin (never part of the app's auth). */
const signInAdmin = async (db: PrismaClient) => {
  const auth = betterAuth({
    secret: testEnv.BETTER_AUTH_SECRET,
    baseURL: testEnv.BETTER_AUTH_URL,
    database: prismaAdapter(db, {provider: 'postgresql'}),
    plugins: [testUtils()],
  });
  const {test} = await auth.$context;
  const user = await test.saveUser(test.createUser({email: ADMIN_EMAIL, name: 'E2E Admin', emailVerified: true}));
  const cookies = await test.getCookies({userId: user.id, domain: new URL(testEnv.BETTER_AUTH_URL).hostname});
  const state = {
    cookies: cookies.map((cookie) => ({
      ...cookie,
      expires: cookie.expires ?? -1,
      httpOnly: cookie.httpOnly ?? true,
      secure: cookie.secure ?? false,
      sameSite: cookie.sameSite ?? 'Lax',
    })),
    origins: [],
  };
  mkdirSync(dirname(ADMIN_STORAGE_STATE), {recursive: true});
  writeFileSync(ADMIN_STORAGE_STATE, `${JSON.stringify(state, null, 2)}\n`);
};

await recreateDatabase();
prisma('migrate', 'deploy');
prisma('db', 'seed');

const db = new PrismaClient({adapter: new PrismaPg({connectionString: testEnv.DATABASE_URL})});
try {
  await db.siteSettings.update({where: {id: 'site'}, data: {contactEmail: CONTACT_EMAIL}});
  await signInAdmin(db);
} finally {
  await db.$disconnect();
}

console.info(`e2e database "${databaseName}" ready; admin session saved to ${ADMIN_STORAGE_STATE}`);
