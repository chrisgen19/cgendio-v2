import 'server-only';
import {randomUUID, timingSafeEqual} from 'node:crypto';

/*
 * Admin edits that survive a restart. Tag invalidations (updateTag after an admin save) live in the server's memory,
 * so after a restart the build's prerendered pages look fresh again and edits made since the build disappear until
 * the next save. On every start, instrumentation.ts calls the revalidate route on this server once, with a one-time
 * token, and that route marks every content tag stale: each page re-renders from the database on its first visit
 * (served its build-time copy that once) and is fresh from the next visit on.
 */

export const STARTUP_REVALIDATE_PATH = '/api/internal/revalidate-content';
export const STARTUP_REVALIDATE_HEADER = 'x-startup-revalidate-token';

// On globalThis: instrumentation.ts and the route are bundled separately but share the process
const TOKEN_KEY = Symbol.for('cgendio.startupRevalidateToken');
const holder = globalThis as {[TOKEN_KEY]?: string};

const ATTEMPTS = 20;
const RETRY_MS = 500;

/** A new one-time token for this server process. */
export const issueStartupToken = () => {
  const token = randomUUID();
  holder[TOKEN_KEY] = token;
  return token;
};

/** True only for the token issued at startup, and only once: it's cleared on use, so the route then always says no. */
export const consumeStartupToken = (token: string | null) => {
  const expected = holder[TOKEN_KEY];
  if (!expected || !token) return false;
  const given = Buffer.from(token);
  const wanted = Buffer.from(expected);
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) return false;
  delete holder[TOKEN_KEY];
  return true;
};

/**
 * Calls the revalidate route on this server, retrying until it answers (register() has to finish before the server
 * takes requests, so this runs in the background). `next start` sets PORT once it's listening; the standalone server
 * defaults to 3000 like this does.
 */
export const revalidateContentOnStart = async () => {
  const token = issueStartupToken();
  const url = `http://127.0.0.1:${process.env.PORT ?? '3000'}${STARTUP_REVALIDATE_PATH}`;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, RETRY_MS));
    try {
      const response = await fetch(url, {method: 'POST', headers: {[STARTUP_REVALIDATE_HEADER]: token}, cache: 'no-store'});
      if (response.ok) return;
      // A refusal won't change on a retry
      console.warn(`Startup revalidation was refused (${response.status}): pages may show build-time content until the next admin save.`);
      return;
    } catch {
      // Not answering yet: try again
    }
  }
  console.warn('Startup revalidation: the server never answered, so pages may show build-time content until the next admin save.');
};
