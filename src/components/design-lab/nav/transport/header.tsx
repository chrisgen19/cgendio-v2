'use client';

import {ArrowUpRight, ChevronUp} from 'lucide-react';
import Link from 'next/link';
import {type CSSProperties, type KeyboardEvent, useEffect, useId, useRef, useState} from 'react';
import {ThemeMenuItem, ThemeToggle} from '@/components/site/theme-toggle';
import {Button} from '@/components/ui-site/button';
import {cn} from '@/lib/cn';
import {SITE_NAME} from '@/lib/metadata';
import {NAV_ITEMS, resolveHref, SECTION_IDS, SECTION_LABELS} from '../shared/nav-items';
import {ScrollProgress} from '../shared/scroll-progress';
import {useHeaderState} from '../shared/use-header-state';
import styles from './transport.module.css';

/** The bar's own height, and the distance at which the header counts as past the film. */
const BAR_H = 64;

const pad = (value: number) => String(value).padStart(2, '0');

/** A section id's 1-based place among the nine the scrollspy watches, or null for anything that is not one. */
const stepOf = (id: string | undefined) => {
  const index = SECTION_IDS.indexOf(id as (typeof SECTION_IDS)[number]);
  return index < 0 ? null : index + 1;
};

/**
 * Whole-percent reading position, for the pages that have no sections for the counter to read. Quantised to the
 * integer, so a full page of scrolling costs a hundred renders rather than one per frame.
 */
const useReadPercent = (enabled: boolean) => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const next = scrollable > 0 ? Math.min(100, Math.max(0, Math.round((window.scrollY / scrollable) * 100))) : 0;
      setPercent((current) => (current === next ? current : next));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll, {passive: true});
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [enabled]);

  return percent;
};

/**
 * The phone dock floats over the end of the document, so the document is given that height back — otherwise the dock
 * sits on top of the contact panel, which is the one thing on the page it must never cover. On desktop the bar is at
 * the top instead, so the same effect keeps anchor jumps from landing under it.
 */
const useDockRoom = (height: number) => {
  useEffect(() => {
    const phone = window.matchMedia('(width < 860px)');
    const apply = () => {
      document.body.style.paddingBottom = phone.matches ? `calc(${height}px + env(safe-area-inset-bottom))` : '';
      document.documentElement.style.scrollPaddingTop = phone.matches ? '' : `${height + 16}px`;
    };
    apply();
    phone.addEventListener('change', apply);
    return () => {
      phone.removeEventListener('change', apply);
      document.body.style.paddingBottom = '';
      document.documentElement.style.scrollPaddingTop = '';
    };
  }, [height]);
};

type ReadoutProps = {
  /** The section in view, 1-based, or null on a page with no sections (then the percent is read instead). */
  step: number | null;
  label: string | null;
  percent: number;
  reading: boolean;
};

/**
 * The loudest thing in the bar: a mono counter that reads position the way a timecode reads a frame. The number sits
 * in the ink pill the film's own step labels use, and the strip beside it is the film's chapter segments — one per
 * section on the home page, one per tenth on a page that only has a length.
 */
function Readout({step, label, percent, reading}: ReadoutProps) {
  const marks = reading ? Array.from({length: 10}, (_, index) => `tenth-${index}`) : [...SECTION_IDS];
  const at = reading ? Math.max(1, Math.ceil(percent / 10)) : (step ?? 0);

  return (
    <div className="flex min-w-0 shrink items-center gap-2.5">
      <span className="sr-only">{reading ? 'Read so far:' : 'Section in view:'}</span>
      <span className="inline-grid h-8 min-w-12 shrink-0 place-items-center rounded-pill bg-ink px-2 font-mono text-sm leading-none font-medium tabular-nums text-white">
        {reading ? `${percent}%` : step === null ? '--' : pad(step)}
      </span>
      {label ? <span className="truncate font-mono text-[13px] leading-none font-medium tracking-[0.08em] text-ink uppercase">{label}</span> : null}
      <span aria-hidden="true" className="ml-1.5 flex shrink-0 items-center gap-[3px] max-xl:hidden">
        {marks.map((mark, index) => (
          <span
            key={mark}
            className={cn(
              'h-[3px] rounded-pill transition-[width,background-color] duration-200 motion-reduce:transition-none',
              index + 1 === at ? 'w-3.5 bg-ink' : index + 1 < at ? 'w-2 bg-ink/45' : 'w-2 bg-ink/18',
            )}
          />
        ))}
      </span>
    </div>
  );
}

/** Green, steady, and borrowed from a record light: the one status the bar reports besides position. */
function OpenToProjects({className}: {className?: string}) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-xs font-medium whitespace-nowrap text-muted', className)}>
      <i className="block size-2 shrink-0 rounded-full bg-status shadow-[0_0_0_4px_rgba(22,163,74,0.15)]" />
      Open to projects
    </span>
  );
}

/**
 * The hero film's transport bar, promoted to navigation.
 *
 * Two ideas carry it. First, it reads a position rather than listing links: the mono counter and its chapter strip say
 * which of the nine sections is under the reading line, and the links are quiet, numbered stops that scrub to one —
 * which is also how the two kinds of item tell themselves apart, since a section can carry a number and the route out
 * to the blog cannot (it gets the divider and the arrow instead). Second, it gets out of the way: the bar slides off on
 * the way down and returns on the way up, so a long read keeps its full height, while the reading rule stays pinned to
 * the very top of the viewport whether the bar is there or not. On phones it docks to the bottom edge, inside the thumb
 * arc, and hides downwards.
 *
 * With reduced motion it never hides at all (transport.module.css), and focus moving into a hidden bar brings it back.
 */
export function TransportHeader({overlay = false}: {overlay?: boolean}) {
  const {stuck, active, activeIndex, scrollingDown} = useHeaderState(BAR_H);
  const [menuOpen, setMenuOpen] = useState(false);
  const panelId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const reading = !overlay;
  const percent = useReadPercent(reading);
  useDockRoom(BAR_H);

  // A bar the keyboard is inside must not slide away under the focus ring, and neither must an open menu
  // Keyboard focus is handled in CSS (`.bar[data-hidden]:not(:focus-within)`), so no focus listener is needed here.
  const hidden = stuck && scrollingDown && !menuOpen;
  const step = reading || activeIndex < 0 ? null : activeIndex + 1;

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const desktop = window.matchMedia('(width >= 860px)');
    const onChange = () => desktop.matches && setMenuOpen(false);
    document.addEventListener('pointerdown', onPointerDown);
    desktop.addEventListener('change', onChange);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      desktop.removeEventListener('change', onChange);
    };
  }, [menuOpen]);

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!menuOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setMenuOpen(false);
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

  const link = (kind: 'bar' | 'sheet', item: (typeof NAV_ITEMS)[number]) => {
    const number = stepOf(item.id);
    const current = item.id !== undefined && item.id === active;
    const sheet = kind === 'sheet';
    return (
      <a
        key={item.href}
        href={resolveHref(item, overlay)}
        aria-current={current ? 'true' : undefined}
        onClick={sheet ? () => setMenuOpen(false) : undefined}
        className={cn(
          'relative inline-flex min-h-11 items-center gap-2 rounded-pill font-medium no-underline transition-colors duration-150 motion-reduce:transition-none',
          sheet ? 'w-full px-3.5 text-[15px]' : 'px-3 text-sm max-lg:px-2.5',
          current ? 'bg-ground text-ink hover:text-ink' : 'text-ink hover:bg-ground hover:text-ink',
        )}
      >
        {number === null ? null : (
          <span aria-hidden="true" className={cn('font-mono text-[11px] leading-none tabular-nums', current ? 'text-accent' : 'text-muted')}>
            {pad(number)}
          </span>
        )}
        {item.label}
        {item.kind === 'route' ? <ArrowUpRight aria-hidden="true" size={14} className="shrink-0 text-muted" /> : null}
      </a>
    );
  };

  return (
    <header
      style={{marginBottom: overlay ? 'calc(var(--header-h) * -1)' : undefined} as CSSProperties}
      className={cn(styles.root, 'sticky top-0 z-40')}
    >
      {/*
       * The reading rule is pinned to the viewport and lives outside the bar, so it survives the bar sliding away and
       * the reader never loses their place indicator. Track and fill are the film's own progress bar.
       */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-10 h-[3px] bg-line">
        <ScrollProgress className="h-full bg-accent" />
      </div>

      <div data-stuck={stuck || undefined} data-hidden={hidden || undefined} className={styles.bar}>
        <div className="mx-auto flex h-16 w-full max-w-site items-center gap-4 px-14 max-lg:gap-3 max-lg:px-6 max-md:px-5">
          {/* Mark only, no wordmark: a transport bar reads a value first, and the counter should be the first text in it */}
          <Link
            href="/"
            className="relative inline-grid size-9 shrink-0 place-items-center rounded-logo bg-badge font-display text-base leading-none font-extrabold tracking-[-0.04em] text-badge-ink no-underline hover:text-badge-ink max-md:hidden"
          >
            cg
            <span className="sr-only">{SITE_NAME}, home</span>
          </Link>

          <span aria-hidden="true" className="h-6 w-px shrink-0 bg-line max-md:hidden" />

          <Readout step={step} label={active ? (SECTION_LABELS[active] ?? null) : null} percent={percent} reading={reading} />

          <nav aria-label="Main" className="ml-auto flex items-center gap-0.5 max-md:hidden">
            {NAV_ITEMS.map((item, index) => (
              <span key={item.href} className="contents">
                {/* The route out of the page gets its own side of the divider: it is the one item that cannot report a position */}
                {item.kind === 'route' && index > 0 ? <span aria-hidden="true" className="mx-2 h-5 w-px bg-line" /> : null}
                {link('bar', item)}
              </span>
            ))}
          </nav>

          <OpenToProjects className="max-lg:hidden" />
          <ThemeToggle className="max-md:hidden" />

          {/* biome-ignore lint/a11y/noStaticElementInteractions: the keydown only scopes Tab and Esc to the button and its panel */}
          <div ref={menuRef} onKeyDown={onMenuKeyDown} className="ml-auto md:hidden">
            <button
              ref={toggleRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls={panelId}
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-pill border border-line bg-white px-3.5 text-sm font-medium text-ink hover:border-ink"
            >
              Menu
              <ChevronUp
                aria-hidden="true"
                size={16}
                className={cn('transition-transform duration-200 motion-reduce:transition-none', menuOpen && 'rotate-180')}
              />
            </button>
            <div
              ref={panelRef}
              id={panelId}
              hidden={!menuOpen}
              className="absolute right-5 bottom-[calc(100%-4px)] flex w-[min(74vw,268px)] flex-col rounded-card border border-line bg-white p-2.5 shadow-(--shadow-menu)"
            >
              {NAV_ITEMS.map((item) => link('sheet', item))}
              <div className="mt-1.5 flex flex-col gap-2 border-t border-line pt-1.5">
                <ThemeMenuItem />
                <OpenToProjects className="px-3.5 pb-1" />
              </div>
            </div>
          </div>

          <Button href="/contact" size="sm" className="shrink-0 whitespace-nowrap">
            Let&apos;s talk
          </Button>
        </div>
      </div>
    </header>
  );
}
