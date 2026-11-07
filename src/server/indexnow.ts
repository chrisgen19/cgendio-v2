import 'server-only';
import {indexNowEnv, siteEnv} from '@/lib/env';

/*
 * IndexNow tells Bing (and Yandex, Seznam, Naver) right away that a URL was added, changed or removed, instead of waiting
 * for the next crawl. Bing's index also feeds Copilot and ChatGPT search. Ported from the previous site (#81).
 * https://www.indexnow.org/documentation
 */

const ENDPOINT = 'https://api.indexnow.org/indexnow';
/** Where the key is served (src/app/indexnow-key.txt). At the root, so it covers every path. */
export const KEY_PATH = '/indexnow-key.txt';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export type IndexNowPayload = {host: string; key: string; keyLocation: string; urlList: string[]};

/**
 * The IndexNow request body for `paths` on `siteUrl`, or null when there's nothing to send: no paths, or a local site
 * URL (search engines can't fetch the key from a dev machine, and e2e runs on localhost).
 */
export const buildIndexNowPayload = (paths: string[], siteUrl: string, key: string): IndexNowPayload | null => {
  const site = new URL(siteUrl);
  if (LOCAL_HOSTS.has(site.hostname)) return null;
  const urlList = [...new Set(paths.map((path) => new URL(path, site).href))];
  if (urlList.length === 0) return null;
  return {host: site.host, key, keyLocation: new URL(KEY_PATH, site).href, urlList};
};

/**
 * Pings IndexNow for public paths that changed. Best effort: call it inside `after()` so it never delays a save; a failed
 * ping only means the change is found on the next crawl. Bing Webmaster Tools, IndexNow shows what arrived.
 */
export const pingIndexNow = async (paths: string[]) => {
  const key = indexNowEnv().INDEXNOW_KEY;
  if (!key) return;
  const payload = buildIndexNowPayload(paths, siteEnv().NEXT_PUBLIC_SITE_URL, key);
  if (!payload) return;
  try {
    await fetch(ENDPOINT, {
      method: 'POST',
      headers: {'Content-Type': 'application/json; charset=utf-8'},
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Ignored on purpose (see above)
  }
};

/** The pages a published post appears on: its own (and its old URL after a slug change), the index and the home page. */
export const postPaths = (...slugs: string[]) => [...new Set(slugs)].map((slug) => `/writing/${slug}`).concat('/writing', '/');

/** The pages a published project appears on: its case study (old URL too) and the home page's work section. */
export const projectPaths = (...slugs: string[]) => [...new Set(slugs)].map((slug) => `/projects/${slug}`).concat('/');
