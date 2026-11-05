import type {RefObject} from 'react';
import {cn} from '@/lib/cn';
import type {Milestone} from '@/server/content-schema';

type MilestoneStageRailProps = {
  milestones: Milestone[];
  /** The milestone on stage, or -1 before the stage has armed */
  active: number;
  /** The accent fill, which the scene scales to the scroll progress every frame */
  fillRef: RefObject<HTMLSpanElement | null>;
  onJump: (index: number) => void;
};

/** The progress rail: an accent fill across the whole pin, with one jump button per milestone at the start of its stretch. */
export function MilestoneStageRail({milestones, active, fillRef, onJump}: MilestoneStageRailProps) {
  return (
    <div className="relative">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 rounded-pill bg-line" />
      <span ref={fillRef} aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 rounded-pill bg-accent" />
      <ul aria-label="Jump to a milestone" className="relative m-0 flex list-none p-0">
        {milestones.map((m, i) => (
          <li key={m.order} className="min-w-0 flex-1">
            <button
              type="button"
              aria-label={`${m.value} ${m.title}`}
              aria-current={i === active ? 'step' : undefined}
              onClick={() => onJump(i)}
              className={cn(
                'group relative flex min-h-11 w-full min-w-0 cursor-pointer flex-col items-start gap-2 rounded-sm bg-transparent pt-4 pb-1 text-left',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                i <= active ? 'text-ink' : 'text-muted hover:text-ink',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'absolute top-[-5px] left-0 size-3 rounded-full border-2 transition-colors duration-200',
                  i <= active ? 'border-accent bg-accent' : 'border-line bg-film group-hover:border-ink',
                )}
              />
              <span className="font-mono text-xs leading-none font-medium tracking-[0.04em]">{m.value}</span>
              <span className="w-full truncate pr-4 text-[13px] leading-tight max-md:hidden">{m.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
