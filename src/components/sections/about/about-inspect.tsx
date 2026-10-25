import type {CSSProperties, ReactNode} from 'react';
import {Button} from '@/components/ui-site/button';
import {cn} from '@/lib/cn';
import type {AboutCopy} from './copy';

type AboutInspectProps = {
  copy: AboutCopy;
  name: string;
  openToProjects: boolean;
  cvUrl: string | null;
};

type RowProps = {
  label: string;
  /** Rows with a pin on the canvas light up with it */
  pinKey?: string;
  index: number;
  children: ReactNode;
};

/** One property row. The value settles in during the entry (`about-settle`, staggered by --i). */
function Row({label, pinKey, index, children}: RowProps) {
  return (
    <div
      data-fact={pinKey}
      style={{'--i': index} as CSSProperties}
      className="-mx-3 grid grid-cols-[104px_minmax(0,1fr)] gap-4 rounded-xl px-3 py-3 transition-colors data-on:bg-tint max-md:grid-cols-[96px_minmax(0,1fr)] max-md:gap-3 motion-reduce:transition-none"
    >
      <dt className="pt-[3px] font-mono text-xs leading-none font-medium tracking-[0.06em] text-muted uppercase">{label}</dt>
      <dd className="about-settle m-0 flex flex-col gap-1">{children}</dd>
    </div>
  );
}

/**
 * The inspect panel: the frame's facts as real content (a description list in reading order), plus the way on. Rows
 * with a comment pin on the canvas light up with it when either is hovered.
 */
export function AboutInspect({copy, name, openToProjects, cvUrl}: AboutInspectProps) {
  const rows = copy.rows;

  return (
    <div className="flex flex-col bg-white">
      <h3 className="m-0 border-b border-line px-7 py-5 font-display text-[22px] leading-none font-bold tracking-[-0.02em] max-md:px-5">{name}</h3>
      <dl className="m-0 flex flex-1 flex-col px-7 py-3 max-md:px-5">
        {rows.map((row, i) => (
          <Row key={row.label} label={row.label} pinKey={row.pinKey} index={i}>
            <span className="text-[15px] leading-snug font-semibold text-ink">{row.value}</span>
            <span className="text-sm leading-snug text-muted">{row.note}</span>
          </Row>
        ))}
        <Row label={copy.statusLabel} index={rows.length}>
          <span className="flex items-start gap-2.5 text-[15px] leading-snug font-semibold text-ink">
            <span
              aria-hidden="true"
              className={cn('mt-[7px] size-2 shrink-0 rounded-full', openToProjects ? 'bg-status ring-4 ring-status/15' : 'bg-dot-placeholder')}
            />
            {openToProjects ? copy.statusOpen : copy.statusClosed}
          </span>
        </Row>
      </dl>
      <div className="flex flex-wrap gap-2.5 border-t border-line px-7 py-5 max-md:px-5">
        <Button href="/contact" size="sm">
          {copy.contactLabel}
        </Button>
        {/* Only once a CV is uploaded in admin Settings, like the Timeline and Contact buttons */}
        {cvUrl ? (
          <Button href={cvUrl} variant="secondary" size="sm">
            {copy.cvLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
