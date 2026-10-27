import type {CSSProperties} from 'react';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {MarkedText} from '@/components/ui-site/marked-text';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';
import {cn} from '@/lib/cn';
import {parseCountedValue} from '@/lib/milestone-value';
import {getMilestones, getPageCopy} from '@/server/content';
import type {Milestone} from '@/server/content-schema';

// Stacks the final value and its animated layer in one grid cell
const STACK = 'col-start-1 row-start-1';

/**
 * The big display value. Screen readers get the real value; the layers drawn on top are aria-hidden. The ms-* rules
 * in globals.css only animate them under a view timeline with motion allowed, otherwise the final value shows as is.
 */
function BigValue({value}: {value: string}) {
  const counted = parseCountedValue(value);
  return (
    <p
      className="ms-value m-0 pr-[0.05em] font-display leading-[0.8] font-extrabold tracking-[-0.05em] whitespace-nowrap tabular-nums"
      // Code points, so a curly apostrophe counts once; sizes the value to fit its line (globals.css)
      style={{'--ms-chars': [...value].length} as CSSProperties}
    >
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="inline-flex items-baseline">
        {counted ? (
          <>
            {/* The final digits hold the width while the counter runs, so the suffix never moves */}
            <span className="inline-grid">
              <span className={cn('ms-final', STACK)}>{counted.to}</span>
              <span className={cn('ms-tick justify-self-end', STACK)} style={{'--ms-from': counted.from, '--ms-to': counted.to} as CSSProperties} />
            </span>
            {counted.suffix ? <span>{counted.suffix}</span> : null}
          </>
        ) : (
          <span className="inline-grid">
            <span className={cn('ms-word', STACK)}>{value}</span>
            <span className={cn('ms-fill', STACK)}>{value}</span>
          </span>
        )}
      </span>
    </p>
  );
}

/** One full-width line: the value on one side, the kind, title and description on the other. */
function MilestoneLine({milestone, flip}: {milestone: Milestone; flip: boolean}) {
  return (
    <li
      className={cn(
        'ms-row @container flex items-end justify-end gap-12 border-t border-line py-12 last:border-b',
        flip ? 'flex-row' : 'flex-row-reverse',
        'max-md:flex-col-reverse max-md:items-start max-md:gap-6 max-md:py-9',
      )}
    >
      <div className={cn('flex max-w-[360px] flex-col gap-3 pb-[0.15em]', flip && 'items-end text-right max-md:items-start max-md:text-left')}>
        <span className="font-mono text-xs leading-none font-medium tracking-[0.08em] text-muted uppercase">{milestone.kind}</span>
        <h3 className="m-0 font-display text-[26px] leading-[1.1] font-bold tracking-[-0.02em] text-ink max-md:text-[22px]">{milestone.title}</h3>
        <p className="m-0 text-base leading-[1.55] text-muted">{milestone.description}</p>
      </div>
      <BigValue value={milestone.value} />
    </li>
  );
}

/**
 * Milestones as big type: each one is a display line with its value set huge, alternating sides between hairline rules.
 * Numbers count up as their line scrolls into view, scrubbed by scroll position rather than time (CSS view timelines,
 * no JS), and word values like CMS fill in with ink. No pinning: the page scrolls normally.
 */
export async function Milestones() {
  const [milestones, copy] = await Promise.all([getMilestones(), getPageCopy()]);
  return (
    <Section id="milestones" innerClassName="flex flex-col gap-16 max-md:gap-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div data-reveal className="flex flex-col gap-[18px]">
          <Eyebrow>{copy['milestones.eyebrow']}</Eyebrow>
          <SectionHeading>
            <MarkedText text={copy['milestones.heading']} />
          </SectionHeading>
        </div>
        <p className="m-0 max-w-[380px] text-base leading-[1.55] text-muted">{copy['milestones.lede']}</p>
      </div>
      <ul className="m-0 list-none p-0">
        {milestones.map((m, i) => (
          <MilestoneLine key={m.order} milestone={m} flip={i % 2 === 1} />
        ))}
      </ul>
    </Section>
  );
}
