'use client';

import {Card, CardContent} from '@/components/ui/card';
import {savePost} from '@/server/actions/posts';
import {SubmitButton, SwitchField, TextAreaField, TextField} from './form-fields';
import {MarkdownField} from './markdown-field';
import {TitleSlugFields} from './title-slug-fields';
import {UploadField} from './upload-field';
import {UploadStatusProvider} from './upload-status';
import {useActionToast} from './use-action-toast';
import {useAdminForm} from './use-admin-form';

export type PostFormValues = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tag: string;
  body: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string | null;
  readMinutes: number;
  coverImageUrl: string | null;
};

export function PostForm({post}: {post: PostFormValues | null}) {
  const {result, pending, onSubmit} = useAdminForm(savePost);
  useActionToast(result);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <UploadStatusProvider>
      <form onSubmit={onSubmit} className="flex max-w-5xl flex-col gap-6">
        <input type="hidden" name="id" value={post?.id ?? ''} />
        <Card>
          <CardContent className="flex flex-col gap-4">
            <TitleSlugFields defaultTitle={post?.title} defaultSlug={post?.slug} errors={errors} />
            <TextAreaField
              name="excerpt"
              label="Excerpt"
              hint="One or two sentences for lists and previews"
              defaultValue={post?.excerpt}
              rows={2}
              errors={errors}
              required
            />
            <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
              <TextField name="tag" label="Tag" hint="e.g. MIGRATION" defaultValue={post?.tag} errors={errors} required />
              <TextField
                name="publishedAt"
                label="Publish date"
                type="date"
                hint="Leave empty to use the day you first publish"
                defaultValue={post?.publishedAt?.slice(0, 10) ?? ''}
                errors={errors}
              />
              <UploadField name="coverImageUrl" label="Cover image" kind="image" defaultValue={post?.coverImageUrl} />
            </div>
            <SwitchField
              name="status"
              label="Published"
              hint={post ? `Reading time: ${post.readMinutes} min (worked out from the body when you save)` : 'Drafts never appear on the site'}
              defaultChecked={post?.status === 'PUBLISHED'}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <MarkdownField name="body" label="Body" defaultValue={post?.body} errors={errors} />
          </CardContent>
        </Card>
        <div>
          <SubmitButton pending={pending}>{post ? 'Save post' : 'Create post'}</SubmitButton>
        </div>
      </form>
    </UploadStatusProvider>
  );
}
