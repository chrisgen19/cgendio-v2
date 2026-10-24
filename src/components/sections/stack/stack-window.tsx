'use client';

import {type KeyboardEvent, type ReactNode, useEffect, useId, useRef, useState} from 'react';
import {cn} from '@/lib/cn';
import {useShownHeight} from './use-shown-height';
import {useTypingIntro} from './use-typing-intro';

const VIEWS = [
  {id: 'ts', file: 'stack.ts'},
  {id: 'json', file: 'stack.json'},
] as const;
type View = (typeof VIEWS)[number]['id'];

/** How long the old view takes to fade before the new one fades in */
const FADE_MS = 140;

const PANEL = cn(
  'relative px-5 pt-2 pb-6 font-mono text-sm leading-[1.75] text-code-text max-md:px-4 max-md:text-[13px] max-md:leading-[1.65]',
  'focus-visible:outline-code-keyword focus-visible:-outline-offset-4',
);
const PILL = 'rounded-md px-[9px] py-[5px] font-mono text-xs leading-none';

type StackWindowProps = {
  /** The stack.ts view (server-rendered list markup) */
  ts: ReactNode;
  /** The flat stack.json view */
  json: ReactNode;
  /** The status line under the window, e.g. "15 tools in 5 groups" */
  summary: string;
};

/**
 * The code window: the blog's editor chrome with file tabs. Without JS it is a plain window showing stack.ts; once
 * hydrated the filename becomes a real tablist (arrow keys, Home, End) and switching crossfades while the body eases to
 * the new height.
 */
export function StackWindow({ts, json, summary}: StackWindowProps) {
  const id = useId();
  const rootRef = useRef<HTMLElement>(null);
  const tsRef = useRef<HTMLDivElement>(null);
  const jsonRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<View>('ts');
  const [shown, setShown] = useState<View>('ts');
  const [fading, setFading] = useState(false);
  const pending = useTypingIntro(rootRef, tsRef, caretRef);
  const height = useShownHeight(shown === 'ts' ? tsRef : jsonRef);

  useEffect(() => {
    setMounted(true);
    return () => clearTimeout(fadeTimer.current);
  }, []);

  const select = (view: View) => {
    if (view === active) return;
    setActive(view);
    clearTimeout(fadeTimer.current);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(view);
      return;
    }
    setFading(true);
    fadeTimer.current = setTimeout(() => {
      setShown(view);
      setFading(false);
    }, FADE_MS);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const index = VIEWS.findIndex((view) => view.id === active);
    const next = {ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: VIEWS.length - 1}[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const view = VIEWS[(next + VIEWS.length) % VIEWS.length]?.id ?? 'ts';
    select(view);
    document.getElementById(`${id}-tab-${view}`)?.focus();
  };

  const panelProps = (view: View) =>
    mounted ? {id: `${id}-panel-${view}`, role: 'tabpanel', 'aria-labelledby': `${id}-tab-${view}`, tabIndex: 0} : {};

  return (
    <figure ref={rootRef} className="group/code m-0 min-w-0">
      <div className="overflow-hidden rounded-card bg-code-bg shadow-(--shadow-deep)">
        <div className="flex items-center gap-2 pt-1 pr-3 pl-4">
          <span aria-hidden="true" className="mr-1.5 flex gap-2">
            <i className="block size-[9px] rounded-full bg-code-dots" />
            <i className="block size-[9px] rounded-full bg-code-dots" />
            <i className="block size-[9px] rounded-full bg-code-dots" />
          </span>
          {mounted ? (
            <div role="tablist" aria-label="Stack file" className="flex" onKeyDown={onKeyDown}>
              {VIEWS.map((view) => (
                <button
                  key={view.id}
                  id={`${id}-tab-${view.id}`}
                  type="button"
                  role="tab"
                  aria-selected={active === view.id}
                  aria-controls={`${id}-panel-${view.id}`}
                  tabIndex={active === view.id ? 0 : -1}
                  onClick={() => select(view.id)}
                  className="group/tab flex h-11 items-center rounded-md px-1 focus-visible:outline-code-keyword"
                >
                  <span
                    className={cn(
                      PILL,
                      'transition-colors',
                      active === view.id ? 'bg-code-chrome text-on-dark' : 'text-code-dim group-hover/tab:text-code-text',
                    )}
                  >
                    {view.file}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <span className="flex h-11 items-center px-1">
              <span className={cn(PILL, 'bg-code-chrome text-on-dark')}>stack.ts</span>
            </span>
          )}
        </div>
        <div style={{height}} className="overflow-hidden motion-safe:transition-[height] motion-safe:duration-300 motion-safe:ease-mark">
          <div className={cn('motion-safe:transition-opacity motion-safe:duration-150', fading && 'opacity-0')}>
            <div ref={tsRef} hidden={shown !== 'ts'} className={PANEL} {...panelProps('ts')}>
              {ts}
              <span ref={caretRef} aria-hidden="true" className="pointer-events-none absolute top-0 left-0 w-[0.55em] bg-code-string opacity-0" />
            </div>
            <div ref={jsonRef} hidden={shown !== 'json'} className={PANEL} {...panelProps('json')}>
              {json}
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-4 flex items-center gap-2.5 font-mono text-[13px] leading-none text-muted">
        <i
          aria-hidden="true"
          className={cn(
            'block size-2 rounded-full transition-[background-color,box-shadow] duration-300',
            pending ? 'bg-line' : 'bg-status shadow-[0_0_0_4px_rgba(22,163,74,0.15)]',
          )}
        />
        <span className={cn('transition-opacity duration-300', pending && 'opacity-0')}>{summary}</span>
      </figcaption>
    </figure>
  );
}
