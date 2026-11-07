import 'server-only';
import {db} from './db';

/** Well under the Docker HEALTHCHECK's 5 s timeout. */
const DATABASE_CHECK_MS = 1500;

export type DatabaseState = 'ok' | 'unreachable';

/**
 * "ok" if Postgres answers within DATABASE_CHECK_MS. A database that hangs (overloaded, or the pool is busy) has no
 * timeout of its own, so without this race the whole health check would hang. Ported from the previous site.
 */
export const getDatabaseState = async (): Promise<DatabaseState> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('timed out')), DATABASE_CHECK_MS);
  });
  try {
    await Promise.race([db.$queryRaw`SELECT 1`, timeout]);
    return 'ok';
  } catch {
    return 'unreachable';
  } finally {
    clearTimeout(timer);
  }
};
