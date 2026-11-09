import type {CSSProperties} from 'react';
import {cn} from '@/lib/cn';
import {STACK_EXTRAS} from '@/lib/stack-groups';
import {StackRulerTicks} from './stack-ruler-ticks';

const TOOL_COUNT = STACK_EXTRAS.reduce((total, group) => total + group.tools.length, 0);
const GROUP_SIZES = STACK_EXTRAS.map((group) => group.tools.length);
/** Where each group's first tool sits in the run of all the ticks. */
const GROUP_STARTS = GROUP_SIZES.map((_, group) => GROUP_SIZES.slice(0, group).reduce((sum, size) => sum + size, 0));

/**
 * The rest of the toolbox under the plates, as a measuring ruler: closed it is one quiet line with a tick per hidden
 * tool, and opening pulls each tick down to its row, where it unrolls into the tool's name. A native details element, so
 * the closed tools stay in the page for search and find-in-page, and it opens without JavaScript.
 */
export function StackEverythingElse() {
  return (
    <div data-reveal>
      <details className="stack-ruler">
        <summary className="stack-ruler-summary group/summary grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 py-1 md:grid-cols-[auto_minmax(0,1fr)_auto]">
          <span className="font-mono text-[13px] leading-none font-medium tracking-[0.08em] text-muted uppercase md:col-start-1 md:row-start-1">
            Everything else
          </span>
          <span className="stack-ruler-pill inline-flex min-h-11 items-center justify-center rounded-pill border border-line bg-white px-[18px] font-body text-sm leading-none font-semibold text-ink transition-[border-color,transform] duration-200 group-hover/summary:-translate-y-px group-hover/summary:border-ink motion-reduce:transition-none motion-reduce:group-hover/summary:translate-y-0 md:col-start-3 md:row-start-1">
            {/* Stacked in one cell so the pill, and with it the ruler, keeps its width when the words change */}
            <span className="grid justify-items-center *:col-start-1 *:row-start-1">
              <span className="stack-ruler-show">Show {TOOL_COUNT} more tools</span>
              <span className="stack-ruler-hide">Hide {TOOL_COUNT} tools</span>
            </span>
          </span>
          <StackRulerTicks groupSizes={GROUP_SIZES} />
        </summary>
        <div className="mt-8 columns-4 gap-10 max-lg:columns-2 max-md:mt-7 max-md:columns-1">
          {STACK_EXTRAS.map((group, groupIndex) => (
            <div key={group.name} className="break-inside-avoid pb-9 max-md:pb-7">
              <div className="stack-ruler-heading pl-[11px]" style={{'--g': groupIndex} as CSSProperties}>
                <h3 className="m-0 font-display text-[19px] leading-[1.2] font-[650] tracking-[-0.02em]">{group.name}</h3>
                <p className="m-0 mt-1.5 mb-3 text-[13px] leading-[1.45] text-muted">{group.note}</p>
              </div>
              <ul className="m-0 list-none p-0 max-md:flex max-md:flex-wrap max-md:gap-x-3.5 max-md:gap-y-0.5">
                {group.tools.map((tool, toolIndex) => {
                  const index = GROUP_STARTS[groupIndex] + toolIndex;
                  return (
                    <li key={tool} className="flex items-center gap-2.5 font-mono text-[13px] leading-[1.8] font-medium">
                      <span
                        aria-hidden="true"
                        data-slot={index}
                        style={{'--i': index} as CSSProperties}
                        className={cn('stack-ruler-slot h-3.5 w-px shrink-0', toolIndex === 0 ? 'bg-muted' : 'bg-muted/50')}
                      />
                      <span className="stack-ruler-label" style={{'--i': index} as CSSProperties}>
                        {tool}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
