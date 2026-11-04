'use client';

import {useCopyEmail} from '@/components/sections/contact/use-copy-email';
import {cn} from '@/lib/cn';

const noop = () => {};

/**
 * Copies the address. The accessible name stays "Copy email address"; the visible state swaps its icon and a short tag
 * for about 2 seconds, and the result is announced through a polite live region that starts empty.
 */
export function CopyEmailButton({address}: {address: string}) {
  const {status, message, copy} = useCopyEmail(address, noop);

  return (
    <span className="inline-flex items-center gap-3">
      <button
        type="button"
        aria-label="Copy email address"
        onClick={copy}
        className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-pill border border-white/30 bg-transparent px-4 text-sm font-semibold text-white transition-colors duration-150 hover:border-white hover:bg-white hover:text-ink focus-visible:outline-white motion-reduce:transition-none"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          {status === 'copied' ? (
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          ) : (
            <>
              <rect x="8" y="8" width="12" height="12" rx="2.5" />
              <path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" />
            </>
          )}
        </svg>
        <span aria-hidden="true">{status === 'copied' ? 'Copied' : 'Copy'}</span>
      </button>
      {status === 'failed' ? (
        <span aria-hidden="true" className={cn('max-w-[180px] text-xs leading-snug text-white/80')}>
          Copy failed. Select the address instead.
        </span>
      ) : null}
      <output className="sr-only">{message}</output>
    </span>
  );
}
