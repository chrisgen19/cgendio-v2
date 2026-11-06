import type {Metadata} from 'next';

export const SITE_NAME = 'Cgdiomampo.dev';
/** The RSS feed, at the same path as the previous site so existing subscribers keep working. */
export const FEED_PATH = '/feed.xml';
export const SITE_DESCRIPTION = 'I take brands from research and Figma to fast WordPress and Next.js sites, then keep them running.';
/** Open Graph wants a language_TERRITORY code, not a bare language, and the previous site published en_US (#81). */
export const OG_LOCALE = 'en_US';
/** The name the previous site published under, kept as the Person's alternateName so searches for it still land (#81). */
export const PERSON_ALTERNATE_NAME = 'Chris Diomampo';
/** One word for the writing section, used by its title, its Blog node and its breadcrumb. "Blog" or "Writing" is #85. */
export const BLOG_TITLE = 'Blog';
export const HOME_TITLE = `${SITE_NAME} · Christian Diomampo, full-stack web developer`;

type PageMetadataInput = {
  /** A plain title goes through the root template ("Blog · Cgdiomampo.dev"); `{absolute}` skips it. */
  title: string | {absolute: string};
  description: string;
  /** Path from the site root; metadataBase in the root layout makes it absolute. */
  path: string;
  /** Posts are articles, with the day they were published. */
  article?: {publishedTime: string};
};

/**
 * Title, description, canonical URL and the Open Graph and Twitter cards for one route. Next replaces a parent's
 * `openGraph` and `twitter` instead of merging them, so every route passes complete objects. The images come from
 * the opengraph-image files next to the routes.
 */
export const pageMetadata = ({title, description, path, article}: PageMetadataInput): Metadata => {
  const cardTitle = typeof title === 'string' ? title : title.absolute;
  const shared = {siteName: SITE_NAME, locale: OG_LOCALE, url: path, title: cardTitle, description};
  return {
    title,
    description,
    // The feed link sits here, not in the root layout: a route's `alternates` replaces the parent's instead of merging
    alternates: {canonical: path, types: {'application/rss+xml': [{url: FEED_PATH, title: `${SITE_NAME} writing`}]}},
    openGraph: article ? {...shared, type: 'article', publishedTime: article.publishedTime} : {...shared, type: 'website'},
    twitter: {card: 'summary_large_image', title: cardTitle, description},
  };
};
