import {OG_SIZE, ogCard} from '@/app/_og/og-card';
import {stripMarkers} from '@/lib/marked-copy';
import {BLOG_TITLE, SITE_NAME} from '@/lib/metadata';
import {getPageCopy} from '@/server/content';

/** The page title, so it follows BLOG_TITLE ("Blog" or "Writing" is #85). */
export const alt = `${BLOG_TITLE} · ${SITE_NAME}`;
export const size = OG_SIZE;
export const contentType = 'image/png';

/** The writing index's share card, from the same copy the page shows. */
export default async function Image() {
  const copy = await getPageCopy();
  return ogCard({eyebrow: copy['blog.eyebrow'], title: stripMarkers(copy['blog.heading'])});
}
