'use client';

import {ArrowRight} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {Button} from '@/components/ui-site/button';
import {Container} from '@/components/ui-site/container';
import {Logo} from '@/components/ui-site/logo';
import {cn} from '@/lib/cn';
import {MobileMenu} from './mobile-menu';
import {NAV_ITEMS, type NavItem, resolveHref, SECTION_IDS, SECTION_LABELS} from './nav-links';
import {ScrollProgress} from './scroll-progress';
import {ThemeToggle} from './theme-toggle';
import {useHeaderState} from './use-header-state';

/**
 * The distance from the top at which the rail fills in. The height itself is `--header-h` in globals.css, which
 * everything that pins near the top of the viewport offsets by; keep the two in step.
 */
export const HEADER_HEIGHT = 72;

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
  sectionsOnThisPage: boolean;
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
function Rail({marked, sectionsOnThisPage, surface, compact = false, className}: RailProps) {
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
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-header-edge" />
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
              href={resolveHref(item, sectionsOnThisPage)}
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

type SiteHeaderProps = {
  /**
   * The home page: the header sits transparently over the hero film instead of taking space in the flow, and the
   * sections the rail measures are on this page. Every other page passes nothing.
   */
  overlay?: boolean;
};

/**
 * The header as a measuring rail rather than a bar of links, in the design-tool vocabulary the About canvas already
 * gave the site (hairlines, graduations, a mono readout, the accent as the redline colour).
 *
 * Over the film the header carries almost nothing: the wordmark and a hairline rail with one small, undifferentiated
 * tick per section — the page's structure drawn as a plain measure. Leaving the film is what fills the rail in: it
 * takes a surface, the hairline runs the full width, and the graduations sort themselves into the long ones that are
 * navigation and the short ones that are only structure.
 *
 * The move the design exists for: the lime highlighter, the site's signature under one word of every heading, stops
 * being decoration and becomes the position indicator. It rides the rail's baseline and sits under the graduation the
 * reader is on, including the unlabelled ones — which is why the mono readout beside the rail names the section; it is
 * the value the instrument is reading. On a page with no sections to mark the rail measures distance instead and the
 * same baseline carries reading progress: one object, one job, two kinds of page.
 *
 * Blog is the only item that leaves the page, so it has no position and gets no tick: it sits past the rail's end
 * divider with an arrow. The "Open to projects" chip the old header carried is deliberately gone — a header whose
 * whole argument is precision cannot carry two unrelated readouts, and the setting still drives the About panel and
 * the contact CTA, which is where a visitor looks for it.
 *
 * This departs from `docs/design/design-reference.dc.html`, which still shows the old pill nav; see
 * `docs/design/nav-directions.md`.
 */
export function SiteHeader({overlay = false}: SiteHeaderProps) {
  const {stuck, active} = useHeaderState(HEADER_HEIGHT);
  // Sections only exist on the home page; elsewhere the rail has nothing to point at.
  const marked = overlay && stuck ? active : null;
  const surface = !overlay || stuck;

  return (
    <header
      data-surface={surface || undefined}
      style={overlay ? {marginBottom: 'calc(var(--header-h) * -1)'} : undefined}
      /* pt-(--safe-top): --header-h includes the status bar inset, so the bar's surface covers it while the padding
         keeps the logo and rail centred in the 72px below it (#112) */
      className="sticky top-0 z-40 h-(--header-h) pt-(--safe-top) transition-colors duration-300 data-surface:bg-header data-surface:backdrop-blur-[10px] motion-reduce:transition-none"
    >
      <Container className="h-full">
        <div className="relative flex h-full items-center gap-6 max-md:gap-3">
          <Logo compact />

          {/*
           * The instrument's readout. Not aria-hidden: `aria-current` on a rail link only speaks for the three
           * sections that are in the nav, so for the rest (Stack, About, What I build, Writing, Contact) this is the
           * only place the section in view is named at all. The lime dash beside it is the decorative part.
           */}
          <div className="flex w-[120px] shrink-0 items-center gap-2 max-lg:hidden">
            <span
              aria-hidden="true"
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
              {marked ? (
                <>
                  <span className="sr-only">Current section: </span>
                  {SECTION_LABELS[marked]}
                </>
              ) : null}
            </span>
          </div>

          <nav aria-label="Main" className="flex h-full min-w-0 flex-1 items-center gap-4 max-md:hidden">
            <Rail marked={marked} sectionsOnThisPage={overlay} surface={surface} className="h-full min-w-0 flex-1" />
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
          <MobileMenu sectionsOnThisPage={overlay} marked={marked} />

          <div className="ml-auto flex shrink-0 items-center gap-3 max-md:gap-2.5">
            <ThemeToggle className="max-md:hidden" />
            <Button href="/contact" size="sm" className="whitespace-nowrap">
              Let&apos;s talk
            </Button>
          </div>

          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-4 md:hidden">
            <Rail marked={marked} sectionsOnThisPage={overlay} surface={surface} compact className="h-full" />
          </div>
        </div>
      </Container>
      {/* The rail's edge, run the full width once the header is on a surface: the hairline "filling in" */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-x-0 bottom-0 h-px transition-colors duration-300 motion-reduce:transition-none',
          surface ? 'bg-header-edge' : 'bg-transparent',
        )}
      />
      {/* No sections to mark, so the same baseline measures distance instead */}
      {overlay ? null : <ScrollProgress className="absolute inset-x-0 bottom-0 h-[4px] bg-lime" />}
    </header>
  );
}
