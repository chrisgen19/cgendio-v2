import Link from 'next/link';
import {renderMarkdown} from '@/components/prose/markdown';
import {Section} from '@/components/ui-site/section';
import {blogHref} from '@/lib/blog-url';
import {formatMonthYear} from '@/lib/format-date';
import {tagSlug} from '@/lib/tag-slug';
import {getPageCopy, type PostDetail} from '@/server/content';
import {TableOfContents} from './table-of-contents';

/** A post: header (back link, meta line, title, excerpt, cover) and the Markdown body with its table of contents. */
export async function PostArticle({post}: {post: PostDetail}) {
  const [{content, toc}, copy] = await Promise.all([renderMarkdown(post.body), getPageCopy()]);
  const hasToc = toc.length >= 3;
  return (
    <article>
      <Section padding="cta" innerClassName="flex flex-col gap-6 pt-6 max-md:pt-0">
        <Link
          href="/blog"
          className="inline-flex min-h-11 items-center gap-2 self-start text-[15px] font-semibold text-ink no-underline hover:text-accent"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          {copy['blog.allLabel']}
        </Link>
        <p className="m-0 flex flex-wrap items-center gap-x-2 font-mono text-[13px] text-muted">
          <Link href={blogHref({tag: tagSlug(post.tag)})} className="inline-flex min-h-11 items-center tracking-[0.06em] text-accent no-underline">
            {post.tag}
          </Link>
          <span aria-hidden="true">·</span>
          <time dateTime={post.date}>{formatMonthYear(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readMinutes} min read</span>
        </p>
        <h1 className="m-0 max-w-[20ch] font-display text-[clamp(40px,5vw,64px)] leading-[1.02] font-bold tracking-[-0.04em]">{post.title}</h1>
        <p className="m-0 max-w-[640px] text-lg leading-[1.55] text-muted max-md:text-base">{post.excerpt}</p>
        {post.coverImageUrl ? (
          // biome-ignore lint/performance/noImgElement: covers come from R2; next/image (remotePatterns for the bucket) arrives in Phase 7
          <img
            src={post.coverImageUrl}
            alt=""
            width={1600}
            height={900}
            className="mt-4 aspect-[16/9] h-auto w-full rounded-panel border border-line object-cover"
          />
        ) : null}
      </Section>
      <Section tone="white">
        <div className={hasToc ? 'grid grid-cols-[minmax(0,68ch)_240px] justify-between gap-16 max-lg:grid-cols-1 max-lg:gap-10' : undefined}>
          {hasToc ? (
            <div className="lg:sticky lg:top-8 lg:order-2 lg:self-start">
              <TableOfContents items={toc} />
            </div>
          ) : null}
          <div className="lg:order-1">{content}</div>
        </div>
      </Section>
    </article>
  );
}
