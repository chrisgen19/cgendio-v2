import 'server-only';
import {cacheLife, cacheTag} from 'next/cache';
import {siteEnv} from '@/lib/env';
import {llmsTxt, postToMarkdown, projectToMarkdown} from '@/lib/markdown-export';
import {FEED_PATH} from '@/lib/metadata';
import {CACHE_TAGS, getPageCopy, getPost, getPosts, getProject, getProjectSlugs, getSiteSettings} from './content';

/** Profile links for llms.txt, in the order the contact row shows them. */
const PROFILE_LINKS = [
  {key: 'github', label: 'GitHub', note: 'code and side projects'},
  {key: 'linkedin', label: 'LinkedIn', note: 'work history'},
] as const;

/** A published post as Markdown, or null for drafts and unknown slugs. Cached like the page it mirrors. */
export const getPostMarkdown = async (slug: string): Promise<string | null> => {
  'use cache';
  cacheTag(CACHE_TAGS.posts, CACHE_TAGS.copy);
  cacheLife('max');
  const [post, copy] = await Promise.all([getPost(slug), getPageCopy()]);
  if (!post) return null;
  return postToMarkdown(post, {author: copy['about.name'], url: `${siteEnv().NEXT_PUBLIC_SITE_URL}/writing/${post.slug}`});
};

/** A published project as Markdown, or null for drafts and unknown slugs. */
export const getProjectMarkdown = async (slug: string): Promise<string | null> => {
  'use cache';
  cacheTag(CACHE_TAGS.projects, CACHE_TAGS.copy);
  cacheLife('max');
  const [project, copy] = await Promise.all([getProject(slug), getPageCopy()]);
  if (!project) return null;
  return projectToMarkdown(project, {author: copy['about.name'], url: `${siteEnv().NEXT_PUBLIC_SITE_URL}/projects/${project.slug}`});
};

/** The llms.txt index: who I am, then every published post and project, linked at their Markdown URLs. */
export const getLlmsTxt = async (): Promise<string> => {
  'use cache';
  cacheTag(CACHE_TAGS.posts, CACHE_TAGS.projects, CACHE_TAGS.copy, CACHE_TAGS.settings);
  cacheLife('max');
  const site = siteEnv().NEXT_PUBLIC_SITE_URL;
  const [copy, settings, posts, projectSlugs] = await Promise.all([getPageCopy(), getSiteSettings(), getPosts(), getProjectSlugs()]);
  // Every published project has a case study page, featured or not, so the index lists them all (as the sitemap does)
  const projects = (await Promise.all(projectSlugs.map((slug) => getProject(slug)))).filter((project) => project !== null);
  const profiles = PROFILE_LINKS.flatMap(({key, label, note}) => {
    const url = settings.socials[key];
    return url ? [{label, url, note}] : [];
  });

  return llmsTxt({
    name: copy['about.name'],
    summary: copy['about.intro'],
    facts: [
      {label: copy['about.role.label'], value: `${copy['about.role.value']} (${copy['about.role.note']})`},
      {label: copy['about.based.label'], value: copy['about.based.value']},
      {label: copy['about.timezone.label'], value: `${copy['about.timezone.value']}. ${copy['about.timezone.note']}`},
      {label: copy['about.experience.label'], value: copy['about.experience.value']},
    ],
    site,
    email: settings.contactEmail,
    posts: posts.map((post) => ({title: post.title, excerpt: post.excerpt, url: `${site}/writing/${post.slug}.md`})),
    projects: projects.map((project) => ({title: project.title, summary: project.summary, url: `${site}/projects/${project.slug}.md`})),
    links: [
      ...profiles,
      {label: 'RSS feed', url: `${site}${FEED_PATH}`, note: 'every post in full'},
      {label: 'Sitemap', url: `${site}/sitemap.xml`, note: 'every page'},
    ],
  });
};
