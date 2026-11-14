'use client';

import {ChevronDown, Download} from 'lucide-react';
import {DropdownMenu} from 'radix-ui';
import {Button} from '@/components/ui-site/button';
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

function PageOutline({format}: {format: CvCut['format']}) {
  return (
    <span aria-hidden="true" className="grid size-10 flex-none place-items-center">
      <span
        className={cn(
          'flex h-9 flex-col gap-[3px] rounded-[2.5px] border-[1.5px] border-ink bg-white px-1 py-[5px] transition-colors duration-200 group-data-highlighted:border-accent motion-reduce:transition-none',
          PAGE_WIDTHS[format],
        )}
      >
        <span className="block h-[3px] w-3/5 rounded-full bg-ink transition-colors duration-200 group-data-highlighted:bg-accent motion-reduce:transition-none" />
        <span className="block h-0.5 rounded-full bg-wire" />
        <span className="block h-0.5 rounded-full bg-wire" />
        <span className="block h-0.5 rounded-full bg-wire" />
        <span className="block h-0.5 rounded-full bg-wire" />
      </span>
    </span>
  );
}

/**
 * The Contact section's CV button when both cuts are uploaded: one "Download CV" pill that opens a menu with a row per
 * paper size. Each row is a real link carrying `data-track="cv_download"` and its `format`, so TrackClicks records the
 * pick exactly as it did when the cuts were two buttons. Not portalled, so the menu stays inside `main`.
 */
export function CvDownloadMenu({label, cuts}: {label: string; cuts: readonly CvCut[]}) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <Button size="sm" className="group data-[state=open]:bg-accent">
          {label}
          <ChevronDown
            aria-hidden="true"
            size={16}
            strokeWidth={2.4}
            className="transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
          />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        align="start"
        sideOffset={8}
        collisionPadding={20}
        className="z-30 w-[300px] max-w-[calc(100vw-40px)] rounded-field border border-line bg-white p-1.5 shadow-(--shadow-menu)"
      >
        {cuts.map((cut) => (
          <DropdownMenu.Item key={cut.format} asChild>
            <a
              href={cut.href}
              data-track="cv_download"
              data-track-placement="contact"
              data-track-format={cut.format}
              className="group flex min-h-15 items-center gap-3.5 rounded-[10px] px-3 py-2 text-ink no-underline hover:text-ink focus-visible:-outline-offset-2 data-highlighted:bg-tint"
            >
              <PageOutline format={cut.format} />
              <span className="flex flex-col gap-[3px]">
                <span className="font-body text-sm leading-tight font-semibold">{cut.label}</span>
                <span className="font-mono text-xs leading-snug text-muted">{HINTS[cut.format]}</span>
              </span>
              <Download
                aria-hidden="true"
                size={16}
                className="ml-auto flex-none text-muted transition-colors duration-200 group-data-highlighted:text-accent motion-reduce:transition-none"
              />
            </a>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
