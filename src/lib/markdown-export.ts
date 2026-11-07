import type {PostDetail, ProjectDetail} from '@/server/content-schema';
import {reasoningRows} from './tour';

/*
 * Markdown versions of posts and case studies for AI agents and LLM tools, and the llms.txt index that links them
 * (ported from the previous site, #81). The same content as the HTML page without the layout, served at
 * /writing/<slug>.md, /projects/<slug>.md and to requests that send `Accept: text/markdown` (rewrites in next.config.ts).
 * Pure functions, so the route handlers stay thin and this is unit tested.
 */

type Block = string | false | null | undefined;

/** A metadata list, skipping empty entries. */
const metaList = (items: Block[]) =>
  items
    .filter(Boolean)
    .map((item) => `- ${item}`)
    .join('\n');

/** Blocks joined by blank lines, with one trailing newline. */
const document = (blocks: Block[]) => {
  const parts = blocks
    .filter((block): block is string => typeof block === 'string')
    .map((block) => block.trim())
    .filter(Boolean);
  return `${parts.join('\n\n')}\n`;
};

type Context = {
  /** The site owner's name. */
  author: string;
  /** The HTML page's absolute URL, which stays the canonical one. */
  url: string;
};

/** A post as Markdown: title, excerpt, a metadata list, then the body as written in the admin. */
export const postToMarkdown = (post: Pick<PostDetail, 'title' | 'excerpt' | 'date' | 'updatedAt' | 'tag' | 'body'>, ctx: Context) =>
  document([
    `# ${post.title}`,
    `> ${post.excerpt}`,
    metaList([
      `Author: ${ctx.author}`,
      `Published: ${post.date}`,
      `Updated: ${post.updatedAt.slice(0, 10)}`,
      `Tag: ${post.tag}`,
      `Canonical: ${ctx.url}`,
    ]),
    post.body,
  ]);

type MarkdownProject = Pick<
  ProjectDetail,
  'title' | 'summary' | 'kindLabel' | 'client' | 'role' | 'tags' | 'liveUrl' | 'repoUrl' | 'decision' | 'contribution' | 'outcome' | 'caseStudy'
>;

/** A case study as Markdown: summary, the facts row, the reasoning under the page's own headings, then the write-up. */
export const projectToMarkdown = (project: MarkdownProject, ctx: Context) =>
  document([
    `# ${project.title}`,
    `> ${project.summary}`,
    metaList([
      `Kind: ${project.kindLabel}`,
      project.client && `Client: ${project.client}`,
      project.role && `Role: ${project.role}`,
      project.tags.length > 0 && `Stack: ${project.tags.join(', ')}`,
      project.liveUrl && `Live site: ${project.liveUrl}`,
      project.repoUrl && `Source: ${project.repoUrl}`,
      `Built by: ${ctx.author}`,
      `Canonical: ${ctx.url}`,
    ]),
    ...reasoningRows(project).map(({label, text}) => `## ${label}\n\n${text}`),
    project.caseStudy,
  ]);

type LlmsInput = {
  name: string;
  /** The one-paragraph summary (the About intro). */
  summary: string;
  /** Facts as label and value, from the About panel's own copy. */
  facts: {label: string; value: string}[];
  site: string;
  email: string;
  posts: {title: string; excerpt: string; url: string}[];
  projects: {title: string; summary: string; url: string}[];
  /** Profile links (GitHub, LinkedIn) as label and URL; unset ones are left out by the caller. */
  links: {label: string; url: string; note: string}[];
};

/** llms.txt (https://llmstxt.org): a Markdown index of the site for LLM tools, linking the Markdown pages. */
export const llmsTxt = (input: LlmsInput) =>
  document([
    `# ${input.name}`,
    `> ${input.summary}`,
    metaList(input.facts.map(({label, value}) => `${label}: ${value}`)),
    `Site: ${input.site}/. Contact: ${input.email}.`,
    '## Writing',
    input.posts.map((post) => `- [${post.title}](${post.url}): ${post.excerpt}`).join('\n') || 'Nothing published yet.',
    '## Projects',
    input.projects.map((project) => `- [${project.title}](${project.url}): ${project.summary}`).join('\n') || 'Nothing listed yet.',
    '## Optional',
    input.links.map((link) => `- [${link.label}](${link.url}): ${link.note}`).join('\n'),
  ]);

/**
 * A Markdown response. `Link: rel=canonical` and noindex keep the HTML page as the one search engines list. `Vary: Accept`
 * because the page URL serves both formats, so a shared cache must not hand this to a browser (nothing caches in front
 * of the site today, and the HTML side can't send the header: the App Router page runtime replaces it).
 */
export const markdownResponse = (body: string, canonical: string) =>
  new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Vary: 'Accept',
      Link: `<${canonical}>; rel="canonical"`,
      'X-Robots-Tag': 'noindex',
    },
  });
