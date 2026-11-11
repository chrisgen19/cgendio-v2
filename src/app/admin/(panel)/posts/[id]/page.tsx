import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {PageHeader} from '@/components/admin/page-header';
import {PostForm} from '@/components/admin/post-form';
import {PreviewButton} from '@/components/admin/preview-button';
import {getPostForEdit} from '@/server/admin/data';

// Session checks may redirect before this page renders; instant validation is segment-local.
export const instant = false;

export const metadata: Metadata = {title: 'Edit post'};

/** /admin/posts/new creates; /admin/posts/<id> edits. */
export default async function PostEditPage({params}: PageProps<'/admin/posts/[id]'>) {
  const {id} = await params;
  if (id === 'new') {
    return (
      <>
        <PageHeader title="New post" description="Saved as a draft unless you switch Published on." />
        <PostForm post={null} />
      </>
    );
  }
  const post = await getPostForEdit(id);
  if (!post) notFound();
  return (
    <>
      <PageHeader
        title={post.title}
        description={`Last saved ${new Date(post.updatedAt ?? '').toLocaleString('en-AU')}`}
        actions={<PreviewButton type="post" id={post.id} />}
      />
      <PostForm post={post} />
    </>
  );
}
