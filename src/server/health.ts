import 'server-only';
import {db} from './db';

/** Well under the Docker HEALTHCHECK's 5 s timeout. */
const DATABASE_CHECK_MS = 1500;

export type DatabaseState = 'ok' | 'unreachable';

/**
 * "ok" if Postgres answers within DATABASE_CHECK_MS. The race answers the probe quickly; the query it leaves behind is
 * ended by the pool's own timeouts (src/server/db.ts), so probes during an outage don't pile up. Ported from the
 * previous site.
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
