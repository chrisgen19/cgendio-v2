import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {Suspense} from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {getPreviewContent, type PreviewType, verifyPreview} from '@/server/preview';

export const metadata: Metadata = {title: 'Draft preview', robots: {index: false, follow: false}};

/**
 * A signed, one-hour preview of a post or case study, drafts included. A plain reading layout for now: Phase 6
 * swaps in the real post and case study templates.
 */
export default function PreviewPage({params, searchParams}: PageProps<'/preview/[type]/[slug]'>) {
  return (
    <Suspense>
      <Preview params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Preview({params, searchParams}: Pick<PageProps<'/preview/[type]/[slug]'>, 'params' | 'searchParams'>) {
  const [{type, slug}, {expires, signature}] = await Promise.all([params, searchParams]);
  if (type !== 'post' && type !== 'project') notFound();
  const previewType: PreviewType = type;
  const decodedSlug = decodeURIComponent(slug);
  if (!verifyPreview(previewType, decodedSlug, expires, signature)) notFound();

  const content = await getPreviewContent(previewType, decodedSlug);
  if (!content) notFound();

  return (
    <div className="admin-theme min-h-svh">
      <p className="bg-lime px-4 py-2 text-center font-mono text-xs text-ink">
        {content.status === 'DRAFT' ? 'Draft preview' : 'Preview'} · link valid for an hour · final design arrives with the post pages
      </p>
      <article className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-14">
        <p className="m-0 font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
          {content.kind} · {content.label}
        </p>
        <h1 className="m-0 font-display text-[clamp(36px,5vw,56px)] leading-[1.02] font-bold tracking-[-0.03em]">{content.title}</h1>
        <p className="m-0 text-lg leading-relaxed text-muted-foreground">{content.intro}</p>
        {content.cover ? (
          // biome-ignore lint/performance/noImgElement: draft preview of an R2 upload; Phase 6's templates use next/image
          <img src={content.cover} alt="" className="w-full rounded-2xl border" />
        ) : null}
        {content.markdown.trim() ? (
          <div className="prose-admin">
            <Markdown remarkPlugins={[remarkGfm]}>{content.markdown}</Markdown>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No body yet.</p>
        )}
      </article>
    </div>
  );
}
