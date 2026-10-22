import 'server-only';
import {createHmac, timingSafeEqual} from 'node:crypto';
import {authEnv} from '@/lib/env';
import {db} from './db';

/*
 * Signed draft-preview links: /preview/<type>/<slug>?expires=<unix seconds>&signature=<hex>. The signature is an
 * HMAC-SHA256 of "type:slug:expires" with BETTER_AUTH_SECRET, so a link can't be forged or reused for another draft,
 * and it stops working after an hour.
 */

export type PreviewType = 'post' | 'project';

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

/** The saved version of a post or project for a verified preview link, whatever its status. */
export const getPreviewContent = async (type: PreviewType, slug: string) => {
  if (type === 'post') {
    const post = await db.post.findUnique({where: {slug}});
    return post
      ? {kind: 'Post', title: post.title, intro: post.excerpt, label: post.tag, cover: post.coverImageUrl, markdown: post.body, status: post.status}
      : null;
  }
  const project = await db.project.findUnique({where: {slug}});
  return project
    ? {
        kind: 'Case study',
        title: project.title,
        intro: project.summary,
        label: project.kindLabel,
        cover: project.coverImageUrl,
        markdown: project.caseStudy ?? '',
        status: project.status,
      }
    : null;
};
