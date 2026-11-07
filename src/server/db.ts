import 'server-only';
import {PrismaPg} from '@prisma/adapter-pg';
import {PrismaClient} from '@/generated/prisma/client';
import {serverEnv} from '@/lib/env';

/**
 * The Prisma client. Only src/server imports it: components get data through src/server/content.ts.
 * One client per process suits the long-running production container; in development the instance is kept on
 * globalThis so hot reload doesn't open a new connection pool on every edit.
 */
/**
 * pg's defaults wait forever: for a free connection (`connectionTimeoutMillis` unset) and for a query (`query_timeout`
 * off). While Postgres hangs, every request that needs it, and every health probe, would leave another waiter behind.
 * These bound both; `query_timeout` is client-side, so it also ends a query to a database that stopped answering. No
 * query here legitimately takes 10 s (migrations run through the Prisma CLI, not this client).
 */
const POOL_TIMEOUTS = {connectionTimeoutMillis: 5_000, query_timeout: 10_000};

const createClient = () => new PrismaClient({adapter: new PrismaPg({connectionString: serverEnv().DATABASE_URL, ...POOL_TIMEOUTS})});

const globalForPrisma = globalThis as unknown as {prisma?: PrismaClient};

export const db = globalForPrisma.prisma ?? createClient();

if (serverEnv().NODE_ENV !== 'production') globalForPrisma.prisma = db;
