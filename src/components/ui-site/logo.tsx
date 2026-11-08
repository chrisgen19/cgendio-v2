import Link from 'next/link';
import {SITE_NAME} from '@/lib/metadata';

export function Logo() {
  return (
    <Link
      href="/"
      className="relative inline-flex items-center gap-2.5 text-base font-semibold tracking-[-0.01em] text-ink no-underline after:absolute after:-inset-y-1 after:inset-x-0 after:content-[''] hover:text-ink"
    >
      <b className="inline-grid size-9 place-items-center rounded-logo bg-badge font-display text-base leading-none font-extrabold tracking-[-0.04em] text-badge-ink">
        cg
      </b>
      {/* Under 360px the wordmark is the only thing that cannot shrink far enough for the header to fit (WCAG 1.4.10
          Reflow at 320px). `sr-only` drops it out of flow but keeps it in the link's accessible name. */}
      <span className="max-[359px]:sr-only">{SITE_NAME}</span>
    </Link>
  );
}
