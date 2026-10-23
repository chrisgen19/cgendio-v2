import Link from 'next/link';
import {formatMonthYear} from '@/lib/format-date';
import type {Post} from '@/server/content';

/** A blog row from the canvas (date · tag + title · read time · arrow), used on the home page and /blog. */
export function PostRow({post}: {post: Post}) {
  return (
    <li data-reveal>
      <Link
        href={`/blog/${post.slug}`}
        className="group grid grid-cols-[120px_minmax(0,1fr)_90px_44px] items-center gap-6 border-t border-line py-7 text-ink no-underline hover:text-ink max-md:grid-cols-[minmax(0,1fr)_44px] max-md:gap-3"
      >
        <span className="font-mono text-[13px] text-muted max-md:hidden">{formatMonthYear(post.date)}</span>
        <span className="flex flex-col gap-2.5">
          <span className="font-mono text-[11px] tracking-[0.06em] text-accent">{post.tag}</span>
          <span className="font-display text-[26px] leading-[1.15] font-[650] tracking-[-0.025em] transition-colors duration-200 group-hover:text-accent">
            {post.title}
          </span>
        </span>
        <span className="font-mono text-[13px] text-muted max-md:hidden">{post.readMinutes} min</span>
        <span className="inline-grid size-11 place-items-center rounded-full border border-line transition-all duration-200 group-hover:border-ink group-hover:bg-ink group-hover:text-white">
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
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </span>
      </Link>
    </li>
  );
}
