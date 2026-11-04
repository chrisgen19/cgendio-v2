'use client';

import {type KeyboardEvent, type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {cn} from '@/lib/cn';

export type WriteUpField = {id: string; label: string};

type WriteUpTabsProps = {
  fields: WriteUpField[];
  /** False when the sheet stays stacked at every width (one field, or a field with no label). */
  tabbed: boolean;
  children: ReactNode;
};

const WIDE = '(min-width: 1080px)';

/** Where the ink pill sits under the open tab, in the tab row's own pixels. Null until measured. */
type Pill = {x: number; width: number};

/**
 * The write-up's fields as tabs on wide screens. The fields are server-rendered children: this only moves the open
 * one (data-active, plus data-side so the closing field slides out the way it came) and keeps the tab semantics on the
 * panels while the tab row is showing. Under 1080px, or without JavaScript, every field stays visible.
 */
export function WriteUpTabs({fields, tabbed, children}: WriteUpTabsProps) {
  const [active, setActive] = useState(fields[0]?.id ?? '');
  const [wide, setWide] = useState(false);
  const [pill, setPill] = useState<Pill | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tabbed) return;
    const query = window.matchMedia(WIDE);
    const update = () => setWide(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [tabbed]);

  // A link to one field (#write-up-billing) opens its tab, on load and whenever the hash changes. The fields share one
  // grid cell, so the browser's own jump to the target already lands on the sheet.
  useEffect(() => {
    if (!tabbed) return;
    const openFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (fields.some((field) => field.id === id)) setActive(id);
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, [fields, tabbed]);

  // Move the open field and, while the tabs show, give the fields their tabpanel role
  useEffect(() => {
    if (!tabbed) return;
    const index = fields.findIndex(({id}) => id === active);
    fields.forEach(({id}, i) => {
      const panel = document.getElementById(id);
      if (!panel) return;
      panel.toggleAttribute('data-active', i === index);
      panel.dataset.side = i < index ? 'before' : 'after';
      if (wide) {
        panel.setAttribute('role', 'tabpanel');
        panel.tabIndex = 0;
      } else {
        panel.removeAttribute('role');
        panel.removeAttribute('tabindex');
      }
    });
  }, [active, fields, tabbed, wide]);

  const measure = useCallback(() => {
    const tab = document.getElementById(`${active}-tab`);
    if (tab && tab.offsetWidth > 0) setPill({x: tab.offsetLeft, width: tab.offsetWidth});
  }, [active]);

  useLayoutEffect(() => {
    if (wide) measure();
  }, [measure, wide]);

  // Labels change width when the display font arrives or the window resizes
  useEffect(() => {
    const list = listRef.current;
    if (!list || !wide) return;
    const observer = new ResizeObserver(measure);
    for (const tab of list.querySelectorAll('[role="tab"]')) observer.observe(tab);
    return () => observer.disconnect();
  }, [measure, wide]);

  // A tab row wider than the sheet scrolls sideways: keep the open tab in view without moving the page
  useEffect(() => {
    const list = listRef.current;
    const tab = document.getElementById(`${active}-tab`);
    if (!list || !tab || !wide || list.scrollWidth <= list.clientWidth) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.scrollTo({left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth'});
  }, [active, wide]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = fields.findIndex(({id}) => id === active);
    const target = {ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: fields.length - 1}[event.key];
    if (target === undefined) return;
    event.preventDefault();
    const next = fields[(target + fields.length) % fields.length];
    setActive(next.id);
    listRef.current?.querySelector<HTMLElement>(`#${next.id}-tab`)?.focus();
  };

  return (
    <div className={cn('flex flex-col gap-10', tabbed && 'write-up-tabbed')}>
      {tabbed ? (
        <div
          ref={listRef}
          role="tablist"
          aria-label="Write-up"
          onKeyDown={onKeyDown}
          // Long or many labels scroll inside the sheet instead of pushing past it (the Next button below reaches every field too)
          className="write-up-tablist relative max-w-full self-start overflow-x-auto overscroll-x-contain rounded-pill border border-line bg-white p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {pill ? (
            <span
              aria-hidden="true"
              style={{translate: `${pill.x - 4}px 0`, width: pill.width}}
              className="absolute inset-y-1 left-1 rounded-pill bg-ink transition-[translate,width] duration-450 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none"
            />
          ) : null}
          {fields.map(({id, label}) => {
            const selected = id === active;
            return (
              <button
                key={id}
                id={`${id}-tab`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={id}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(id)}
                className={cn(
                  'relative z-1 inline-flex min-h-11 cursor-pointer items-center rounded-pill border-0 bg-transparent px-5 font-body text-[15px] font-semibold whitespace-nowrap transition-colors duration-200',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none',
                  selected ? 'text-white' : 'text-muted hover:text-ink',
                  // Until the pill is measured the open tab draws its own fill
                  selected && !pill && 'bg-ink',
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : null}
      <div className="write-up-panels">{children}</div>
      {tabbed ? <NextField fields={fields} active={active} onSelect={setActive} /> : null}
    </div>
  );
}

type NextFieldProps = {fields: WriteUpField[]; active: string; onSelect: (id: string) => void};

/** A way on for readers who skip the tab row: opens the next field, and on the last one goes back to the first. */
function NextField({fields, active, onSelect}: NextFieldProps) {
  const index = fields.findIndex(({id}) => id === active);
  const last = index === fields.length - 1;
  const target = fields[last ? 0 : index + 1];
  return (
    <div className="write-up-tablist items-center justify-end border-t border-line pt-6">
      <button
        type="button"
        aria-controls={target.id}
        onClick={() => onSelect(target.id)}
        className="group/next inline-flex min-h-11 cursor-pointer items-center gap-2.5 rounded-pill border border-line bg-white pr-2 pl-5 font-body text-[15px] font-semibold text-ink transition-[border-color,translate] duration-200 hover:-translate-y-px hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <span className="text-muted">{last ? 'Back to' : 'Next'}</span>
        {target.label}
        <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-ink text-white">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            className={cn(last && 'rotate-180')}
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </button>
    </div>
  );
}
