'use client';

import {ChevronDown, Download} from 'lucide-react';
import {type RefObject, useEffect, useRef} from 'react';
import {buttonClasses} from '@/components/ui-site/button';
import {cn} from '@/lib/cn';

export type CvCut = {
  format: 'a4' | 'letter';
  href: string;
  label: string;
};

/** The hint under each cut's label: what the file is and where that paper size is the norm. */
const HINTS: Record<CvCut['format'], string> = {
  a4: 'PDF · most countries',
  letter: 'PDF · US & Canada',
};

/** Page outlines drawn at each paper's real proportions, 36px tall: A4 is 210 × 297 mm, Letter 8.5 × 11 in. */
const PAGE_WIDTHS: Record<CvCut['format'], string> = {
  a4: 'w-[25.5px]',
  letter: 'w-[27.8px]',
};

/** Accent on the row's page outline while the row is hovered or focused. */
const ROW_ACCENT = 'group-hover/row:border-accent group-focus-visible/row:border-accent';
const ROW_ACCENT_BG = 'group-hover/row:bg-accent group-focus-visible/row:bg-accent';
const FADE = 'transition-colors duration-200 motion-reduce:transition-none';

function PageOutline({format}: {format: CvCut['format']}) {
  return (
    <span aria-hidden="true" className="grid size-10 flex-none place-items-center">
      <span
        className={cn(
          'flex h-9 flex-col gap-[3px] rounded-[2.5px] border-[1.5px] border-ink bg-white px-1 py-[5px]',
          FADE,
          ROW_ACCENT,
          PAGE_WIDTHS[format],
        )}
      >
        <span className={cn('block h-[3px] w-3/5 rounded-full bg-ink', FADE, ROW_ACCENT_BG)} />
        <span className="block h-0.5 rounded-full bg-wire" />
        <span className="block h-0.5 rounded-full bg-wire" />
        <span className="block h-0.5 rounded-full bg-wire" />
        <span className="block h-0.5 rounded-full bg-wire" />
      </span>
    </span>
  );
}

/** Closes the open disclosure on Escape (focus back on its summary) and on a press anywhere outside it. */
const useDismiss = (ref: RefObject<HTMLDetailsElement | null>) => {
  useEffect(() => {
    const details = ref.current;
    if (!details) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !details.open) return;
      details.open = false;
      details.querySelector('summary')?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (details.open && event.target instanceof Node && !details.contains(event.target)) details.open = false;
    };
    details.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      details.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [ref]);
};

/**
 * The Contact section's CV button when both cuts are uploaded: one "Download CV" pill that discloses a row per paper
 * size. Built on `<details>`, so both links are in the server markup and work before hydration or without JavaScript;
 * the client only adds Escape and click-outside closing. Each row carries `data-track="cv_download"` and its `format`,
 * so TrackClicks records the pick exactly as it did when the cuts were two buttons.
 */
export function CvDownloadMenu({label, cuts}: {label: string; cuts: readonly CvCut[]}) {
  const ref = useRef<HTMLDetailsElement>(null);
  useDismiss(ref);

  return (
    <details ref={ref} className="group/cv relative">
      <summary
        className={buttonClasses({
          size: 'sm',
          className: 'list-none group-open/cv:bg-accent [&::-webkit-details-marker]:hidden',
        })}
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          size={16}
          strokeWidth={2.4}
          className="transition-transform duration-200 group-open/cv:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <ul className="absolute top-[calc(100%+8px)] left-0 z-30 m-0 w-[300px] max-w-[calc(100vw-40px)] list-none rounded-field border border-line bg-white p-1.5 shadow-(--shadow-menu)">
        {cuts.map((cut) => (
          <li key={cut.format}>
            <a
              href={cut.href}
              data-track="cv_download"
              data-track-placement="contact"
              data-track-format={cut.format}
              onClick={() => ref.current?.removeAttribute('open')}
              className="group/row flex min-h-15 items-center gap-3.5 rounded-[10px] px-3 py-2 text-ink no-underline hover:bg-tint hover:text-ink focus-visible:bg-tint focus-visible:-outline-offset-2"
            >
              <PageOutline format={cut.format} />
              <span className="flex flex-col gap-[3px]">
                <span className="font-body text-sm leading-tight font-semibold">{cut.label}</span>
                <span className="font-mono text-xs leading-snug text-muted">{HINTS[cut.format]}</span>
              </span>
              <Download
                aria-hidden="true"
                size={16}
                className={cn('ml-auto flex-none text-muted group-hover/row:text-accent group-focus-visible/row:text-accent', FADE)}
              />
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
