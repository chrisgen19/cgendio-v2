import type {Metadata} from 'next';

export const SITE_NAME = 'Cgdiomampo.dev';
export const SITE_DESCRIPTION = 'We take brands from research and Figma to fast WordPress and Next.js sites, then keep them running.';

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
  const shared = {siteName: SITE_NAME, locale: 'en', url: path, title: cardTitle, description};
  return {
    title,
    description,
    alternates: {canonical: path},
    openGraph: article ? {...shared, type: 'article', publishedTime: article.publishedTime} : {...shared, type: 'website'},
    twitter: {card: 'summary_large_image', title: cardTitle, description},
  };
};
