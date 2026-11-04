'use client';

import type {ReactNode, Ref} from 'react';
import {cn} from '@/lib/cn';
import type {Direction} from './use-form-steps';

type StepShellProps = {
  index: number;
  current: number;
  title: string;
  /** What was answered, shown once the step is done */
  summary: string;
  headingRef: Ref<HTMLHeadingElement>;
  direction: Direction;
  onChange: () => void;
  last?: boolean;
  /** h3 under the home page's h2; h2 on /contact, where the section heading is the h1 */
  headingLevel: 2 | 3;
  children: ReactNode;
};

/**
 * One step of the form: a numbered node on the rail, the step heading, and either its body (current), a one-line
 * answer with a Change button (done) or nothing (still ahead). The body stays mounted when hidden, so its fields submit.
 */
export function StepShell({index, current, title, summary, headingRef, direction, onChange, last, headingLevel, children}: StepShellProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const state = index < current ? 'done' : index === current ? 'current' : 'ahead';
  const headingId = `contact-step-${index}`;

  return (
    <li className="relative grid grid-cols-[36px_1fr] gap-x-5 max-md:gap-x-4">
      {/* The rail: grey track, accent fill once this step is done */}
      {last ? null : (
        <span aria-hidden="true" className="absolute top-12 bottom-2 left-[17px] w-0.5 overflow-hidden rounded-pill bg-line">
          <span
            className={cn(
              'block size-full origin-top rounded-pill bg-accent motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-mark',
              state === 'done' ? 'scale-y-100' : 'scale-y-0',
            )}
          />
        </span>
      )}
      <span
        aria-hidden="true"
        className={cn(
          'relative z-1 mt-0.5 grid size-9 place-items-center rounded-pill border-2 font-mono text-[13px] font-medium motion-safe:transition-colors motion-safe:duration-300',
          state === 'done' && 'border-accent bg-accent text-on-accent',
          state === 'current' && 'border-accent bg-white text-accent',
          state === 'ahead' && 'border-line bg-white text-muted',
        )}
      >
        {state === 'done' ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        ) : (
          index + 1
        )}
      </span>
      <div className={cn('min-w-0', last ? 'pb-0' : state === 'current' ? 'pb-10' : 'pb-7')}>
        <Heading
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className={cn(
            'm-0 scroll-mt-28 font-display leading-[1.1] font-bold tracking-[-0.03em] focus:outline-none',
            state === 'current' ? 'pt-1 text-[clamp(24px,2.4vw,32px)] text-ink' : 'pt-1.5 text-xl',
            state === 'ahead' ? 'text-muted' : 'text-ink',
          )}
        >
          <span className="sr-only">{`Step ${index + 1}: `}</span>
          {title}
        </Heading>
        {state === 'done' ? (
          <div className="mt-1 flex flex-wrap items-center gap-x-3">
            <p className="m-0 min-w-0 truncate text-[15px] text-muted">{summary}</p>
            <button
              type="button"
              onClick={onChange}
              className="-my-2 inline-flex min-h-11 cursor-pointer items-center rounded-pill px-2 text-sm font-semibold text-accent underline-offset-4 hover:underline"
            >
              Change<span className="sr-only">{` ${title.toLowerCase().replace('?', '')}`}</span>
            </button>
          </div>
        ) : null}
        <div hidden={state !== 'current'} data-dir={direction} className={'contact-step mt-6'}>
          {children}
        </div>
      </div>
    </li>
  );
}
