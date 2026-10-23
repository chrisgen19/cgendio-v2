import type {MetadataRoute} from 'next';
import {siteEnv} from '@/lib/env';

/** Admin, previews and the API stay out of crawls; those pages also send noindex. */
export default function robots(): MetadataRoute.Robots {
  const site = siteEnv().NEXT_PUBLIC_SITE_URL;
  return {
    rules: {userAgent: '*', allow: '/', disallow: ['/admin', '/preview', '/api']},
    sitemap: `${site}/sitemap.xml`,
  };
}
