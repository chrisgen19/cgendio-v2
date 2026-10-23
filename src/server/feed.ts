import 'server-only';
import {cacheLife, cacheTag} from 'next/cache';
import {siteEnv} from '@/lib/env';
import {CACHE_TAGS, getPageCopy, getPosts} from './content';

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/** RFC 822 date for RSS, from a stored UTC day ("2026-10-01"). */
const rssDate = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`).toUTCString();

/**
 * The RSS 2.0 feed for /blog/rss.xml: the 20 newest published posts. Cached under the posts tag, so publishing in the
 * admin refreshes it. lastBuildDate is the newest post's date rather than the current time, which keeps it cacheable.
 */
export const getFeedXml = async (): Promise<string> => {
  'use cache';
  cacheTag(CACHE_TAGS.posts, CACHE_TAGS.copy);
  cacheLife('max');
  const [posts, copy] = await Promise.all([getPosts({limit: 20}), getPageCopy()]);
  const site = siteEnv().NEXT_PUBLIC_SITE_URL;
  const items = posts
    .map((post) => {
      const url = `${site}/blog/${post.slug}`;
      return [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${rssDate(post.date)}</pubDate>`,
        `      <category>${escapeXml(post.tag)}</category>`,
        `      <description>${escapeXml(post.excerpt)}</description>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>Cgdiomampo.dev blog</title>',
    `    <link>${escapeXml(`${site}/blog`)}</link>`,
    `    <description>${escapeXml(copy['blog.lede'])}</description>`,
    '    <language>en</language>',
    `    <atom:link href="${escapeXml(`${site}/blog/rss.xml`)}" rel="self" type="application/rss+xml"/>`,
    ...(posts[0] ? [`    <lastBuildDate>${rssDate(posts[0].date)}</lastBuildDate>`] : []),
    items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
};
