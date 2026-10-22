import type {Metadata} from 'next';
import Link from 'next/link';
import {PageHeader} from '@/components/admin/page-header';
import {SortableList} from '@/components/admin/sortable-list';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {listPosts} from '@/server/admin/data';

export const metadata: Metadata = {title: 'Posts'};

export default async function PostsPage() {
  const posts = await listPosts();
  return (
    <>
      <PageHeader
        title="Posts"
        description="Newest first by publish date. The home page shows the four newest published posts."
        actions={
          <Button asChild>
            <Link href="/admin/posts/new">New post</Link>
          </Button>
        }
      />
      <SortableList
        collection="posts"
        sortable={false}
        items={posts.map((post) => ({
          id: post.id,
          title: post.title,
          editHref: `/admin/posts/${post.id}`,
          meta: (
            <>
              <Badge variant={post.status === 'PUBLISHED' ? 'default' : 'secondary'}>{post.status === 'PUBLISHED' ? 'Published' : 'Draft'}</Badge>
              <span>{post.publishedAt ? post.publishedAt.slice(0, 10) : 'Not published yet'}</span>
              <span>/{post.slug}</span>
            </>
          ),
        }))}
      />
    </>
  );
}
