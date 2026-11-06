import type {PageCopy, Post, PostDetail, ProjectDetail, SiteSettings, StackItem} from '@/server/content';
import {isEmail} from './email';
import {siteEnv} from './env';
import {BLOG_TITLE, PERSON_ALTERNATE_NAME, SITE_DESCRIPTION, SITE_NAME} from './metadata';

/*
 * Schema.org JSON-LD built only from real content: no invented address, ratings or prices. Rendered with <JsonLd>.
 *
 * Every page emits one @graph whose nodes share stable @ids, so a crawler reading two pages sees one Person and one
 * WebSite rather than a copy per page. Only the page's own subject is written out in full; the rest are @id references.
 */

const origin = () => siteEnv().NEXT_PUBLIC_SITE_URL;

const PERSON_ID = () => `${origin()}/#person`;
const WEBSITE_ID = () => `${origin()}/#website`;
const BLOG_ID = () => `${origin()}/writing#blog`;

/** Points at a node defined in full elsewhere, so posts and case studies name Christian without repeating him. */
const ref = (id: string) => ({'@id': id});

/** Christian, from the About copy: the name and the Role row's value. `knowsAbout` is the stack strip, not a guess. */
const person = (copy: PageCopy, {settings, stack}: {settings?: SiteSettings; stack?: StackItem[]} = {}) => ({
  '@type': 'Person',
  '@id': PERSON_ID(),
  name: copy['about.name'],
  alternateName: PERSON_ALTERNATE_NAME,
  jobTitle: copy['about.role.value'],
  url: `${origin()}/`,
  ...(stack?.length ? {knowsAbout: stack.map((item) => item.name)} : {}),
  ...(settings ? {sameAs: Object.values(settings.socials).filter((url): url is string => Boolean(url))} : {}),
});

/** A short Person for an author slot: enough to render, with the @id tying it to the full node on the home page. */
const authorRef = (copy: PageCopy) => ({'@type': 'Person', '@id': PERSON_ID(), name: copy['about.name'], url: `${origin()}/`});

const website = () => ({
  '@type': 'WebSite',
  '@id': WEBSITE_ID(),
  url: `${origin()}/`,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  inLanguage: 'en',
  publisher: ref(PERSON_ID()),
});

/** A trail of named pages. Google wants position to start at 1 and the last item to be the page itself. */
const breadcrumbs = (trail: {name: string; path: string}[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((step, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: step.name,
    item: `${origin()}${step.path}`,
  })),
});

const HOME_CRUMB = {name: 'Home', path: '/'};
const BLOG_CRUMB = {name: BLOG_TITLE, path: '/writing'};

/** Home page: the site, the profile and Christian himself, the one place the Person is written out in full. */
export const homeJsonLd = (copy: PageCopy, settings: SiteSettings, stack: StackItem[], homeTitle: string) => ({
  '@context': 'https://schema.org',
  '@graph': [
    website(),
    {
      '@type': 'ProfilePage',
      '@id': `${origin()}/`,
      url: `${origin()}/`,
      name: homeTitle,
      isPartOf: ref(WEBSITE_ID()),
      mainEntity: ref(PERSON_ID()),
    },
    {
      ...person(copy, {settings, stack}),
      description: SITE_DESCRIPTION,
      image: `${origin()}/opengraph-image.png`,
      ...(isEmail(settings.contactEmail) ? {email: `mailto:${settings.contactEmail}`} : {}),
    },
  ],
});

/** The writing index: the Blog itself, listing the posts it holds. */
export const blogJsonLd = (copy: PageCopy, posts: Post[]) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Blog',
      '@id': BLOG_ID(),
      url: `${origin()}/writing`,
      name: `${SITE_NAME} · ${BLOG_TITLE}`,
      description: copy['blog.lede'],
      inLanguage: 'en',
      author: authorRef(copy),
      publisher: ref(PERSON_ID()),
      isPartOf: ref(WEBSITE_ID()),
      blogPost: posts.map((post) => ({
        '@type': 'BlogPosting',
        '@id': `${origin()}/writing/${post.slug}#article`,
        headline: post.title,
        url: `${origin()}/writing/${post.slug}`,
        datePublished: post.date,
      })),
    },
    breadcrumbs([HOME_CRUMB, BLOG_CRUMB]),
  ],
});

export const postJsonLd = (post: PostDetail, copy: PageCopy) => {
  const url = `${origin()}/writing/${post.slug}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        headline: post.title,
        description: post.excerpt,
        url,
        mainEntityOfPage: url,
        image: `${url}/opengraph-image`,
        datePublished: post.date,
        inLanguage: 'en',
        articleSection: post.tag,
        keywords: post.tag,
        author: authorRef(copy),
        publisher: ref(PERSON_ID()),
        isPartOf: ref(BLOG_ID()),
      },
      breadcrumbs([HOME_CRUMB, BLOG_CRUMB, {name: post.title, path: `/writing/${post.slug}`}]),
    ],
  };
};

export const caseStudyJsonLd = (project: ProjectDetail, copy: PageCopy) => {
  const url = `${origin()}/projects/${project.slug}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': `${url}#work`,
        name: project.title,
        description: project.summary,
        url,
        image: `${url}/opengraph-image`,
        genre: project.kindLabel,
        keywords: project.tags,
        inLanguage: 'en',
        creator: authorRef(copy),
        publisher: ref(PERSON_ID()),
        isPartOf: ref(WEBSITE_ID()),
      },
      // The case studies have no index page of their own: they hang off the home page's work section
      breadcrumbs([HOME_CRUMB, {name: project.title, path: `/projects/${project.slug}`}]),
    ],
  };
};
