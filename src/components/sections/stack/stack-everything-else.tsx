import {Eyebrow} from '@/components/ui-site/eyebrow';
import {STACK_EXTRAS} from '@/lib/stack-groups';

const TOOL_COUNT = STACK_EXTRAS.reduce((total, group) => total + group.tools.length, 0);

/** The rest of the toolbox under the plates: the tools that have no layer of their own, in compact columns. */
export function StackEverythingElse() {
  return (
    <div data-reveal className="border-t border-line pt-7">
      <div className="flex items-baseline justify-between gap-4">
        <Eyebrow>Everything else</Eyebrow>
        <p className="m-0 font-mono text-[13px] leading-none text-muted">{TOOL_COUNT} tools</p>
      </div>
      <div className="mt-8 columns-4 gap-10 max-lg:columns-2 max-md:columns-1">
        {STACK_EXTRAS.map((group) => (
          <div key={group.name} className="break-inside-avoid pb-9 max-md:pb-7">
            <h3 className="m-0 font-display text-[19px] leading-[1.2] font-[650] tracking-[-0.02em]">{group.name}</h3>
            <p className="m-0 mt-1.5 mb-3 text-[13px] leading-[1.45] text-muted">{group.note}</p>
            {/* One tool per line in a column; on phones they run together so the list stays short */}
            <ul className="m-0 list-none p-0 max-md:flex max-md:flex-wrap max-md:gap-x-3.5 max-md:gap-y-0.5">
              {group.tools.map((tool) => (
                <li key={tool} className="font-mono text-[13px] leading-[1.8] font-medium">
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
