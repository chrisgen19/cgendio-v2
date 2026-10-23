import pg from 'pg';
import {testEnv} from './test-env';

/**
 * One query against the e2e database, for test setup. It goes around the app, so nothing is revalidated: only use it
 * for state the test then changes through the app itself.
 */
export const queryTestDb = async (text: string, values: unknown[] = []) => {
  const client = new pg.Client({connectionString: testEnv.DATABASE_URL});
  await client.connect();
  try {
    return await client.query(text, values);
  } finally {
    await client.end();
  }
};
