/**
 * Seeds the content tables from the Phase 3 data. Idempotent: every insert is `ON CONFLICT DO NOTHING` on a unique
 * key, so a second run changes nothing, and rows edited in the admin later are never overwritten.
 *
 * Run with `pnpm db:seed` (prisma.config.ts runs it with Node's built-in TypeScript support).
 */
import {existsSync, readFileSync} from 'node:fs';
import {PrismaPg} from '@prisma/adapter-pg';
import {type Prisma, PrismaClient} from '../src/generated/prisma/client.ts';
import {readMinutesFor} from '../src/server/admin/action-helpers.ts';
import {milestones} from './seed-data/milestones.ts';
import {pageCopy} from './seed-data/page-copy.ts';
import {posts} from './seed-data/posts.ts';
import {projects} from './seed-data/projects.ts';
import {stack} from './seed-data/stack.ts';
import {timeline} from './seed-data/timeline.ts';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is not set (copy .env.example to .env for local development)');

const db = new PrismaClient({adapter: new PrismaPg({connectionString: databaseUrl})});

/** "Joined the IT team" -> "joined-the-it-team" */
const toKey = (...parts: string[]) =>
  parts
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const upper = <T extends string>(value: T) => value.toUpperCase() as Uppercase<T>;

const PLACEHOLDER_BODY = '[Post body]';

/** A post's Markdown from seed-data/posts/<slug>.md, or the placeholder for posts that aren't written yet. */
const postBody = (slug: string) => {
  const file = new URL(`./seed-data/posts/${slug}.md`, import.meta.url);
  return existsSync(file) ? readFileSync(file, 'utf8') : PLACEHOLDER_BODY;
};

/** A project's case study from seed-data/projects/<slug>.md, or null (the page then shows its placeholder). */
const caseStudy = (slug: string) => {
  const file = new URL(`./seed-data/projects/${slug}.md`, import.meta.url);
  return existsSync(file) ? readFileSync(file, 'utf8') : null;
};

const seed = async () => {
  const results = await db.$transaction([
    db.stackItem.createMany({data: stack.map(({name, order}) => ({name, order})), skipDuplicates: true}),
    db.project.createMany({
      data: projects.map(
        (p): Prisma.ProjectCreateManyInput => ({
          slug: p.slug,
          title: p.title,
          summary: p.summary,
          kindLabel: p.kindLabel,
          group: upper(p.group),
          glyph: p.glyph,
          theme: upper(p.theme),
          span: p.span,
          tags: p.tags,
          featured: p.featured,
          order: p.order,
          status: 'PUBLISHED',
          caseStudy: caseStudy(p.slug),
          coverImageUrl: p.coverImageUrl,
          liveUrl: p.liveUrl,
          repoUrl: p.repoUrl,
          client: p.client,
          role: p.role,
        }),
      ),
      skipDuplicates: true,
    }),
    db.milestone.createMany({
      data: milestones.map((m) => ({key: toKey(m.title), kind: m.kind, value: m.value, title: m.title, description: m.description, order: m.order})),
      skipDuplicates: true,
    }),
    db.timelineEntry.createMany({
      data: timeline.map((t) => ({
        key: toKey(t.role, t.org),
        when: t.when,
        role: t.role,
        org: t.org,
        description: t.description,
        dot: upper(t.dot),
        isCurrent: t.isCurrent,
        order: t.order,
      })),
      skipDuplicates: true,
    }),
    db.post.createMany({
      data: posts.map((p) => {
        const body = postBody(p.slug);
        return {
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          tag: p.tag,
          body,
          readMinutes: readMinutesFor(body),
          status: p.status,
          publishedAt: p.status === 'PUBLISHED' ? new Date(`${p.date}T00:00:00Z`) : null,
        };
      }),
      skipDuplicates: true,
    }),
    db.siteSettings.createMany({
      // The photo's r2.dev URL in cgendio-media; it changes when the bucket gets its custom domain
      data: [
        {
          id: 'site',
          contactEmail: 'chrisgen19@gmail.com',
          openToProjects: true,
          photoUrl: 'https://pub-2804367faf354b5c8072c41278bae114.r2.dev/images/2026/eaae01e4-c164-4d78-bcf3-f6657aa845c2.png',
          socials: {github: 'https://github.com/chrisgen19', linkedin: 'https://www.linkedin.com/in/cgdiomampo/'},
        },
      ],
      skipDuplicates: true,
    }),
    db.pageCopy.createMany({data: Object.entries(pageCopy).map(([key, value]) => ({key, value})), skipDuplicates: true}),
  ]);

  const names = ['stack items', 'projects', 'milestones', 'timeline entries', 'posts', 'site settings', 'page copy'];
  for (const [i, result] of results.entries()) console.info(`${names[i]}: ${result.count} inserted`);
};

try {
  await seed();
} finally {
  await db.$disconnect();
}
