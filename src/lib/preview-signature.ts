import {createHmac, timingSafeEqual} from 'node:crypto';
import {authEnv} from './env';

/*
 * Signed draft-preview links: /preview/<type>/<slug>?expires=<unix seconds>&signature=<hex>. The signature is an
 * HMAC-SHA256 of "type:slug:expires" with BETTER_AUTH_SECRET, so a link can't be forged or reused for another draft,
 * and it stops working after an hour.
 */

export type PreviewType = 'post' | 'project';

export const isPreviewType = (value: unknown): value is PreviewType => value === 'post' || value === 'project';

const PREVIEW_SECONDS = 60 * 60;

const sign = (type: PreviewType, slug: string, expires: number) =>
  createHmac('sha256', authEnv().BETTER_AUTH_SECRET).update(`preview:${type}:${slug}:${expires}`).digest('hex');

export const createPreviewPath = (type: PreviewType, slug: string, now = Date.now()) => {
  const expires = Math.floor(now / 1000) + PREVIEW_SECONDS;
  const query = new URLSearchParams({expires: String(expires), signature: sign(type, slug, expires)});
  return `/preview/${type}/${encodeURIComponent(slug)}?${query}`;
};

/** True only for an unexpired link whose signature matches (compared in constant time). */
export const verifyPreview = (type: PreviewType, slug: string, expires: unknown, signature: unknown, now = Date.now()) => {
  if (typeof expires !== 'string' || typeof signature !== 'string' || !/^\d+$/.test(expires) || !/^[0-9a-f]{64}$/.test(signature)) return false;
  const expiresAt = Number(expires);
  if (expiresAt * 1000 < now) return false;
  const expected = Buffer.from(sign(type, slug, expiresAt), 'hex');
  const given = Buffer.from(signature, 'hex');
  return given.length === expected.length && timingSafeEqual(given, expected);
};
