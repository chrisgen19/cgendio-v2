import type {MetadataRoute} from 'next';
import {siteEnv} from '@/lib/env';
import {getSitemapEntries} from '@/server/content';

/**
 * Public pages and published content only. Admin, sign-in and previews are never listed
 * (they're noindex too). Blog tag and page variants share /blog as their canonical URL.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = siteEnv().NEXT_PUBLIC_SITE_URL;
  const {posts, projects} = await getSitemapEntries();
  // Editing any post can change the index (title, excerpt, tag), so /blog changed when its latest-saved post did.
  // The values are all toISOString() output, so comparing them as strings compares the times.
  const blogLastModified = posts.reduce<string | undefined>(
    (latest, post) => (!latest || post.lastModified > latest ? post.lastModified : latest),
    undefined,
  );
  return [
    {url: `${site}/`},
    {url: `${site}/blog`, lastModified: blogLastModified},
    {url: `${site}/contact`},
    ...posts.map((post) => ({url: `${site}/blog/${post.slug}`, lastModified: post.lastModified})),
    ...projects.map((project) => ({url: `${site}/work/${project.slug}`, lastModified: project.lastModified})),
  ];
}
