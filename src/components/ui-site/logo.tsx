import Link from 'next/link';
import {cn} from '@/lib/cn';
import {SITE_NAME} from '@/lib/metadata';

type LogoProps = {
  /**
   * Header treatment: under 1080px the name is kept for assistive technology but taken off the screen, so the rail
   * gets the width. `sr-only`, never `hidden` — hidden text drops out of the accessible name and would leave the
   * link called "cg".
   */
  compact?: boolean;
};

export function Logo({compact = false}: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "relative inline-flex items-center gap-2.5 text-base font-semibold tracking-[-0.01em] text-ink no-underline after:absolute after:content-[''] hover:text-ink",
        compact ? 'h-11 shrink-0 after:-inset-x-1 after:inset-y-0' : 'after:-inset-y-1 after:inset-x-0',
      )}
    >
      <b className="inline-grid size-9 place-items-center rounded-logo bg-badge font-display text-base leading-none font-extrabold tracking-[-0.04em] text-badge-ink">
        cg
      </b>
      <span className={compact ? 'max-lg:sr-only' : undefined}>{SITE_NAME}</span>
    </Link>
  );
}
