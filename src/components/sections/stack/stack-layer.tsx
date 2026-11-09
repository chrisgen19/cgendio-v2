import type {CSSProperties} from 'react';
import {cn} from '@/lib/cn';
import type {StackGroup} from '@/lib/stack-groups';
import {StackLogo} from './stack-logo';
import {StackPlate} from './stack-plate';

type StackLayerProps = {
  group: StackGroup;
  /** 0 is the bottom layer; it staggers the assembly so the stack builds from the bottom up. */
  index: number;
};

/**
 * One layer of the stack: the isometric plate and its flat label on desktop, a node on the elevation rail on phones.
 *
 * The phone layout (under 860px) hangs off the rail in `StackStrip`: a numbered node in the rail's gutter, the layer
 * name in display type, and the tools as chips. The rail carries the bottom-up direction, so the layer needs no card
 * of its own and every row keeps the same rhythm. `Layer N` stays in the accessibility tree there (`sr-only`), since
 * the node that replaces it visually is decorative.
 */
export function StackLayer({group, index}: StackLayerProps) {
  const base = index === 0;

  return (
    <li
      style={{'--layer': index} as CSSProperties}
      className="stack-layer relative grid min-h-24 grid-cols-[440px_minmax(0,1fr)] items-center max-lg:grid-cols-[340px_minmax(0,1fr)] max-md:block max-md:min-h-0"
    >
      <StackPlate tools={group.tools} ink={base} />
      {/* The rail's node: the layer's number in the gutter, ink-filled on the foundation layer */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-0 -left-[52px] inline-grid size-[35px] place-items-center rounded-[11px] border font-mono text-[11px] leading-none font-medium tabular-nums md:hidden',
          base ? 'border-ink bg-ink text-white' : 'border-line bg-white text-muted',
        )}
      >
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="flex flex-col gap-3.5 md:py-3 max-md:gap-3">
        {/* The layer is a quiet label on desktop; on phones it is the row's heading and the tools become chips */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5 font-mono text-xs leading-none font-medium tracking-[0.08em] text-muted uppercase max-md:flex-col max-md:items-start max-md:gap-1.5">
          <span className="max-md:sr-only">Layer {index + 1}</span>
          <h3 className="m-0 text-[length:inherit] leading-none font-medium tracking-[inherit] max-md:font-display max-md:text-[20px] max-md:font-bold max-md:tracking-[-0.03em] max-md:text-ink max-md:normal-case">
            {group.name}
          </h3>
          {group.role && <span className="font-body text-[13px] tracking-normal normal-case">{group.role}</span>}
        </div>
        <ul className="m-0 flex list-none flex-wrap gap-x-7 gap-y-3 p-0 max-md:gap-2">
          {group.tools.map((tool) => (
            <li
              key={tool}
              className={cn(
                'inline-flex items-center gap-2.5 font-display text-[clamp(22px,2vw,28px)] leading-none font-bold tracking-[-0.03em]',
                'max-md:gap-2 max-md:rounded-pill max-md:border max-md:px-3 max-md:py-2 max-md:font-mono max-md:text-[13px] max-md:font-medium max-md:tracking-normal',
                base ? 'max-md:border-ink max-md:bg-ink max-md:text-white' : 'max-md:border-line max-md:bg-white',
              )}
            >
              <StackLogo name={tool} className="size-6 shrink-0 max-md:size-4" />
              {tool}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
