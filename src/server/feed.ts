import 'server-only';
import {cacheLife, cacheTag} from 'next/cache';
import {siteEnv} from '@/lib/env';
import {BLOG_TITLE, SITE_NAME} from '@/lib/metadata';
import {CACHE_TAGS, getPageCopy, getPost, getPosts} from './content';
import {renderFeedHtml} from './feed-markdown';

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/** Wraps HTML for an XML element. The only sequence that can end a CDATA section is split across two of them. */
const cdata = (value: string) => `<![CDATA[${value.replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;

/** RFC 822 date for RSS, from the stored UTC timestamp. */
const rssDate = (iso: string) => new Date(iso).toUTCString();

const RSS_DOCS = 'https://validator.w3.org/feed/docs/rss2.html';

/**
 * The RSS 2.0 feed for /feed.xml: the 20 newest published posts, each with its full body in content:encoded so the
 * feed can be read without visiting the site. Cached under the posts tag, so publishing in the admin refreshes it.
 * lastBuildDate is the newest post's timestamp rather than the current time, which keeps it cacheable.
 */
export const getFeedXml = async (): Promise<string> => {
  'use cache';
  cacheTag(CACHE_TAGS.posts, CACHE_TAGS.copy);
  cacheLife('max');
  const [posts, copy] = await Promise.all([getPosts({limit: 20}), getPageCopy()]);
  const site = siteEnv().NEXT_PUBLIC_SITE_URL;
  const author = copy['about.name'];

  // getPost is cached per slug and renderFeedHtml by body, so a feed rebuild re-converts nothing that has not changed
  const bodies = await Promise.all(
    posts.map(async (post) => {
      const detail = await getPost(post.slug);
      return detail ? await renderFeedHtml(detail.body) : '';
    }),
  );

  const items = posts
    .map((post, index) => {
      const url = `${site}/writing/${post.slug}`;
      const body = bodies[index];
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
        ...(body ? [`      <content:encoded>${cdata(body)}</content:encoded>`] : []),
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  // Inside the cache scope, so the clock is allowed and the year is fixed until the posts tag is revalidated
  const year = new Date().getUTCFullYear();
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(`${SITE_NAME} · ${BLOG_TITLE}`)}</title>`,
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
