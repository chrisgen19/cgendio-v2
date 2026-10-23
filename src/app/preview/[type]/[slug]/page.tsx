import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {connection} from 'next/server';
import {Suspense} from 'react';
import {PostArticle} from '@/components/blog/post-article';
import {CaseStudyArticle} from '@/components/case-study/case-study-article';
import {PageShell} from '@/components/site/page-shell';
import {isPreviewType, verifyPreview} from '@/lib/preview-signature';
import {getPreviewContent} from '@/server/preview';

export const metadata: Metadata = {title: 'Draft preview', robots: {index: false, follow: false}};

/** A signed, one-hour preview of a post or case study, drafts included, in the real page templates. */
export default function PreviewPage({params, searchParams}: PageProps<'/preview/[type]/[slug]'>) {
  return (
    <Suspense>
      <Preview params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Preview({params, searchParams}: Pick<PageProps<'/preview/[type]/[slug]'>, 'params' | 'searchParams'>) {
  // Request time only: the link's expiry is checked against the current time
  await connection();
  const [{type, slug}, {expires, signature}] = await Promise.all([params, searchParams]);
  // proxy.ts already answers 404 for bad links; this is the same check again, as the page shouldn't rely on it
  if (!isPreviewType(type)) notFound();
  const decodedSlug = decodeURIComponent(slug);
  if (!verifyPreview(type, decodedSlug, expires, signature)) notFound();

  const content = await getPreviewContent(type, decodedSlug);
  if (!content) notFound();

  return (
    <>
      <p className="m-0 bg-lime px-4 py-2 text-center font-mono text-xs text-ink">
        {content.status === 'DRAFT' ? 'Draft preview' : 'Preview'} · link valid for an hour
      </p>
      <PageShell>{content.type === 'post' ? <PostArticle post={content.post} /> : <CaseStudyArticle project={content.project} />}</PageShell>
    </>
  );
}
