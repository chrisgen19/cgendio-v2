import type {PageCopy, PostDetail, ProjectDetail, SiteSettings} from '@/server/content';
import {isEmail} from './email';
import {siteEnv} from './env';
import {SITE_DESCRIPTION, SITE_NAME} from './metadata';

/*
 * Schema.org JSON-LD built only from real content: no invented address, ratings or prices. Rendered with <JsonLd>.
 */

const origin = () => siteEnv().NEXT_PUBLIC_SITE_URL;

/** Christian, from the About copy. The role line reads "Full-stack developer · Taguig, PH"; the job title is its first part. */
const person = (copy: PageCopy, settings?: SiteSettings) => ({
  '@type': 'Person',
  '@id': `${origin()}/#person`,
  name: copy['about.name'],
  jobTitle: copy['about.role'].split(' · ')[0],
  url: `${origin()}/`,
  ...(settings ? {sameAs: Object.values(settings.socials).filter((url): url is string => Boolean(url))} : {}),
});

const studio = () => ({'@type': 'Organization', '@id': `${origin()}/#studio`, name: SITE_NAME, url: `${origin()}/`});

/** Home page: the studio as a ProfessionalService, founded by Christian. */
export const homeJsonLd = (copy: PageCopy, settings: SiteSettings) => ({
  '@context': 'https://schema.org',
  '@graph': [
    person(copy, settings),
    {
      ...studio(),
      '@type': 'ProfessionalService',
      description: SITE_DESCRIPTION,
      image: `${origin()}/opengraph-image.png`,
      founder: {'@id': `${origin()}/#person`},
      ...(isEmail(settings.contactEmail) ? {email: settings.contactEmail} : {}),
    },
  ],
});

export const postJsonLd = (post: PostDetail, copy: PageCopy) => {
  const url = `${origin()}/blog/${post.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    url,
    mainEntityOfPage: url,
    image: `${url}/opengraph-image`,
    keywords: post.tag,
    author: person(copy),
    publisher: studio(),
  };
};

export const caseStudyJsonLd = (project: ProjectDetail, copy: PageCopy) => {
  const url = `${origin()}/work/${project.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary,
    url,
    image: `${url}/opengraph-image`,
    keywords: project.tags.join(', '),
    creator: person(copy),
    publisher: studio(),
  };
};
