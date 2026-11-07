import Link from 'next/link';
import {blogHref} from '@/lib/blog-url';
import {cn} from '@/lib/cn';
import type {PostTag} from '@/server/content';

/* Mono uppercase, the register PostRow already gives a tag, so the stored labels ("MIGRATION") read as deliberate next to "All" */
const PILL =
  'inline-flex min-h-11 items-center rounded-pill border px-[18px] font-mono text-[13px] leading-none font-medium tracking-[0.06em] uppercase no-underline';
const ACTIVE = 'border-ink bg-ink text-white hover:text-white';
const IDLE = 'border-line bg-white text-ink hover:border-ink hover:text-ink';

/** Tag pills for /writing, styled like the Work filter. They're plain links, so filtering works without JavaScript. */
export function TagFilter({tags, active}: {tags: PostTag[]; active: string | null}) {
  return (
    <nav aria-label="Filter posts by tag" className="flex flex-wrap gap-2">
      <Link href={blogHref({})} aria-current={active === null ? 'page' : undefined} className={cn(PILL, active === null ? ACTIVE : IDLE)}>
        All
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag.slug}
          href={blogHref({tag: tag.slug})}
          aria-current={active === tag.slug ? 'page' : undefined}
          className={cn(PILL, active === tag.slug ? ACTIVE : IDLE)}
        >
          {tag.label}
        </Link>
      ))}
    </nav>
  );
}
