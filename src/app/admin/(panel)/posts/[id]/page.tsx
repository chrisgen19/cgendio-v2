import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {PageHeader} from '@/components/admin/page-header';
import {PostForm} from '@/components/admin/post-form';
import {getPostForEdit} from '@/server/admin/data';

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
      <PageHeader title={post.title} description={`Last saved ${new Date(post.updatedAt ?? '').toLocaleString('en-AU')}`} />
      <PostForm post={post} />
    </>
  );
}
