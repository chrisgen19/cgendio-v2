import type {Metadata} from 'next';
import Link from 'next/link';
import {Suspense} from 'react';
import {Pagination} from '@/components/blog/pagination';
import {PostRow} from '@/components/blog/post-row';
import {TagFilter} from '@/components/blog/tag-filter';
import {PageShell} from '@/components/site/page-shell';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {MarkedText} from '@/components/ui-site/marked-text';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';
import {BLOG_PAGE_SIZE, getBlogIndex, getPageCopy, getPostTags} from '@/server/content';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Field notes on migrations, Next.js, WordPress and AI-assisted development.',
};

/**
 * The blog index. The header is static; the list reads ?tag= and ?page= inside Suspense, so only that part waits for
 * the request, and its data comes from a cached getter keyed by a known tag and an in-range page.
 */
export default async function BlogPage({searchParams}: PageProps<'/blog'>) {
  const copy = await getPageCopy();
  return (
    <PageShell>
      <Section padding="cta" innerClassName="flex flex-col gap-[18px] pt-10 max-md:pt-4">
        <Eyebrow>{copy['blog.eyebrow']}</Eyebrow>
        <SectionHeading level={1}>
          <MarkedText text={copy['blog.heading']} />
        </SectionHeading>
        <p className="m-0 max-w-[560px] text-lg leading-[1.55] text-muted max-md:text-base">{copy['blog.lede']}</p>
      </Section>
      <Section tone="white">
        <Suspense fallback={<BlogListFallback />}>
          <BlogList searchParams={searchParams} />
        </Suspense>
      </Section>
    </PageShell>
  );
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

async function BlogList({searchParams}: Pick<PageProps<'/blog'>, 'searchParams'>) {
  const params = await searchParams;
  const tags = await getPostTags();
  const tagParam = first(params.tag) ?? null;
  const tag = tagParam ? (tags.find((t) => t.slug === tagParam) ?? null) : null;
  const total = tag ? tag.count : tags.reduce((sum, t) => sum + t.count, 0);
  const pageCount = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));
  const pageParam = first(params.page);
  const page = pageParam === undefined ? 1 : Number(pageParam);

  // An unknown tag or a page outside the range: say so instead of guessing what was meant
  const valid = (tagParam === null || tag !== null) && Number.isInteger(page) && page >= 1 && page <= pageCount && total > 0;
  if (!valid) {
    return (
      <div className="flex flex-col gap-8">
        <TagFilter tags={tags} active={tag?.slug ?? null} />
        <div className="flex flex-col items-start gap-3 border-t border-line pt-10">
          <p className="m-0 font-display text-[26px] leading-[1.15] font-[650] tracking-[-0.025em]">No posts here yet.</p>
          <Link href="/blog" className="inline-flex min-h-11 items-center text-[15px] font-semibold">
            See all posts
          </Link>
        </div>
      </div>
    );
  }

  const index = await getBlogIndex({tag: tag?.slug ?? null, page});
  return (
    <div className="flex flex-col gap-8">
      <TagFilter tags={tags} active={tag?.slug ?? null} />
      <div>
        <ul className="m-0 flex list-none flex-col border-b border-line p-0">
          {index.posts.map((post) => (
            <PostRow key={post.slug} post={post} />
          ))}
        </ul>
        <Pagination page={index.page} pageCount={index.pageCount} tag={tag?.slug ?? null} />
      </div>
    </div>
  );
}

/** Placeholder rows while the list streams in: the same height as real rows, so nothing jumps. */
function BlogListFallback() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-8">
      <div className="h-11 w-72 max-w-full rounded-pill bg-ground" />
      <div className="border-b border-line">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex flex-col gap-2.5 border-t border-line py-7">
            <div className="h-3 w-24 rounded bg-ground" />
            <div className="h-7 w-2/3 rounded bg-ground" />
          </div>
        ))}
      </div>
    </div>
  );
}
