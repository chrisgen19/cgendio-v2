import type {MetadataRoute} from 'next';
import {siteEnv} from '@/lib/env';
import {getSitemapEntries} from '@/server/content';

/**
 * Public pages and published content only. Admin, sign-in, previews and the Work filter variants are never listed
 * (they're noindex too). Blog tag and page variants share /blog as their canonical URL.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = siteEnv().NEXT_PUBLIC_SITE_URL;
  const {posts, projects} = await getSitemapEntries();
  return [
    {url: `${site}/`},
    {url: `${site}/blog`, lastModified: posts[0]?.lastModified},
    {url: `${site}/contact`},
    ...posts.map((post) => ({url: `${site}/blog/${post.slug}`, lastModified: post.lastModified})),
    ...projects.map((project) => ({url: `${site}/work/${project.slug}`, lastModified: project.lastModified})),
  ];
}
