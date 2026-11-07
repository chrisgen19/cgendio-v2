import {connection} from 'next/server';
import {indexNowEnv} from '@/lib/env';

/*
 * The IndexNow key file (KEY_PATH in src/server/indexnow.ts): search engines fetch it to check that pings come from the
 * site owner. The key is a runtime variable the build doesn't have, so this is read per request, and it's a 404 while
 * INDEXNOW_KEY is unset.
 */
export async function GET() {
  await connection();
  const key = indexNowEnv().INDEXNOW_KEY;
  if (!key) return new Response(null, {status: 404});
  return new Response(key, {headers: {'Content-Type': 'text/plain; charset=utf-8'}});
}
