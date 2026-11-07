import type {Metadata} from 'next';

/**
 * The brand, used for og:site_name, the title suffix, applicationName, the header logo, the footer and the RSS channel.
 * The name, not the domain: people search for a person (#81 Phase A). The domain stays discoverable as the WebSite
 * node's alternateName in src/lib/structured-data.ts.
 */
export const SITE_NAME = 'Chris Diomampo';
/** The RSS feed, at the same path as the previous site so existing subscribers keep working. */
export const FEED_PATH = '/feed.xml';
/** Word for word the previous site's keyword-led description, which it ranks on (#81 Phase A). */
export const SITE_DESCRIPTION =
  'Chris Diomampo is a senior full-stack developer in Metro Manila, Philippines. Next.js, TypeScript and PostgreSQL, with 15+ years of WordPress, Shopify and PHP behind it.';
/** Open Graph wants a language_TERRITORY code, not a bare language, and the previous site published en_US (#81). */
export const OG_LOCALE = 'en_US';
/** The fuller form of the name. The brand is the short one, so this is the Person schema's alternateName (#81). */
export const PERSON_ALTERNATE_NAME = 'Christian Diomampo';
/** One word for the writing section, used by its title, its Blog node and its breadcrumb. "Blog" or "Writing" is #85. */
export const BLOG_TITLE = 'Blog';
/** Word for word the title the previous site ranks on, "Senior" included. */
export const HOME_TITLE = `${SITE_NAME} · Senior full-stack developer, Next.js and WordPress`;

/**
 * The id of the one share card a post or case study generates (generateImageMetadata in their opengraph-image files),
 * which is how each card gets its page title as alt text. It adds a segment to the image URL.
 */
export const OG_CARD_ID = 'card';

/** The share card image of a post or case study page, e.g. `/writing/<slug>/opengraph-image/card`. */
export const ogCardPath = (pagePath: string) => `${pagePath}/opengraph-image/${OG_CARD_ID}`;

type PageMetadataInput = {
  /** A plain title goes through the root template ("Blog · Chris Diomampo"); `{absolute}` skips it. */
  title: string | {absolute: string};
  description: string;
  /** Path from the site root; metadataBase in the root layout makes it absolute. */
  path: string;
  /** Posts are articles: full ISO timestamps, the author's name and the post's tags. */
  article?: {publishedTime: string; modifiedTime: string; authors: string[]; tags: string[]};
  /** Posts and case studies have a Markdown version at `<path>.md` (#81), advertised to agents as an alternate. */
  markdown?: boolean;
};

/**
 * Title, description, canonical URL and the Open Graph and Twitter cards for one route. Next replaces a parent's
 * `openGraph` and `twitter` instead of merging them, so every route passes complete objects. The images come from
 * the opengraph-image files next to the routes.
 */
export const pageMetadata = ({title, description, path, article, markdown}: PageMetadataInput): Metadata => {
  const cardTitle = typeof title === 'string' ? title : title.absolute;
  const shared = {siteName: SITE_NAME, locale: OG_LOCALE, url: path, title: cardTitle, description};
  return {
    title,
    description,
    // The feed link sits here, not in the root layout: a route's `alternates` replaces the parent's instead of merging
    alternates: {
      canonical: path,
      types: {
        'application/rss+xml': [{url: FEED_PATH, title: `${SITE_NAME} writing`}],
        ...(markdown ? {'text/markdown': `${path}.md`} : {}),
      },
    },
    openGraph: article ? {...shared, type: 'article', ...article} : {...shared, type: 'website'},
    twitter: {card: 'summary_large_image', title: cardTitle, description},
  };
};
