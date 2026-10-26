'use client';

import {type CSSProperties, useEffect, useId, useRef, useState} from 'react';
import {Button} from '@/components/ui-site/button';
import {cn} from '@/lib/cn';
import type {TimelineDot, TimelineEntry} from '@/server/content';

const DOTS: Record<TimelineDot, string> = {
  lime: 'bg-lime',
  accent: 'bg-accent',
  ink: 'bg-ink',
  placeholder: 'bg-dot-placeholder',
};

type Phase = 'idle' | 'armed' | 'ruled';

/**
 * Plays the ledger's one entrance (the rules draw left to right, then each row settles in) the first time it scrolls
 * into view. `idle` is the server and no-JS state and shows everything; the hidden start only applies once `armed`,
 * and only when motion is allowed (the CSS checks). A ledger already on screen at mount skips straight to `ruled`.
 */
function useRuledOnView() {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('idle');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Anything already on screen, even a sliver at the bottom, skips the entrance, so nothing visible ever blinks out
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setPhase('ruled');
      return;
    }
    setPhase('armed');
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setPhase('ruled');
        io.disconnect();
      },
      {rootMargin: '0px 0px -15% 0px'},
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return {ref, phase};
}

type LedgerProps = {
  entries: TimelineEntry[];
};

/** The statement-style ledger: column heads, a heavy ink rule, one disclosure row per role and a closing ink rule. */
export function TimelineV3Ledger({entries}: LedgerProps) {
  const [open, setOpen] = useState<Set<number>>(() => new Set(entries.filter((e) => e.isCurrent).map((e) => e.order)));
  // Collapsed panels only go inert (and rows only report aria-expanded) after hydration, so the server HTML, and a no-JS
  // visit where CSS opens every panel, stays readable and never claims a row is collapsed
  const [hydrated, setHydrated] = useState(false);
  const {ref, phase} = useRuledOnView();
  const baseId = useId();
  const allOpen = entries.length > 0 && entries.every((e) => open.has(e.order));

  useEffect(() => setHydrated(true), []);

  const toggle = (order: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(order)) next.delete(order);
      else next.add(order);
      return next;
    });

  return (
    <div ref={ref} className="tlv3" data-armed={phase !== 'idle' || undefined} data-ruled={phase === 'ruled' || undefined}>
      <div className="tlv3-grid tlv3-head-row pr-2 pb-3 pl-4 max-md:pr-3 max-md:pl-0">
        <span aria-hidden="true" className="tlv3-label tlv3-idx [grid-area:idx]">
          No.
        </span>
        <span aria-hidden="true" className="tlv3-label [grid-area:when]">
          When
        </span>
        <span aria-hidden="true" className="tlv3-label [grid-area:role]">
          Role
        </span>
        <span aria-hidden="true" className="tlv3-label [grid-area:org]">
          Organisation
        </span>
        <Button
          variant="secondary"
          size="sm"
          className="tlv3-toggle"
          aria-controls={entries.map((e) => `${baseId}-${e.order}-panel`).join(' ')}
          onClick={() => setOpen(allOpen ? new Set() : new Set(entries.map((e) => e.order)))}
        >
          {allOpen ? 'Collapse all' : 'Expand all'}
        </Button>
      </div>
      <span aria-hidden="true" className="tlv3-rule block h-0.5 bg-ink" />
      <ol className="m-0 list-none p-0">
        {entries.map((entry, i) => (
          <LedgerRow
            key={entry.order}
            entry={entry}
            index={i}
            last={i === entries.length - 1}
            id={`${baseId}-${entry.order}`}
            open={open.has(entry.order)}
            hydrated={hydrated}
            onToggle={() => toggle(entry.order)}
          />
        ))}
      </ol>
      <span aria-hidden="true" className="tlv3-rule block h-0.5 bg-ink" style={{'--i': entries.length} as CSSProperties} />
    </div>
  );
}

type LedgerRowProps = {
  entry: TimelineEntry;
  index: number;
  last: boolean;
  id: string;
  open: boolean;
  /** False for the server HTML, where a no-JS visit shows every panel open, so neither `aria-expanded` nor `inert` applies yet. */
  hydrated: boolean;
  onToggle: () => void;
};

/** One role: an h3 wrapping the full-row disclosure button (APG accordion), and the panel it opens in place. */
function LedgerRow({entry, index, last, id, open, hydrated, onToggle}: LedgerRowProps) {
  return (
    <li className="group/row relative" style={{'--i': index} as CSSProperties}>
      <div className={cn('tlv3-in relative', open && 'bg-ground')}>
        {/* The accent rule on the left edge: drawn on hover and focus, and kept while the row is open. It sits above the
            focused button, which is lifted so the next row's background can't cover its outline. */}
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-y-0 left-0 z-3 w-0.5 origin-top bg-accent transition-transform duration-300 ease-out motion-reduce:transition-none',
            open ? 'scale-y-100' : 'scale-y-0 group-hover/row:scale-y-100 group-has-focus-visible/row:scale-y-100',
          )}
        />
        <h3 className="m-0 font-body text-base font-normal">
          <button
            type="button"
            id={`${id}-btn`}
            aria-expanded={hydrated ? open : undefined}
            aria-controls={`${id}-panel`}
            onClick={onToggle}
            className={cn(
              'tlv3-grid relative min-h-14 w-full cursor-pointer border-0 bg-transparent py-5 pr-2 pl-4 text-left text-ink transition-colors duration-200 focus-visible:z-2 max-md:py-[18px] max-md:pr-3 motion-reduce:transition-none',
              !open && 'hover:bg-ground',
            )}
          >
            {/* DOM order is role, organisation, then dates, so the h3's accessible name leads with the role; grid areas set the visual order */}
            <span aria-hidden="true" className="tlv3-idx flex items-center gap-2 font-mono text-[12px] text-muted tabular-nums [grid-area:idx]">
              <span className={`block size-2 rounded-[2px] ${DOTS[entry.dot]}`} />
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 font-display text-[22px] leading-[1.15] font-bold tracking-[-0.025em] [grid-area:role] max-md:text-[20px]">
              {entry.role}{' '}
              {entry.isCurrent ? (
                <span
                  data-theme="light"
                  className="rounded-pill bg-lime px-[9px] py-1.5 font-mono text-[11px] leading-none font-medium tracking-normal text-on-lime"
                >
                  NOW
                </span>
              ) : null}
            </span>{' '}
            <span className="text-[15px] leading-[1.4] font-semibold text-accent [grid-area:org]">{entry.org}</span>{' '}
            <span
              className={cn(
                'font-mono text-[13px] tabular-nums transition-colors duration-200 [grid-area:when] motion-reduce:transition-none',
                open ? 'text-ink' : 'text-muted group-hover/row:text-ink group-has-focus-visible/row:text-ink',
              )}
            >
              {entry.when}
            </span>
            <ToggleIcon open={open} />
          </button>
        </h3>
        <div id={`${id}-panel`} className="tlv3-panel" data-open={open || undefined} inert={hydrated && !open}>
          <div className="min-h-0 overflow-hidden">
            <div className="tlv3-grid tlv3-panel-body pr-2 pb-8 pl-4 max-md:pr-3 max-md:pb-6">
              <p className="m-0 max-w-[620px] text-base leading-[1.6] text-muted [grid-area:desc]">{entry.description}</p>
            </div>
          </div>
        </div>
      </div>
      {last ? null : <span aria-hidden="true" className="tlv3-hair absolute inset-x-0 bottom-0 block h-px bg-line" />}
    </li>
  );
}

/** The row's round plus, which turns into a filled minus while open. */
function ToggleIcon({open}: {open: boolean}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'tlv3-chev grid size-9 place-items-center justify-self-end rounded-full border transition-[background-color,border-color,color,rotate] duration-300 ease-out [grid-area:chev] motion-reduce:transition-none',
        open
          ? 'rotate-180 border-ink bg-ink text-white'
          : 'border-line bg-white text-ink group-hover/row:border-ink group-has-focus-visible/row:border-ink',
      )}
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M3 8h10" />
        <path
          d="M8 3v10"
          className={cn('origin-center transition-transform duration-300 ease-out motion-reduce:transition-none', open && 'scale-y-0')}
        />
      </svg>
    </span>
  );
}
