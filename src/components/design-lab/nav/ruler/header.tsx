'use client';

import {ArrowRight, ChevronDown} from 'lucide-react';
import Link from 'next/link';
import {type CSSProperties, type KeyboardEvent, useEffect, useId, useRef, useState} from 'react';
import {ThemeMenuItem, ThemeToggle} from '@/components/site/theme-toggle';
import {Button} from '@/components/ui-site/button';
import {Container} from '@/components/ui-site/container';
import {cn} from '@/lib/cn';
import {SITE_NAME} from '@/lib/metadata';
import {NAV_ITEMS, type NavItem, resolveHref, SECTION_IDS, SECTION_LABELS} from '../shared/nav-items';
import {ScrollProgress} from '../shared/scroll-progress';
import {useHeaderState} from '../shared/use-header-state';
import {useScrollPaddingTop} from '../shared/use-scroll-padding';

const HEADER_H = 72;

/** Every home section in page order, each paired with its nav item when it has one. The rail's graduations. */
const GRADUATIONS = SECTION_IDS.map((id) => ({id, item: NAV_ITEMS.find((candidate) => candidate.id === id)}));

/** The one nav item that leaves the page, so it never gets a tick. */
const ROUTE_ITEM = NAV_ITEMS.find((item) => item.kind === 'route') as NavItem;

// The rail's links and Blog. Accent on hover is the About canvas's redline colour: the tool pointing at a thing.
const LABEL =
  'rounded-[12px] text-sm leading-none font-medium text-ink no-underline transition-colors hover:text-accent focus-visible:-outline-offset-2 motion-reduce:transition-none';

type RailProps = {
  /** The section crossing the reading line, once there is one to mark. */
  marked: string | null;
  /** Sections live on this page, so the links are same-page jumps. */
  overlay: boolean;
  /** The header sits on a surface, so the graduations sort into navigation and structure instead of a plain measure. */
  surface: boolean;
  /** Ticks only, no labels — the phone rail, which hands its labels to the sheet. */
  compact?: boolean;
  className?: string;
};

/**
 * The measuring rail: one tick per home section in page order, long where the section is in the nav and short where it
 * is not, with the lime highlighter riding the baseline under whichever tick the reader is on.
 *
 * The indicator is placed from the measured box of the active graduation rather than from a fraction, because the
 * labelled graduations are as wide as their words. Only `transform` and `width` change, so nothing reflows, and a
 * ResizeObserver on the track re-measures when the header is resized.
 */
function Rail({marked, overlay, surface, compact = false, className}: RailProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const marks = useRef(new Map<string, HTMLElement>());
  const [bar, setBar] = useState({x: 0, w: 0});

  useEffect(() => {
    const track = trackRef.current;
    const mark = marked ? marks.current.get(marked) : null;
    // No mark: leave the bar where it was and let the opacity take it out, so the next one slides from here
    if (!track || !mark) return;
    const place = () => setBar({x: mark.offsetLeft, w: mark.offsetWidth});
    place();
    const observer = new ResizeObserver(place);
    observer.observe(track);
    return () => observer.disconnect();
  }, [marked]);

  const hold = (id: string) => (element: HTMLElement | null) => {
    if (element) marks.current.set(id, element);
    else marks.current.delete(id);
  };

  return (
    <div ref={trackRef} className={cn('relative', className)}>
      {/* The measuring edge. Drawn at full strength over the film too: it is the one thing the header shows there. */}
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-line" />
      <div className="flex h-full items-stretch justify-between">
        {GRADUATIONS.map(({id, item}) => {
          const on = marked === id;
          // Over the film every graduation is the same small mark — a plain measure. Leaving it is what sorts them
          // into the ones that are navigation and the ones that are only structure.
          const tick = cn(
            'absolute bottom-0 left-1/2 w-px -translate-x-1/2 transition-[height,background-color] duration-300 motion-reduce:transition-none',
            !surface && 'h-1.5 bg-muted/45',
            surface && (item ? (compact ? 'h-2.5 bg-muted' : 'h-4 bg-muted') : 'h-2 bg-muted/45'),
            surface && on && (compact ? 'h-3 bg-ink' : 'h-5 bg-ink'),
          );
          if (!item || compact) {
            return (
              <span key={id} ref={hold(id)} aria-hidden="true" className={cn('relative shrink-0', compact ? 'w-3' : 'w-4')}>
                <span className={tick} />
              </span>
            );
          }
          return (
            <a
              key={id}
              ref={hold(id)}
              href={resolveHref(item, overlay)}
              aria-current={on ? 'true' : undefined}
              className={cn('group relative flex h-full shrink-0 items-center justify-center px-2.5', LABEL)}
            >
              {item.label}
              <span aria-hidden="true" className={cn(tick, 'group-hover:h-5 group-hover:bg-accent')} />
            </a>
          );
        })}
      </div>
      {/* The site's highlighter, promoted from decoration to the position indicator */}
      <span
        aria-hidden="true"
        style={{width: bar.w, transform: `translateX(${bar.x}px)`}}
        className={cn(
          'pointer-events-none absolute bottom-0 left-0 h-[4px] bg-lime transition-[transform,width,opacity] duration-[420ms] ease-mark motion-reduce:transition-none',
          marked ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  );
}

type RailMenuProps = {
  overlay: boolean;
  marked: string | null;
};

/**
 * The phone treatment: the rail stays along the header's bottom edge and its readout becomes the button that opens a
 * sheet. The sheet is the same ruler turned on its side — a hairline with a graduation per item, long for the sections
 * that have a place on the page and short for the page that does not.
 */
function RailMenu({overlay, marked}: RailMenuProps) {
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
          className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-pill border border-line bg-white/85 pr-3 pl-3.5 text-ink backdrop-blur-[8px] hover:border-ink"
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
                      href={resolveHref(item, overlay)}
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

/**
 * "The ruler" — the header as a measuring rail rather than a bar of links, in the design-tool vocabulary the About
 * canvas already gave the site (hairlines, graduations, a mono readout, the accent as the redline colour).
 *
 * Over the film the header carries almost nothing: the wordmark and a hairline rail with one small, undifferentiated
 * tick per section — the page's structure drawn as a plain measure. Leaving the film is what fills the rail in: it
 * takes a surface, the hairline runs the full width, and the graduations sort themselves into the long ones that are
 * navigation and the short ones that are only structure.
 *
 * The move the direction exists for: the lime highlighter, the site's signature under one word of every heading, stops
 * being decoration and becomes the position indicator. It rides the rail's baseline and sits under the graduation the
 * reader is on, including the unlabelled ones — which is why the mono readout beside the rail names the section; it is
 * the value the instrument is reading. On a page with no sections to mark (`overlay` false) the rail measures distance
 * instead and the same baseline carries reading progress: one object, one job, two kinds of page.
 *
 * Blog is the only item that leaves the page, so it has no position and gets no tick: it sits past the rail's end
 * divider with an arrow. The "Open to projects" chip is deliberately dropped here — a header whose whole argument is
 * precision cannot carry two unrelated readouts, and availability is already stated in About and in the contact CTA.
 */
export function RulerHeader({overlay = false}: {overlay?: boolean}) {
  const {stuck, active} = useHeaderState(HEADER_H);
  useScrollPaddingTop(HEADER_H);
  // Sections only exist under the home preview; elsewhere the rail has nothing to point at.
  const marked = overlay && stuck ? active : null;
  const surface = !overlay || stuck;

  return (
    <header
      data-surface={surface || undefined}
      style={{'--header-h': `${HEADER_H}px`, marginBottom: overlay ? 'calc(var(--header-h) * -1)' : undefined} as CSSProperties}
      className="sticky top-0 z-40 h-(--header-h) transition-colors duration-300 data-surface:bg-white/88 data-surface:backdrop-blur-[10px] motion-reduce:transition-none"
    >
      <Container className="h-full">
        <div className="relative flex h-full items-center gap-6 max-md:gap-3">
          <Link
            href="/"
            className="relative inline-flex h-11 shrink-0 items-center gap-2.5 text-base font-semibold tracking-[-0.01em] text-ink no-underline after:absolute after:-inset-x-1 after:inset-y-0 after:content-[''] hover:text-ink"
          >
            <b className="inline-grid size-9 place-items-center rounded-logo bg-badge font-display text-base leading-none font-extrabold tracking-[-0.04em] text-badge-ink">
              cg
            </b>
            <span className="max-lg:hidden">{SITE_NAME}</span>
          </Link>

          {/* The instrument's readout. Decorative: aria-current on the active link is what carries this to a reader. */}
          <div aria-hidden="true" className="flex w-[120px] shrink-0 items-center gap-2 max-lg:hidden">
            <span
              className={cn(
                'h-[4px] w-3.5 shrink-0 bg-lime transition-opacity duration-300 motion-reduce:transition-none',
                marked ? 'opacity-100' : 'opacity-0',
              )}
            />
            <span
              className={cn(
                'truncate font-mono text-[11px] leading-none font-medium tracking-[0.08em] text-muted uppercase transition-opacity duration-300 motion-reduce:transition-none',
                marked ? 'opacity-100' : 'opacity-0',
              )}
            >
              {active ? SECTION_LABELS[active] : ''}
            </span>
          </div>

          <nav aria-label="Main" className="flex h-full min-w-0 flex-1 items-center gap-4 max-md:hidden">
            <Rail marked={marked} overlay={overlay} surface={surface} className="h-full min-w-0 flex-1" />
            <span aria-hidden="true" className="h-5 w-px shrink-0 bg-line" />
            <a href={resolveHref(ROUTE_ITEM, overlay)} className={cn('group inline-flex h-full shrink-0 items-center gap-1.5 px-1', LABEL)}>
              {ROUTE_ITEM.label}
              <ArrowRight
                aria-hidden="true"
                size={13}
                className="text-muted transition-colors group-hover:text-accent motion-reduce:transition-none"
              />
            </a>
          </nav>

          {/* Phones: the rail keeps the bottom edge and its readout becomes the sheet trigger */}
          <RailMenu overlay={overlay} marked={marked} />

          <div className="ml-auto flex shrink-0 items-center gap-3 max-md:gap-2.5">
            <ThemeToggle className="max-md:hidden" />
            <Button href="/contact" size="sm" className="whitespace-nowrap">
              Let&apos;s talk
            </Button>
          </div>

          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-4 md:hidden">
            <Rail marked={marked} overlay={overlay} surface={surface} compact className="h-full" />
          </div>
        </div>
      </Container>
      {/* The rail's edge, run the full width once the header is on a surface: the hairline "filling in" */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-x-0 bottom-0 h-px transition-colors duration-300 motion-reduce:transition-none',
          surface ? 'bg-line' : 'bg-transparent',
        )}
      />
      {/* No sections to mark, so the same baseline measures distance instead */}
      {overlay ? null : <ScrollProgress className="absolute inset-x-0 bottom-0 h-[4px] bg-lime" />}
    </header>
  );
}
