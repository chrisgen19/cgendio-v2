import Link from 'next/link';
import {Section} from '@/components/ui-site/section';
import {cn} from '@/lib/cn';
import type {ContentLink} from '@/server/content';

type PostNavProps = {
  /** The older post */
  previous: ContentLink | null;
  /** The newer post */
  next: ContentLink | null;
};

const CARD =
  'flex min-h-11 flex-col gap-2 rounded-card border border-line bg-white p-6 text-ink no-underline shadow-card transition-colors duration-200 hover:border-ink hover:text-ink';

/** Previous and next article links under a post. */
export function PostNav({previous, next}: PostNavProps) {
  if (!previous && !next) return null;
  return (
    <Section padding="cta" className="pt-14">
      <nav aria-label="Previous and next articles" className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        {previous ? (
          <Link href={`/blog/${previous.slug}`} className={CARD}>
            <span className="font-mono text-xs tracking-[0.06em] text-muted uppercase">Previous article</span>
            <span className="font-display text-[22px] leading-[1.2] font-[650] tracking-[-0.02em]">{previous.title}</span>
          </Link>
        ) : null}
        {next ? (
          <Link href={`/blog/${next.slug}`} className={cn(CARD, 'col-start-2 text-right max-md:col-start-1 max-md:text-left')}>
            <span className="font-mono text-xs tracking-[0.06em] text-muted uppercase">Next article</span>
            <span className="font-display text-[22px] leading-[1.2] font-[650] tracking-[-0.02em]">{next.title}</span>
          </Link>
        ) : null}
      </nav>
    </Section>
  );
}
