import {cacheLife} from 'next/cache';
import type {CSSProperties} from 'react';
import {Button} from '@/components/ui-site/button';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {MarkedText} from '@/components/ui-site/marked-text';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';
import {cn} from '@/lib/cn';
import {getPageCopy, getSiteSettings, getTimeline} from '@/server/content';
import {type ChartRole, TimelineV2Chart} from './timeline-v2-chart';
import {TimelineV2Grow} from './timeline-v2-grow';
import {type AxisTick, buildSpanChart, monthOf} from './timeline-v2-spans';

const SECTION_ID = 'timeline';
const HEADING_ID = 'timeline-v2-heading';

/** The current month, captured into the cache (and so the static shell) and refreshed daily. Open-ended roles run to it. */
const getNowMonth = async (): Promise<number> => {
  'use cache';
  cacheLife('days');
  return monthOf(new Date());
};

/**
 * Work timeline, variant 2: a career span chart. Each role is a bar on a year axis from the first January to now, so
 * the long early stretch, the short 2025 role and the gap before it read at a glance. Desktop is an interactive chart
 * (tabs with a detail card); under 860px it becomes a plain list where each row carries a mini bar on the same scale.
 */
export async function TimelineV2() {
  const [entries, copy, settings, nowMonth] = await Promise.all([getTimeline(), getPageCopy(), getSiteSettings(), getNowMonth()]);
  const {placements, ticks} = buildSpanChart(
    entries.map((e) => e.when),
    nowMonth,
  );
  const roles: ChartRole[] = entries.map((e, i) => ({
    key: e.order,
    when: e.when,
    role: e.role,
    org: e.org,
    description: e.description,
    isCurrent: e.isCurrent,
    bar: placements[i] ?? null,
  }));

  return (
    <Section id={SECTION_ID} tone="white" innerClassName="flex flex-col gap-14 max-md:gap-8">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
        <div data-reveal className="flex flex-col gap-[18px]">
          <Eyebrow>{copy['timeline.eyebrow']}</Eyebrow>
          <SectionHeading id={HEADING_ID}>
            <MarkedText text={copy['timeline.heading']} />
          </SectionHeading>
        </div>
        <div data-reveal className="flex max-w-[380px] flex-col items-start gap-4">
          <p className="m-0 text-base leading-[1.55] text-muted">{copy['timeline.lede']}</p>
          {/* Only once a CV is uploaded in admin Settings */}
          {settings.cvUrl ? (
            <Button href={settings.cvUrl} variant="secondary" size="sm">
              {copy['timeline.cvLabel']}
            </Button>
          ) : null}
        </div>
      </div>
      <div className="max-md:hidden">
        <TimelineV2Chart roles={roles} ticks={ticks} labelledBy={HEADING_ID} />
      </div>
      <MobileSpans roles={roles} ticks={ticks} />
      <TimelineV2Grow sectionId={SECTION_ID} />
    </Section>
  );
}

/** Under 860px: every role in full, each with a 6px track spanning the same first-January-to-now scale as the chart. */
function MobileSpans({roles, ticks}: {roles: ChartRole[]; ticks: AxisTick[]}) {
  return (
    <div className="hidden max-md:block">
      <MobileScale ticks={ticks} />
      <ol className="m-0 flex list-none flex-col p-0">
        {roles.map((role) => (
          <li key={role.key} data-tl2-grow="" className="flex flex-col gap-2 border-t border-line py-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-[13px] text-muted">{role.when}</span>
              {role.isCurrent ? (
                <span data-theme="light" className="rounded-pill bg-lime px-[9px] py-1.5 font-mono text-[11px] leading-none text-on-lime">
                  NOW
                </span>
              ) : null}
            </div>
            <h3 className="m-0 font-display text-[24px] leading-[1.1] font-bold tracking-[-0.03em]">{role.role}</h3>
            <span className="text-[15px] font-semibold text-accent">{role.org}</span>
            <span aria-hidden="true" className="relative my-2 block h-1.5 rounded-pill bg-ground shadow-[inset_0_0_0_1px_var(--color-line)]">
              {role.bar ? (
                <span
                  style={{'--s': role.bar.s, '--w': role.bar.w} as CSSProperties}
                  className={cn(
                    'tl2-bar tl2-bar-mini absolute inset-y-0 left-[calc(var(--s)*100%)] w-[max(6px,calc(var(--w)*100%))] rounded-pill',
                    role.isCurrent ? 'bg-accent' : 'bg-ink',
                  )}
                />
              ) : null}
            </span>
            <p className="m-0 text-[15px] leading-[1.6] text-muted">{role.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** The scale the mini bars share, printed once above the list: the labelled years that fit at phone width, and NOW. Decorative. */
function MobileScale({ticks}: {ticks: AxisTick[]}) {
  return (
    <div aria-hidden="true" className="relative mb-3 h-4">
      {ticks
        .filter((t) => t.labelled && !t.nearEnd && (t.frac === 0 || t.frac > 0.2))
        .map((t) => (
          <span
            key={t.year}
            style={{left: `${t.frac * 100}%`}}
            className={cn('absolute top-0 font-mono text-[11px] leading-none text-muted', t.frac > 0 && '-translate-x-1/2')}
          >
            {t.year}
          </span>
        ))}
      <span className="absolute top-0 right-0 font-mono text-[11px] leading-none font-medium text-accent">NOW</span>
    </div>
  );
}
