'use client';

import {Plus} from 'lucide-react';
import {type CSSProperties, type KeyboardEvent, useEffect, useId, useRef, useState} from 'react';
import type {TimelineDot, TimelineEntry} from '@/server/content';

const DOTS: Record<TimelineDot, string> = {
  lime: 'bg-lime',
  accent: 'bg-accent',
  ink: 'bg-ink',
  placeholder: 'bg-dot-placeholder',
};

/** `pending` is the server render and the first client render: disclosure markup, nothing made inert yet. */
type Mode = 'pending' | 'disclosure' | 'tabs';

/**
 * Tabs from 860px up, a disclosure list below. Read from matchMedia in an effect (never during render), so the server
 * HTML and the first client render always match.
 */
function useLayoutMode(): Mode {
  const [mode, setMode] = useState<Mode>('pending');
  useEffect(() => {
    const query = window.matchMedia('(min-width: 860px)');
    const update = () => setMode(query.matches ? 'tabs' : 'disclosure');
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return mode;
}

const pad = (n: number) => String(n).padStart(2, '0');

type Ids = {tab: string; panel: string; toggle: string; body: string};

const idsFor = (base: string, i: number): Ids => ({
  tab: `${base}-tab-${i}`,
  panel: `${base}-panel-${i}`,
  toggle: `${base}-toggle-${i}`,
  body: `${base}-body-${i}`,
});

type BoardProps = {
  entries: TimelineEntry[];
  /** The section heading's id: names the tab list. */
  labelledBy: string;
};

/**
 * One DOM for both layouts. The roles column (`RoleTabs`) is a vertical ARIA tab list from 860px up; every entry is
 * always rendered as an `<li>` in the detail list, so all of it is in the server HTML. On desktop the entries share one
 * grid cell inside the dark panel and only the selected one shows; under 860px the role list is hidden and each entry is
 * a disclosure row that opens in place.
 */
export function TimelineV6Board({entries, labelledBy}: BoardProps) {
  const base = useId().replace(/:/g, '');
  const current = Math.max(
    0,
    entries.findIndex((entry) => entry.isCurrent),
  );
  const [selected, setSelected] = useState(current);
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set([current]));
  const mode = useLayoutMode();
  const tabs = mode === 'tabs';

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div
      data-reveal
      className="grid items-stretch gap-10 md:grid-cols-2 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14"
      style={{'--tl6-sel': selected} as CSSProperties}
    >
      <RoleTabs entries={entries} selected={selected} onSelect={setSelected} tabs={tabs} base={base} labelledBy={labelledBy} />
      <ol
        role={tabs ? 'none' : undefined}
        className="tl6-detail m-0 list-none p-0 max-md:flex max-md:flex-col md:relative md:grid md:rounded-panel md:bg-code-bg md:shadow-(--shadow-deep)"
      >
        {entries.map((entry, i) => (
          <RolePanel
            key={entry.order}
            entry={entry}
            index={i}
            selected={selected}
            isOpen={open.has(i)}
            mode={mode}
            ids={idsFor(base, i)}
            onToggle={() => toggle(i)}
          />
        ))}
      </ol>
    </div>
  );
}

type RoleTabsProps = {
  entries: TimelineEntry[];
  selected: number;
  onSelect: (i: number) => void;
  tabs: boolean;
  base: string;
  labelledBy: string;
};

/** The roles column: a vertical tab list with roving tabindex, Up and Down (wrapping), Home and End, automatic activation. */
function RoleTabs({entries, selected, onSelect, tabs, base, labelledBy}: RoleTabsProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = entries.length - 1;
    const keys: Record<string, number> = {ArrowDown: i === last ? 0 : i + 1, ArrowUp: i === 0 ? last : i - 1, Home: 0, End: last};
    const next = keys[event.key];
    // Only the keys handled here are kept from scrolling the page
    if (next === undefined) return;
    event.preventDefault();
    onSelect(next);
    refs.current[next]?.focus();
  };

  return (
    <div
      {...(tabs ? ({role: 'tablist', 'aria-orientation': 'vertical', 'aria-labelledby': labelledBy} as const) : {})}
      className="tl6-master relative isolate self-start before:absolute before:inset-x-5 before:top-0 before:h-px before:bg-line before:content-[''] max-md:hidden"
    >
      {/* The selection: one fill that glides from tab to tab (positioned by --tl6-sel, so it is right in the server HTML too) */}
      <span aria-hidden="true" className="tl6-glide pointer-events-none absolute inset-x-0 top-0 -z-1 h-20 rounded-[18px] bg-tint">
        <span className="absolute top-5 bottom-5 left-0 w-[3px] rounded-pill bg-accent" />
      </span>
      {entries.map((entry, i) => {
        const ids = idsFor(base, i);
        const active = i === selected;
        return (
          <button
            key={entry.order}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            // Tab semantics only once the layout is known to be the desktop one (set in an effect, so hydration matches)
            {...(tabs ? ({role: 'tab', id: ids.tab, 'aria-selected': active, 'aria-controls': ids.panel, tabIndex: active ? 0 : -1} as const) : {})}
            data-active={active || undefined}
            onClick={() => onSelect(i)}
            onKeyDown={(event) => onKeyDown(event, i)}
            className="group relative grid h-20 w-full cursor-pointer grid-cols-[10px_minmax(0,1fr)_auto] content-center items-center gap-x-4 gap-y-1.5 rounded-[18px] border-0 bg-transparent px-5 text-left after:absolute after:inset-x-5 after:bottom-0 after:h-px after:bg-line after:content-['']"
          >
            <span className={`block size-2.5 rounded-full ${DOTS[entry.dot]}`} />
            <span className="col-span-2 truncate text-base leading-tight font-semibold lg:text-[18px] text-ink transition-colors group-hover:text-accent">
              {entry.role}
              {/* Commas for the tab's accessible name, which otherwise runs role, org and dates together. Inside the
                  spans, since a separate grid item would add a space before each comma. */}
              <span className="sr-only">,</span>
            </span>
            <span className="col-start-2 truncate text-sm text-muted group-data-active:text-accent">
              {entry.org}
              <span className="sr-only">,</span>
            </span>
            <span className="font-mono text-[12.5px] whitespace-nowrap text-muted">{entry.when}</span>
          </button>
        );
      })}
    </div>
  );
}

type RolePanelProps = {
  entry: TimelineEntry;
  index: number;
  selected: number;
  isOpen: boolean;
  mode: Mode;
  ids: Ids;
  onToggle: () => void;
};

/**
 * One entry: a tab panel inside the dark detail panel from 860px up, a disclosure row below. `data-pos` says which side
 * of the selection an inactive panel sits on, so panels slide in the direction of travel.
 */
function RolePanel({entry, index, selected, isOpen, mode, ids, onToggle}: RolePanelProps) {
  const tabs = mode === 'tabs';
  const active = index === selected;
  const pos = index < selected ? 'before' : index > selected ? 'after' : undefined;
  return (
    // The li is only a grid cell (an li may not take the tabpanel role), so the panel is the div inside it
    <li role={tabs ? 'none' : undefined} className="tl6-cell grid">
      <div
        // Tab panel semantics only in the desktop layout (set in an effect, like the tabs, so hydration matches)
        {...(tabs ? ({role: 'tabpanel', id: ids.panel, 'aria-labelledby': ids.tab, tabIndex: active ? 0 : undefined} as const) : {})}
        data-active={active || undefined}
        data-pos={pos}
        data-open={isOpen || undefined}
        className="tl6-item relative flex min-w-0 flex-col max-md:border max-md:border-transparent max-md:border-b-line max-md:data-open:rounded-card max-md:data-open:border-transparent max-md:data-open:bg-code-bg max-md:has-[h3_button:focus-visible]:outline-2 max-md:has-[h3_button:focus-visible]:outline-offset-2 max-md:has-[h3_button:focus-visible]:outline-accent md:overflow-hidden md:rounded-panel md:p-12 md:focus-visible:outline-offset-[-10px] lg:p-14"
      >
        <span
          aria-hidden="true"
          className="tl6-num pointer-events-none absolute -top-[0.1em] right-8 font-display text-[clamp(150px,15vw,230px)] leading-none font-extrabold tracking-[-0.06em] text-transparent select-none max-md:hidden"
        >
          {pad(index + 1)}
        </span>
        <div className="relative flex flex-col gap-2 max-md:py-5 max-md:pr-16 max-md:pl-5 md:gap-3 md:pr-6 lg:pr-36">
          <p className="m-0 flex min-h-6 items-center gap-3 font-mono text-[13px] text-muted md:mb-3 md:text-sm">
            {entry.when}
            {entry.isCurrent ? (
              <span data-theme="light" className="rounded-pill bg-lime px-[9px] py-1.5 font-mono text-[11px] leading-none text-on-lime">
                NOW
              </span>
            ) : null}
          </p>
          <h3 className="m-0 font-display text-[22px] leading-[1.15] font-bold tracking-[-0.03em] text-ink md:text-[clamp(30px,3.3vw,48px)] md:leading-[1.02]">
            {tabs ? (
              entry.role
            ) : (
              <button
                type="button"
                id={ids.toggle}
                aria-expanded={isOpen}
                aria-controls={ids.body}
                onClick={onToggle}
                className="cursor-pointer border-0 bg-transparent p-0 text-left text-inherit [font:inherit] [letter-spacing:inherit] after:absolute after:inset-0 after:content-[''] focus-visible:outline-none md:pointer-events-none"
              >
                {entry.role}
              </button>
            )}
          </h3>
          <p className="m-0 text-[15px] font-semibold text-accent md:text-lg">{entry.org}</p>
          <Plus aria-hidden="true" className="tl6-plus pointer-events-none absolute top-6 right-5 size-6 text-ink md:hidden" strokeWidth={1.75} />
        </div>
        <div id={ids.body} inert={mode === 'disclosure' && !isOpen} className="tl6-body grid md:mt-auto">
          <div className="min-h-0 overflow-hidden">
            <p className="m-0 max-w-[620px] text-base leading-[1.6] text-muted max-md:px-5 max-md:pb-6 md:mt-10 md:border-t md:border-line md:pt-6 md:text-[17px]">
              {entry.description}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
}
