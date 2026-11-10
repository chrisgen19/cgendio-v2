import {createHmac} from 'node:crypto';
import {testEnv} from './test-env';

/**
 * A signed, one-hour draft-preview path, signed like src/lib/preview-signature.ts with the e2e server's secret. If the
 * signing scheme changes, the preview answers 404 and the tests that use this fail loudly.
 */
export const previewPath = (type: 'post' | 'project', slug: string) => {
  const expires = Math.floor(Date.now() / 1000) + 3600;
  const signature = createHmac('sha256', testEnv.BETTER_AUTH_SECRET).update(`preview:${type}:${slug}:${expires}`).digest('hex');
  return `/preview/${type}/${encodeURIComponent(slug)}?${new URLSearchParams({expires: String(expires), signature})}`;
};
