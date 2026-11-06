import type {PageCopy, PostDetail, ProjectDetail, SiteSettings} from '@/server/content';
import {isEmail} from './email';
import {siteEnv} from './env';
import {SITE_DESCRIPTION} from './metadata';

/*
 * Schema.org JSON-LD built only from real content: no invented address, ratings or prices. Rendered with <JsonLd>.
 */

const origin = () => siteEnv().NEXT_PUBLIC_SITE_URL;

/** Christian, from the About copy: the name and the Role row's value. */
const person = (copy: PageCopy, settings?: SiteSettings) => ({
  '@type': 'Person',
  '@id': `${origin()}/#person`,
  name: copy['about.name'],
  jobTitle: copy['about.role.value'],
  url: `${origin()}/`,
  ...(settings ? {sameAs: Object.values(settings.socials).filter((url): url is string => Boolean(url))} : {}),
});

/** Points back at the Person above, so posts and case studies name Christian as their publisher without repeating the whole node. */
const personRef = () => ({'@id': `${origin()}/#person`});

/** Home page: Christian as a Person, with the site description, the share image and the contact email. */
export const homeJsonLd = (copy: PageCopy, settings: SiteSettings) => ({
  '@context': 'https://schema.org',
  ...person(copy, settings),
  description: SITE_DESCRIPTION,
  image: `${origin()}/opengraph-image.png`,
  ...(isEmail(settings.contactEmail) ? {email: settings.contactEmail} : {}),
});

export const postJsonLd = (post: PostDetail, copy: PageCopy) => {
  const url = `${origin()}/writing/${post.slug}`;
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
    publisher: personRef(),
  };
};

export const caseStudyJsonLd = (project: ProjectDetail, copy: PageCopy) => {
  const url = `${origin()}/projects/${project.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary,
    url,
    image: `${url}/opengraph-image`,
    keywords: project.tags.join(', '),
    creator: person(copy),
    publisher: personRef(),
  };
};
