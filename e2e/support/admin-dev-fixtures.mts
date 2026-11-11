import {writeFileSync} from 'node:fs';
import type {Cookie} from '@playwright/test';
import {PrismaPg} from '@prisma/adapter-pg';
import {betterAuth} from 'better-auth';
import {prismaAdapter} from 'better-auth/adapters/prisma';
import {testUtils} from 'better-auth/plugins';
import {PrismaClient} from '../../src/generated/prisma/client.ts';
import {ADMIN_DEV_ROUTES} from './admin-dev-routes.ts';
import {queryTestDb} from './test-db.ts';
import {ADMIN_DEV_FIXTURES, ADMIN_DEV_URL, ADMIN_EMAIL, testEnv} from './test-env.ts';

export type AdminDevFixtures = {
  records: Record<string, string>;
  expired: {id: string; cookies: Cookie[]}[];
};

export default async function setup() {
  const {rows: users} = await queryTestDb('SELECT id FROM users WHERE email = $1', [ADMIN_EMAIL]);
  if (!users[0]) throw new Error('Run pnpm test:e2e:prepare before the admin development suite.');
  const records: Record<string, string> = {};
  for (const [collection, sql] of [
    ['projects', 'SELECT id FROM projects ORDER BY id LIMIT 1'],
    ['posts', 'SELECT id FROM posts ORDER BY id LIMIT 1'],
    ['milestones', 'SELECT id FROM milestones ORDER BY id LIMIT 1'],
    ['timeline', 'SELECT id FROM timeline_entries ORDER BY id LIMIT 1'],
    ['stack', 'SELECT id FROM stack_items ORDER BY id LIMIT 1'],
  ]) {
    const {rows} = await queryTestDb(sql);
    if (!rows[0]) throw new Error(`Missing seeded ${collection} record; run pnpm test:e2e:prepare.`);
    records[collection] = rows[0].id;
  }
  const db = new PrismaClient({adapter: new PrismaPg({connectionString: testEnv.DATABASE_URL})});
  try {
    const auth = betterAuth({
      secret: testEnv.BETTER_AUTH_SECRET,
      baseURL: ADMIN_DEV_URL,
      database: prismaAdapter(db, {provider: 'postgresql'}),
      plugins: [testUtils()],
    });
    const {test} = await auth.$context;
    const expired: AdminDevFixtures['expired'] = [];
    // One session per URL: Better Auth may delete an expired row when checking it.
    for (let index = 0; index < ADMIN_DEV_ROUTES.length; index++) {
      const {session, cookies} = await test.login({userId: users[0].id});
      // Prisma stores UTC in timestamp-without-time-zone columns; avoid pg encoding a local-time Date here.
      await queryTestDb("UPDATE sessions SET expires_at = (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - INTERVAL '1 hour' WHERE id = $1", [session.id]);
      expired.push({
        id: session.id,
        cookies: cookies.map((cookie) => ({
          ...cookie,
          expires: -1,
          httpOnly: cookie.httpOnly ?? true,
          secure: cookie.secure ?? false,
          sameSite: cookie.sameSite ?? 'Lax',
        })),
      });
    }
    writeFileSync(ADMIN_DEV_FIXTURES, JSON.stringify({records, expired} satisfies AdminDevFixtures));
  } finally {
    await db.$disconnect();
  }
}

await setup();
