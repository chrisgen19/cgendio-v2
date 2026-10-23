import 'server-only';
import type {PreviewType} from '@/lib/preview-signature';
import {type PostDetail, type ProjectDetail, toPostDetail, toProjectDetail} from './content';
import {db} from './db';

export type PreviewContent =
  | {type: 'post'; status: 'DRAFT' | 'PUBLISHED'; post: PostDetail}
  | {type: 'project'; status: 'DRAFT' | 'PUBLISHED'; project: ProjectDetail};

/**
 * The saved version of a post or project for a verified preview link, whatever its status, in the same shape the
 * public pages use. A draft post has no publish date yet, so it shows the date of its last save.
 */
export const getPreviewContent = async (type: PreviewType, slug: string): Promise<PreviewContent | null> => {
  if (type === 'post') {
    const row = await db.post.findUnique({where: {slug}});
    return row ? {type, status: row.status, post: toPostDetail(row, row.publishedAt ?? row.updatedAt)} : null;
  }
  const row = await db.project.findUnique({where: {slug}});
  return row ? {type, status: row.status, project: toProjectDetail(row)} : null;
};
