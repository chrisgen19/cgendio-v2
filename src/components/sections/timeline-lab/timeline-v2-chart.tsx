'use client';

import {type CSSProperties, type KeyboardEvent, useEffect, useId, useRef, useState} from 'react';
import {cn} from '@/lib/cn';
import type {AxisTick, BarPlacement} from './timeline-v2-spans';

export type ChartRole = {
  key: number;
  when: string;
  role: string;
  org: string;
  description: string;
  isCurrent: boolean;
  /** Null when `when` didn't parse: the lane keeps its label and date but draws no bar */
  bar: BarPlacement | null;
};

type ChartProps = {
  roles: ChartRole[];
  ticks: AxisTick[];
  /** The section heading, which names the tablist */
  labelledBy: string;
};

// How long a hover rests on a lane before the detail area previews it
const PREVIEW_DELAY = 100;

const STEPS: Record<string, number> = {ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1};

/**
 * The desktop career span chart: one lane per role on a shared year axis, built as ARIA tabs (the lanes are the tabs,
 * the detail card below is the tab panel). Click, tap, focus and the arrow keys select; hovering only previews, and
 * leaving the chart goes back to the selection. The current role is selected to begin with.
 */
export function TimelineV2Chart({roles, ticks, labelledBy}: ChartProps) {
  const baseId = useId();
  const firstCurrent = roles.findIndex((r) => r.isCurrent);
  const [selected, setSelected] = useState(firstCurrent === -1 ? 0 : firstCurrent);
  const [preview, setPreview] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = preview ?? selected;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const select = (i: number) => {
    window.clearTimeout(timer.current);
    setSelected(i);
    setPreview(null);
  };

  const hover = (i: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPreview(i), PREVIEW_DELAY);
  };

  const leave = () => {
    window.clearTimeout(timer.current);
    setPreview(null);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = roles.length - 1;
    const step = STEPS[event.key];
    let next: number;
    if (step !== undefined) next = (selected + step + roles.length) % roles.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    else return;
    event.preventDefault();
    select(next);
    tabs.current[next]?.focus();
  };

  const tabId = (i: number) => `${baseId}-tab-${i}`;
  const panelId = (i: number) => `${baseId}-panel-${i}`;

  // A plain wrapper, not a <figure>: the tablist inside already takes the section heading as its name
  return (
    <div
      data-tl2-grow=""
      className="tl2-chart rounded-panel border border-line bg-ground p-8 [--tl2-label:320px] max-lg:p-6 max-lg:[--tl2-label:220px]"
    >
      <Axis ticks={ticks} />
      <div className="relative">
        <Grid ticks={ticks} />
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-labelledby={labelledBy}
          onKeyDown={onKeyDown}
          onPointerLeave={leave}
          className="relative flex flex-col gap-1"
        >
          {roles.map((role, i) => (
            <Lane
              key={role.key}
              entry={role}
              id={tabId(i)}
              controls={panelId(i)}
              selected={i === selected}
              active={i === active}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              onSelect={() => select(i)}
              onHover={() => hover(i)}
            />
          ))}
        </div>
        <Sweep />
      </div>
      <div className="tl2-panels mt-6 grid">
        {roles.map((role, i) => (
          <Panel key={role.key} entry={role} id={panelId(i)} labelledBy={tabId(i)} selected={i === selected} active={i === active} />
        ))}
      </div>
    </div>
  );
}

// The plot area's left edge inside the lanes wrapper: lane padding (px-4, 16px) + label column + column gap (gap-6, 24px)
const PLOT_INSET = 'right-4 left-[calc(var(--tl2-label)+40px)]';

/** The year labels above the lanes, plus the lime NOW flag at the right edge. Decorative: every lane names its dates. */
function Axis({ticks}: {ticks: AxisTick[]}) {
  return (
    <div aria-hidden="true" className="grid grid-cols-[var(--tl2-label)_minmax(0,1fr)] gap-6 px-4 pb-3">
      <span />
      <div className="tl2-axis relative h-7">
        {ticks
          .filter((t) => t.labelled)
          .map((t) => (
            <span
              key={t.year}
              data-near-end={t.nearEnd || undefined}
              style={{left: `${t.frac * 100}%`}}
              className={cn('absolute top-1.5 font-mono text-[12px] leading-none text-muted', t.frac > 0 && '-translate-x-1/2')}
            >
              {t.year}
            </span>
          ))}
        <span
          data-theme="light"
          className="absolute top-0 right-0 translate-x-1/2 rounded-pill bg-lime px-[9px] py-1.5 font-mono text-[11px] leading-none text-on-lime"
        >
          NOW
        </span>
      </div>
    </div>
  );
}

/** Hairline year ticks behind the lanes and the dashed NOW edge. The selected lane's card sits over them. */
function Grid({ticks}: {ticks: AxisTick[]}) {
  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-y-0', PLOT_INSET)}>
      {ticks.map((t) => (
        <span key={t.year} style={{left: `${t.frac * 100}%`}} className="absolute inset-y-0 w-px bg-line" />
      ))}
      <span className="absolute inset-y-0 right-0 border-r-2 border-dashed border-accent" />
    </div>
  );
}

/**
 * The playhead that plays the years in on first view. It sits above the lanes (unlike the grid) so the line stays
 * unbroken across the selected lane's card, where the current role's bar lands. Clipped to the plot area.
 */
function Sweep() {
  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-y-0 overflow-hidden', PLOT_INSET)}>
      <div className="tl2-sweep absolute inset-0" />
    </div>
  );
}

type LaneProps = {
  entry: ChartRole;
  id: string;
  controls: string;
  selected: boolean;
  active: boolean;
  ref: (el: HTMLButtonElement | null) => void;
  onSelect: () => void;
  onHover: () => void;
};

/** One role: its title and org in the label column, its bar on the axis, and the `when` text beside the bar. */
function Lane({entry: role, id, controls, selected, active, ref, onSelect, onHover}: LaneProps) {
  const {bar} = role;
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={id}
      aria-selected={selected}
      aria-controls={controls}
      aria-label={`${role.role}, ${role.org}, ${role.when}`}
      tabIndex={selected ? 0 : -1}
      data-active={active || undefined}
      onClick={onSelect}
      onFocus={onSelect}
      onPointerEnter={onHover}
      className="group grid min-h-16 cursor-pointer grid-cols-[var(--tl2-label)_minmax(0,1fr)] items-center gap-6 rounded-[16px] border border-transparent px-4 py-3 text-left font-body text-ink transition-[background-color,box-shadow,border-color] duration-200 data-active:border-line data-active:bg-white data-active:shadow-(--shadow-card) motion-reduce:transition-none"
    >
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-[15px] leading-[1.3] font-semibold tracking-[-0.01em]">{role.role}</span>
        <span className="text-[13px] leading-[1.35] text-muted transition-colors duration-200 group-data-active:text-accent motion-reduce:transition-none">
          {role.org}
        </span>
      </span>
      <span className="relative block h-10">
        {bar ? <Bar bar={bar} current={role.isCurrent} /> : null}
        <span
          style={bar ? ({'--s': bar.s, '--w': bar.w} as CSSProperties) : undefined}
          data-side={bar?.side ?? 'none'}
          className={cn(
            'tl2-when absolute top-1/2 -translate-y-1/2 font-mono text-[12px] leading-none font-medium whitespace-nowrap',
            bar ? 'text-ink' : 'left-0 text-muted',
            bar?.side === 'inside' && 'rounded-[6px] bg-white px-1.5 py-1',
          )}
        >
          {role.when}
        </span>
      </span>
    </button>
  );
}

/** A role's span: muted until its lane lights up, ink when it does; the current role is accent with a lime NOW cap. */
function Bar({bar, current}: {bar: BarPlacement; current: boolean}) {
  return (
    <span
      style={{'--s': bar.s, '--w': bar.w} as CSSProperties}
      className={cn(
        'tl2-bar absolute top-1/2 left-[calc(var(--s)*100%)] h-3 w-[max(10px,calc(var(--w)*100%))] -translate-y-1/2 rounded-pill transition-colors duration-200 motion-reduce:transition-none',
        current ? 'bg-accent' : 'bg-muted group-data-active:bg-ink',
      )}
    >
      {current && bar.open ? (
        <span className="tl2-cap absolute top-1/2 right-0 size-4 translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-lime" />
      ) : null}
    </span>
  );
}

type PanelProps = {entry: ChartRole; id: string; labelledBy: string; selected: boolean; active: boolean};

/**
 * A role's detail card. Every panel shares one grid cell, so the area keeps the height of the longest one and the page
 * never jumps; only the active one is visible (the selected role, or the one being previewed by hover).
 */
function Panel({entry: role, id, labelledBy, selected, active}: PanelProps) {
  return (
    <div
      role="tabpanel"
      id={id}
      aria-labelledby={labelledBy}
      tabIndex={selected ? 0 : -1}
      data-active={active || undefined}
      className="invisible grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-x-12 gap-y-4 rounded-card border border-line bg-white px-8 py-7 opacity-0 shadow-(--shadow-card) transition-[opacity,visibility] duration-200 [grid-area:1/1] data-active:visible data-active:opacity-100 max-lg:grid-cols-1 motion-reduce:transition-none"
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-[13px] text-muted">{role.when}</span>
          {role.isCurrent ? (
            <span data-theme="light" className="rounded-pill bg-lime px-[9px] py-1.5 font-mono text-[11px] leading-none text-on-lime">
              NOW
            </span>
          ) : null}
        </div>
        <h3 className="m-0 font-display text-[30px] leading-[1.05] font-bold tracking-[-0.03em]">{role.role}</h3>
        <span className="text-[15px] font-semibold text-accent">{role.org}</span>
      </div>
      <p className="m-0 max-w-[620px] text-[17px] leading-[1.6] text-muted">{role.description}</p>
    </div>
  );
}
