import 'server-only';
import {PrismaPg} from '@prisma/adapter-pg';
import {PrismaClient} from '@/generated/prisma/client';
import {serverEnv} from '@/lib/env';

/**
 * The Prisma client. Only src/server imports it: components get data through src/server/content.ts.
 * One client per process suits the long-running production container; in development the instance is kept on
 * globalThis so hot reload doesn't open a new connection pool on every edit.
 */
const createClient = () => new PrismaClient({adapter: new PrismaPg({connectionString: serverEnv().DATABASE_URL})});

const globalForPrisma = globalThis as unknown as {prisma?: PrismaClient};

export const db = globalForPrisma.prisma ?? createClient();

if (serverEnv().NODE_ENV !== 'production') globalForPrisma.prisma = db;
