'use client';

import {ArrowUpRight} from 'lucide-react';
import {type CSSProperties, useCallback, useEffect, useId, useRef, useState} from 'react';
import {ThemeToggle} from '@/components/site/theme-toggle';
import {cn} from '@/lib/cn';
import {SITE_NAME} from '@/lib/metadata';
import {NAV_ITEMS, resolveHref, SECTION_LABELS} from '../shared/nav-items';
import {ScrollProgress} from '../shared/scroll-progress';
import {useHeaderState} from '../shared/use-header-state';
import {useScrollPaddingTop} from '../shared/use-scroll-padding';
import styles from './dock.module.css';
import {DockSheet} from './dock-sheet';

/** The header's own box. It never changes, so nothing under it moves; only the plate inside it does. */
const HEADER_H = 84;

/**
 * One clock for every property in the condensation. Each piece carries it, so the plate, the wordmark, the status
 * line, the colours and the rim all arrive together and the whole thing reads as a single object docking.
 */
const MOVE = 'duration-[380ms] ease-(--ease-mark) motion-reduce:duration-0';

/**
 * Direction 02 — **the dock**.
 *
 * Over the film the header is barely there: edge to edge across the container, no surface of its own, the wordmark
 * at the left gutter and the CTA at the right one. When the film ends it condenses, in one move, into a detached
 * plate — content width, centred, inverted to ink, standing on the extruded rim the Stack section's plates stand on.
 * It stops being the page's top edge and becomes an object resting above it.
 *
 * The move is one property doing the work: the plate's `flex-grow` runs 1 → 0, so it collapses from the full
 * container to the width of what is inside it, and `justify-between` turns that into the three groups converging.
 * Everything else — the ink surface, the rim, the lift, the inverted colours, the wordmark shedding its name, the
 * status line closing up — transitions on the same duration and the same easing alongside it.
 *
 * Saying where you are: a lime capsule, the only warm thing on the ink, slides under the nav link whose section is
 * crossing the reading line. It is measured inside the nav, whose internal gaps never change, so the condensation
 * cannot drag it. Blog is a route and can never report a position, so it sits past a hairline divider with the
 * arrow that means "this leaves the page", and the capsule never travels there. Reading progress is a lime hairline
 * inside the plate's own bottom edge, so it belongs to the plate rather than crossing the viewport.
 *
 * Dark mode is not a straight token swap here: `bg-ink` would hand a near-black page a near-white plate. The docked
 * plate takes `[data-ink-stage]` instead, globals.css's dark island, so it is the same ink surface in both themes,
 * its focus rings come back as lavender with contrast against it, and `--shadow-deep` brings the 1px ring that
 * separates it from the dark page.
 */
export function DockHeader({overlay = false}: {overlay?: boolean}) {
  const {stuck, active} = useHeaderState(HEADER_H);
  useScrollPaddingTop(HEADER_H);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [capsule, setCapsule] = useState<{left: number; width: number} | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // Opening the sheet docks the plate as well: the sheet is this same ink surface, and a transparent plate would
  // disappear into it. The menu button's tap therefore plays the condensation too, which is the point of the move.
  const docked = stuck || menuOpen;
  const timing = ready ? MOVE : 'duration-0';

  // The reading view resolves `stuck` just after mount; nothing may animate on load, so the clock starts late.
  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 160);
    return () => window.clearTimeout(id);
  }, []);

  // Measured against the nav, not the viewport: the links keep their places inside it while the plate collapses.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const measure = () => {
      const item = active ? nav.querySelector<HTMLElement>('[data-current]') : null;
      setCapsule(item && item.offsetWidth > 0 ? {left: item.offsetLeft, width: item.offsetWidth} : null);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [active]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <header
      data-stuck={stuck || undefined}
      style={{'--header-h': `${HEADER_H}px`, marginBottom: overlay ? 'calc(var(--header-h) * -1)' : undefined} as CSSProperties}
      className="sticky top-0 z-40 h-(--header-h)"
    >
      {/* Above the sheet, which is the header's other positioned child: the plate stays on top of its own menu */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-site items-center justify-center px-14 max-md:px-5">
        <div
          data-docked={docked || undefined}
          className={cn(
            styles.plate,
            timing,
            // The plate's height never changes, so nothing inside it moves vertically: the width does all the work
            'relative flex h-15 min-w-0 items-center justify-between gap-2.5 rounded-card transition-[flex-grow,padding,background-color,color,box-shadow]',
            docked ? 'grow-0 bg-white px-2.5' : 'grow bg-transparent px-0',
          )}
          // The dark island that makes this plate ink in both themes, and its focus rings legible on it
          data-ink-stage={docked ? '' : undefined}
        >
          <a
            href="/"
            className={cn(
              'inline-flex min-h-11 shrink-0 items-center gap-2.5 text-base font-semibold tracking-[-0.01em] text-ink no-underline hover:text-ink',
              timing,
              'transition-colors',
            )}
          >
            <b
              className={cn(
                'inline-grid size-9 shrink-0 place-items-center rounded-logo bg-badge font-display text-base leading-none font-extrabold tracking-[-0.04em] text-badge-ink',
                timing,
                'transition-colors',
              )}
            >
              cg
            </b>
            {/* The name is what the condensation sheds: the mark alone is enough once the plate is this small */}
            <span
              className={cn(
                'overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] max-md:hidden',
                timing,
                docked ? '-ml-2.5 max-w-0 opacity-0' : 'ml-0 max-w-[220px] opacity-100',
              )}
            >
              {SITE_NAME}
            </span>
          </a>

          <nav ref={navRef} aria-label="Main" className="relative shrink-0 max-md:hidden">
            {/* The one warm thing on the ink. It only exists on the plate, so it never sits on the bare film. */}
            <span
              aria-hidden="true"
              style={capsule ? {width: `${capsule.width}px`, transform: `translate3d(${capsule.left}px, -50%, 0)`} : undefined}
              className={cn(
                'pointer-events-none absolute top-1/2 left-0 h-11 rounded-pill bg-lime transition-[transform,width,opacity]',
                timing,
                docked && capsule ? 'opacity-100' : 'opacity-0',
              )}
            />
            <ul className="relative m-0 flex list-none items-center gap-0.5 p-0">
              {NAV_ITEMS.map((item) => {
                const current = item.id !== undefined && item.id === active;
                const route = item.kind === 'route';
                return (
                  <li
                    key={item.href}
                    data-current={current || undefined}
                    // A route cannot report a position, so it is kept out of the set that can
                    className={cn(route && 'ml-1.5 border-l border-line pl-1.5', timing, 'transition-colors')}
                  >
                    <a
                      href={resolveHref(item, overlay)}
                      aria-current={current ? 'true' : undefined}
                      className={cn(
                        'relative inline-flex min-h-11 items-center gap-1.5 rounded-pill px-4 text-sm font-medium no-underline',
                        timing,
                        'transition-colors',
                        docked && current ? 'text-on-lime hover:text-on-lime' : 'text-ink hover:text-accent',
                      )}
                    >
                      {item.label}
                      {route ? <ArrowUpRight aria-hidden="true" size={13} className="shrink-0 opacity-60" /> : null}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2.5">
            {/* Dropped by the condensation: true, but not worth plate width once the plate is an object */}
            <span
              className={cn(
                'inline-flex items-center gap-2 overflow-hidden font-mono text-xs leading-none font-medium whitespace-nowrap text-muted transition-[max-width,opacity,margin] max-lg:hidden',
                timing,
                docked ? '-mr-2.5 max-w-0 opacity-0' : 'mr-0 max-w-[200px] opacity-100',
              )}
            >
              <i aria-hidden="true" className="block size-2 shrink-0 rounded-full bg-status shadow-[0_0_0_4px_rgba(22,163,74,0.15)]" />
              Open to projects
            </span>

            {/* Phones have no room for links, so the plate carries the readout the capsule gives the desktop */}
            <span
              className={cn(
                'inline-flex h-7 shrink-0 items-center justify-center overflow-hidden rounded-pill bg-lime font-mono text-[10px] leading-none font-medium tracking-[0.06em] text-on-lime uppercase transition-[width,opacity,margin] md:hidden',
                timing,
                // A fixed slot, not a label that fits: a width that tracked the section name would resize the plate on every scroll
                docked && active ? 'ml-0 w-24 opacity-100' : '-ml-2.5 w-0 opacity-0',
              )}
            >
              <span className="truncate px-2.5">{active ? SECTION_LABELS[active] : ''}</span>
            </span>

            <ThemeToggle className={cn('shrink-0 max-md:hidden', timing, 'transition-colors')} />

            <a
              href="/contact"
              className={cn(
                'inline-flex min-h-11 shrink-0 items-center justify-center rounded-pill bg-ink px-[18px] text-sm leading-none font-semibold whitespace-nowrap text-white no-underline hover:bg-accent hover:text-white max-md:px-4',
                timing,
                'transition-colors',
              )}
            >
              Let&apos;s talk
            </a>

            <button
              ref={triggerRef}
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((value) => !value)}
              className={cn(
                'inline-grid size-11 shrink-0 cursor-pointer place-items-center rounded-pill border border-line text-ink md:hidden',
                timing,
                'transition-colors',
              )}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 13h16" />}
              </svg>
            </button>
          </div>

          {/*
            Reading progress belongs to the plate: a hairline inside its own bottom edge rather than a bar across the
            viewport. The track runs the plate's width so the fill reads as a measure and not as a stray underline.
          */}
          <div
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-x-4 bottom-[3px] h-0.5 overflow-hidden rounded-pill bg-line transition-opacity',
              timing,
              docked ? 'opacity-100' : 'opacity-0',
            )}
          >
            <ScrollProgress className="size-full rounded-pill bg-lime" />
          </div>
        </div>
      </div>

      <DockSheet id={menuId} open={menuOpen} onClose={closeMenu} triggerRef={triggerRef} active={active} sectionsOnThisPage={overlay} />
    </header>
  );
}
