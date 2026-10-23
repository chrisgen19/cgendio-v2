import 'server-only';
import {requireAdmin} from '../admin-session';
import {db} from '../db';

/*
 * Reads for the admin pages: always fresh (no 'use cache'), drafts included, and each one checks the session again.
 * Dates go out as ISO strings so they can be passed to client components.
 */

const iso = (date: Date | null) => (date ? date.toISOString() : null);

export const listProjects = async () => {
  await requireAdmin();
  const rows = await db.project.findMany({orderBy: {order: 'asc'}});
  return rows.map((row) => ({id: row.id, title: row.title, slug: row.slug, status: row.status, featured: row.featured, group: row.group}));
};

export const getProjectForEdit = async (id: string) => {
  await requireAdmin();
  const row = await db.project.findUnique({where: {id}});
  return row ? {...row, createdAt: iso(row.createdAt), updatedAt: iso(row.updatedAt)} : null;
};

export const listPosts = async () => {
  await requireAdmin();
  const rows = await db.post.findMany({orderBy: [{publishedAt: {sort: 'desc', nulls: 'first'}}, {updatedAt: 'desc'}]});
  return rows.map((row) => ({id: row.id, title: row.title, slug: row.slug, status: row.status, publishedAt: iso(row.publishedAt)}));
};

export const getPostForEdit = async (id: string) => {
  await requireAdmin();
  const row = await db.post.findUnique({where: {id}});
  return row ? {...row, publishedAt: iso(row.publishedAt), createdAt: iso(row.createdAt), updatedAt: iso(row.updatedAt)} : null;
};

export const listMilestones = async () => {
  await requireAdmin();
  return db.milestone.findMany({orderBy: {order: 'asc'}, select: {id: true, kind: true, value: true, title: true, description: true}});
};

export const listTimeline = async () => {
  await requireAdmin();
  return db.timelineEntry.findMany({
    orderBy: {order: 'asc'},
    select: {id: true, when: true, role: true, org: true, description: true, dot: true, isCurrent: true},
  });
};

export const listStack = async () => {
  await requireAdmin();
  return db.stackItem.findMany({orderBy: {order: 'asc'}, select: {id: true, name: true}});
};

export const getSettingsForEdit = async () => {
  await requireAdmin();
  return db.siteSettings.findUniqueOrThrow({where: {id: 'site'}, select: {contactEmail: true, openToProjects: true, cvUrl: true}});
};

export const getPageCopyForEdit = async () => {
  await requireAdmin();
  const rows = await db.pageCopy.findMany({select: {key: true, value: true}});
  return Object.fromEntries(rows.map((row) => [row.key, row.value])) as Record<string, string>;
};

/** Counts per collection and the ten most recent edits across all of them. */
export const getDashboard = async () => {
  await requireAdmin();
  const recent = {take: 10, orderBy: {updatedAt: 'desc' as const}};
  const [projects, posts, milestones, timeline, stack, unread, p, po, m, t, s] = await Promise.all([
    db.project.count(),
    db.post.count(),
    db.milestone.count(),
    db.timelineEntry.count(),
    db.stackItem.count(),
    db.contactMessage.count({where: {readAt: null}}),
    db.project.findMany({...recent, select: {id: true, title: true, updatedAt: true}}),
    db.post.findMany({...recent, select: {id: true, title: true, updatedAt: true}}),
    db.milestone.findMany({...recent, select: {id: true, title: true, updatedAt: true}}),
    db.timelineEntry.findMany({...recent, select: {id: true, role: true, updatedAt: true}}),
    db.stackItem.findMany({...recent, select: {id: true, name: true, updatedAt: true}}),
  ]);
  const edits = [
    ...p.map((r) => ({id: r.id, label: r.title, kind: 'Project', href: `/admin/projects/${r.id}`, at: r.updatedAt})),
    ...po.map((r) => ({id: r.id, label: r.title, kind: 'Post', href: `/admin/posts/${r.id}`, at: r.updatedAt})),
    ...m.map((r) => ({id: r.id, label: r.title, kind: 'Milestone', href: '/admin/milestones', at: r.updatedAt})),
    ...t.map((r) => ({id: r.id, label: r.role, kind: 'Timeline', href: '/admin/timeline', at: r.updatedAt})),
    ...s.map((r) => ({id: r.id, label: r.name, kind: 'Stack', href: '/admin/stack', at: r.updatedAt})),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 10)
    .map((edit) => ({...edit, at: edit.at.toISOString()}));
  return {counts: {projects, posts, milestones, timeline, stack, unread}, edits};
};

export const getMilestoneForEdit = async (id: string) => {
  await requireAdmin();
  return db.milestone.findUnique({where: {id}, select: {id: true, kind: true, value: true, title: true, description: true}});
};

export const getTimelineEntryForEdit = async (id: string) => {
  await requireAdmin();
  return db.timelineEntry.findUnique({
    where: {id},
    select: {id: true, when: true, role: true, org: true, description: true, dot: true, isCurrent: true},
  });
};

export const getStackItemForEdit = async (id: string) => {
  await requireAdmin();
  return db.stackItem.findUnique({where: {id}, select: {id: true, name: true}});
};

/** Contact form messages for the inbox, newest first. */
export const listContactMessages = async () => {
  await requireAdmin();
  const rows = await db.contactMessage.findMany({orderBy: {createdAt: 'desc'}});
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company,
    projectType: row.projectType,
    message: row.message,
    readAt: iso(row.readAt),
    emailedAt: iso(row.emailedAt),
    createdAt: iso(row.createdAt) as string,
  }));
};

export type ContactMessageRow = Awaited<ReturnType<typeof listContactMessages>>[number];
