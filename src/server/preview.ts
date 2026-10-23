import 'server-only';
import type {PreviewType} from '@/lib/preview-signature';
import {db} from './db';

/** The saved version of a post or project for a verified preview link, whatever its status. */
export const getPreviewContent = async (type: PreviewType, slug: string) => {
  if (type === 'post') {
    const post = await db.post.findUnique({where: {slug}});
    return post
      ? {kind: 'Post', title: post.title, intro: post.excerpt, label: post.tag, cover: post.coverImageUrl, markdown: post.body, status: post.status}
      : null;
  }
  const project = await db.project.findUnique({where: {slug}});
  return project
    ? {
        kind: 'Case study',
        title: project.title,
        intro: project.summary,
        label: project.kindLabel,
        cover: project.coverImageUrl,
        markdown: project.caseStudy ?? '',
        status: project.status,
      }
    : null;
};
