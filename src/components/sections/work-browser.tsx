'use client';

import {type CSSProperties, createContext, type MouseEvent, type ReactNode, useContext, useState} from 'react';
import {cn} from '@/lib/cn';
import {WORK_FILTERS, type WorkFilter, workFilterHref, workFilterUrl} from '@/lib/work-filter';
import {stackScope} from '@/lib/work-stack';

/*
 * The Work filter as progressive enhancement. Without JavaScript the pills are links to `/?filter=…`, served from
 * prerendered variants. With JavaScript they filter in place: every card is already in the stack, `data-filter` hides
 * the others with CSS, and the address bar is updated with replaceState. Nothing navigates, so the hero film keeps
 * playing where it was.
 */

type Counts = Record<WorkFilter, number>;

const WorkFilterContext = createContext<{filter: WorkFilter; setFilter: (filter: WorkFilter) => void; counts: Counts} | null>(null);

const useWorkFilter = () => {
  const value = useContext(WorkFilterContext);
  if (!value) throw new Error('Work filter components must be inside <WorkFilterProvider>');
  return value;
};

type WorkFilterProviderProps = {
  initialFilter: WorkFilter;
  counts: Counts;
  children: ReactNode;
};

export function WorkFilterProvider({initialFilter, counts, children}: WorkFilterProviderProps) {
  const [filter, setFilter] = useState(initialFilter);
  return <WorkFilterContext value={{filter, setFilter, counts}}>{children}</WorkFilterContext>;
}

/** "(06)": the number of projects the active filter shows. */
export function WorkCount() {
  const {filter, counts} = useWorkFilter();
  return <>({String(counts[filter]).padStart(2, '0')})</>;
}

export function WorkFilters() {
  const {filter, setFilter} = useWorkFilter();

  const onClick = (next: WorkFilter) => (event: MouseEvent<HTMLAnchorElement>) => {
    // Let modified clicks open the filtered page in a new tab or window as usual
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setFilter(next);
    window.history.replaceState(null, '', workFilterUrl(next));
  };

  return (
    <nav aria-label="Filter projects" className="flex flex-wrap gap-2">
      {WORK_FILTERS.map((f) => {
        const isActive = f.id === filter;
        return (
          <a
            key={f.id}
            href={workFilterHref(f.id)}
            onClick={onClick(f.id)}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'inline-flex min-h-11 items-center rounded-pill border px-[18px] text-sm leading-none font-medium no-underline',
              isActive ? 'border-ink bg-ink text-white hover:text-white' : 'border-line bg-white text-ink hover:border-ink hover:text-ink',
            )}
          >
            {f.label}
          </a>
        );
      })}
    </nav>
  );
}

type WorkStackProps = {
  /** The number of cards: their view timelines are scoped to the stack so each card can follow the next one. */
  count: number;
  children: ReactNode;
};

/**
 * The card stack (`.work-stack` in globals.css). Cards carry `data-group`; `data-filter` hides the other group and picks
 * each card's per-filter stack index, so the sticky offsets stay evenly spaced whatever the filter hides.
 */
export function WorkStack({count, children}: WorkStackProps) {
  const {filter, counts} = useWorkFilter();
  return (
    <>
      <div data-filter={filter} style={{'--scope': stackScope(count)} as CSSProperties} className="work-stack flex flex-col gap-6 max-md:gap-4">
        {children}
      </div>
      <p aria-live="polite" className="sr-only">
        {counts[filter]} projects shown
      </p>
    </>
  );
}
