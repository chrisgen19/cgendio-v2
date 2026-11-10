import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {connection} from 'next/server';
import {Suspense} from 'react';
import {PostArticle} from '@/components/blog/post-article';
import {CaseStudyBody} from '@/components/case-study/case-study-body';
import {PageShell} from '@/components/site/page-shell';
import {isPreviewType, verifyPreview} from '@/lib/preview-signature';
import {getPreviewContent} from '@/server/preview';

// no-referrer: the site's Referrer-Policy (same-origin) would hand the next page this preview's signed URL as its
// referrer, and gtag reports document.referrer as page_referrer, so a link out of a preview could put the signature in GA
export const metadata: Metadata = {title: 'Draft preview', robots: {index: false, follow: false}, referrer: 'no-referrer'};

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
      <p data-theme="light" className="m-0 bg-lime px-4 py-2 text-center font-mono text-xs text-ink">
        {content.status === 'DRAFT' ? 'Draft preview' : 'Preview'} · link valid for an hour
      </p>
      {/* tracked={false}: a draft preview is an admin view behind the session check, not a public page */}
      <PageShell tracked={false}>
        {content.type === 'post' ? <PostArticle post={content.post} /> : <CaseStudyBody project={content.project} />}
      </PageShell>
    </>
  );
}
