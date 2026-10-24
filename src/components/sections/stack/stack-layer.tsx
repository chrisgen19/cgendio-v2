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

/** One layer of the stack: the isometric plate and its flat label on desktop, a full-width plate card on phones. */
export function StackLayer({group, index}: StackLayerProps) {
  const base = index === 0;
  const quiet = base ? 'text-muted max-md:text-white/70' : 'text-muted';

  return (
    <li
      style={{'--layer': index} as CSSProperties}
      className="stack-layer relative grid min-h-24 grid-cols-[440px_minmax(0,1fr)] items-center max-lg:grid-cols-[340px_minmax(0,1fr)] max-md:block max-md:min-h-0"
    >
      <StackPlate tools={group.tools} ink={base} />
      <div
        className={cn(
          'flex flex-col gap-3.5 max-md:gap-4 max-md:rounded-card max-md:border max-md:p-5',
          base
            ? 'max-md:border-ink max-md:bg-ink max-md:text-white max-md:shadow-[0_6px_0_var(--color-ink-soft)]'
            : 'max-md:border-line max-md:bg-white max-md:shadow-[0_6px_0_var(--color-line)]',
        )}
      >
        <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5">
          <span className={cn('font-mono text-xs leading-none font-medium tracking-[0.08em] uppercase', quiet)}>Layer {index + 1}</span>
          <h3 className="m-0 font-display text-[28px] leading-none font-bold tracking-[-0.03em] max-md:basis-full max-md:text-[26px]">
            {group.name}
          </h3>
          {group.role && <span className={cn('text-[15px] leading-none', quiet)}>{group.role}</span>}
        </div>
        <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-2.5 p-0">
          {group.tools.map((tool) => (
            <li key={tool} className="inline-flex items-center gap-2 font-mono text-[13px] leading-none font-medium">
              <StackLogo name={tool} className="size-4" />
              {tool}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
