import type {MetadataRoute} from 'next';
import {siteEnv} from '@/lib/env';

const DISALLOW = ['/admin', '/preview', '/api'];

/**
 * The assistants and AI search engines that read the site, listed so their answers can cite it. Several of them ignore a
 * wildcard group and look for their own name, so they get a group of their own with the same rules (#81).
 */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
];

/** Admin, previews and the API stay out of crawls; those pages also send noindex. */
export default function robots(): MetadataRoute.Robots {
  const site = siteEnv().NEXT_PUBLIC_SITE_URL;
  return {
    rules: [
      {userAgent: '*', allow: '/', disallow: DISALLOW},
      {userAgent: AI_CRAWLERS, allow: '/', disallow: DISALLOW},
    ],
    sitemap: `${site}/sitemap.xml`,
  };
}
