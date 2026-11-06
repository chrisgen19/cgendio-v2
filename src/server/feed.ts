import 'server-only';
import {cacheLife, cacheTag} from 'next/cache';
import {siteEnv} from '@/lib/env';
import {CACHE_TAGS, getPageCopy, getPosts} from './content';

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/** RFC 822 date for RSS, from the stored UTC timestamp. */
const rssDate = (iso: string) => new Date(iso).toUTCString();

const RSS_DOCS = 'https://validator.w3.org/feed/docs/rss2.html';

/**
 * The RSS 2.0 feed for /feed.xml: the 20 newest published posts. Cached under the posts tag, so publishing in the
 * admin refreshes it. lastBuildDate is the newest post's timestamp rather than the current time, which keeps it
 * cacheable.
 *
 * TODO(#81): add <content:encoded> with each post's full body, which needs an HTML serialiser (see the PR).
 */
export const getFeedXml = async (): Promise<string> => {
  'use cache';
  cacheTag(CACHE_TAGS.posts, CACHE_TAGS.copy);
  cacheLife('max');
  const [posts, copy] = await Promise.all([getPosts({limit: 20}), getPageCopy()]);
  const site = siteEnv().NEXT_PUBLIC_SITE_URL;
  const author = copy['about.name'];

  const items = posts
    .map((post) => {
      const url = `${site}/writing/${post.slug}`;
      return [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        // Not a permalink: the guid is an identity for readers, so it must not change if a post ever moves
        `      <guid isPermaLink="false">${escapeXml(url)}</guid>`,
        `      <pubDate>${rssDate(post.publishedAt)}</pubDate>`,
        `      <dc:creator>${escapeXml(author)}</dc:creator>`,
        `      <category>${escapeXml(post.tag)}</category>`,
        `      <description>${escapeXml(post.excerpt)}</description>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  // Inside the cache scope, so the clock is allowed and the year is fixed until the posts tag is revalidated
  const year = new Date().getUTCFullYear();
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>Cgdiomampo.dev blog</title>',
    `    <link>${escapeXml(`${site}/writing`)}</link>`,
    `    <description>${escapeXml(copy['blog.lede'])}</description>`,
    '    <language>en</language>',
    `    <copyright>${escapeXml(`© ${year} ${author}`)}</copyright>`,
    `    <docs>${RSS_DOCS}</docs>`,
    `    <atom:link href="${escapeXml(`${site}/feed.xml`)}" rel="self" type="application/rss+xml"/>`,
    ...(posts[0] ? [`    <lastBuildDate>${rssDate(posts[0].publishedAt)}</lastBuildDate>`] : []),
    items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
};
