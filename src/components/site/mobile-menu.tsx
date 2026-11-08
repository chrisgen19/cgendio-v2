'use client';

import {ArrowRight, ChevronDown} from 'lucide-react';
import {type KeyboardEvent, useEffect, useId, useRef, useState} from 'react';
import {cn} from '@/lib/cn';
import {NAV_ITEMS, resolveHref, SECTION_LABELS} from './nav-links';
import {ThemeMenuItem} from './theme-toggle';

type MobileMenuProps = {
  /** Sections live on this page, so the links are same-page jumps. */
  sectionsOnThisPage: boolean;
  /** The section crossing the reading line, which the trigger reads out and the sheet marks. */
  marked: string | null;
};

/**
 * The phone treatment (under 860px): the rail stays along the header's bottom edge and its readout becomes the button
 * that opens a sheet. The sheet is the same ruler turned on its side — a hairline with a graduation per item, long for
 * the sections that have a place on the page and short for the page that does not.
 *
 * The trigger names the section the reader is in rather than saying "Menu", so the control that opens the navigation
 * is also the thing that tells them where they are. While the sheet is open, focus moves to the first link, Tab cycles
 * between the button and the sheet, and Esc, an outside click or following a link closes it.
 */
export function MobileMenu({sectionsOnThisPage, marked}: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector('a')?.focus();

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const desktop = window.matchMedia('(min-width: 860px)');
    const onChange = () => desktop.matches && setOpen(false);

    document.addEventListener('pointerdown', onPointerDown);
    desktop.addEventListener('change', onChange);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      desktop.removeEventListener('change', onChange);
    };
  }, [open]);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      toggleRef.current?.focus();
      return;
    }
    if (event.key !== 'Tab') return;
    const stops = panelRef.current?.querySelectorAll<HTMLElement>('a[href], button');
    const last = stops?.[stops.length - 1];
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      toggleRef.current?.focus();
    } else if (event.shiftKey && document.activeElement === toggleRef.current) {
      event.preventDefault();
      last?.focus();
    }
  };

  return (
    <nav aria-label="Main" className="ml-auto md:hidden">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: keydown only scopes Tab and Esc to the button and the sheet */}
      <div ref={rootRef} onKeyDown={onKeyDown} className="flex items-center">
        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-pill border border-header-edge bg-header pr-3 pl-3.5 text-ink backdrop-blur-[8px] hover:border-ink"
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span aria-hidden="true" className="font-mono text-[11px] leading-none font-medium tracking-[0.08em] uppercase">
            {marked ? SECTION_LABELS[marked] : 'Menu'}
          </span>
          <ChevronDown
            aria-hidden="true"
            size={14}
            className={cn('shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none', open && 'rotate-180')}
          />
        </button>
        <div
          ref={panelRef}
          id={panelId}
          hidden={!open}
          className="absolute inset-x-0 top-[calc(100%+6px)] z-10 rounded-card border border-line bg-white p-2 shadow-(--shadow-menu)"
        >
          <div className="relative">
            <span aria-hidden="true" className="absolute top-3 bottom-3 left-4 w-px bg-line" />
            <ul className="m-0 flex list-none flex-col p-0">
              {NAV_ITEMS.map((item) => {
                const on = item.id !== undefined && item.id === marked;
                return (
                  <li key={item.href}>
                    <a
                      href={resolveHref(item, sectionsOnThisPage)}
                      aria-current={on ? 'true' : undefined}
                      onClick={() => setOpen(false)}
                      className="relative flex min-h-12 items-center gap-3 rounded-[14px] py-2 pr-4 pl-10 text-[15px] font-medium text-ink no-underline hover:bg-ground hover:text-ink"
                    >
                      <span
                        aria-hidden="true"
                        className={cn('absolute left-4 h-px', item.kind === 'section' ? 'w-[22px] bg-muted' : 'w-2.5 bg-line')}
                      />
                      <span className="relative">
                        {on ? <span aria-hidden="true" className="absolute inset-x-[-0.12em] bottom-[0.06em] h-[0.36em] bg-highlight" /> : null}
                        <span className={cn('relative', on && 'text-highlight-ink')}>{item.label}</span>
                      </span>
                      {item.kind === 'route' ? <ArrowRight aria-hidden="true" size={14} className="ml-auto shrink-0 text-muted" /> : null}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="mt-1.5 border-t border-line pt-1.5">
            <ThemeMenuItem />
          </div>
        </div>
      </div>
    </nav>
  );
}
