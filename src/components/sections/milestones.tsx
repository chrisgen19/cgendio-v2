import {Eyebrow} from '@/components/ui-site/eyebrow';
import {Mark} from '@/components/ui-site/mark';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';
import {getMilestones} from '@/server/content';

export async function Milestones() {
  const milestones = await getMilestones();
  return (
    <Section id="milestones" innerClassName="flex flex-col gap-12">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div data-reveal className="flex flex-col gap-[18px]">
          <Eyebrow>Achievements &amp; milestones</Eyebrow>
          <SectionHeading>
            Milestones, <Mark>so far.</Mark>
          </SectionHeading>
        </div>
        <p className="m-0 max-w-[380px] text-base leading-[1.55] text-muted">
          The moments that shaped how we build — from WordPress roots to full-stack product work.
        </p>
      </div>
      <div className="grid grid-cols-5 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
        {milestones.map((m) => (
          <div key={m.title} data-reveal className="flex min-h-70 flex-col gap-3.5 rounded-milestone border border-line bg-white p-6">
            <span className="self-start rounded-pill bg-tint px-2.5 py-[7px] font-mono text-[11px] tracking-[0.06em] text-accent">{m.kind}</span>
            <span className="mt-auto font-display text-[52px] leading-[0.95] font-extrabold tracking-[-0.05em]">{m.value}</span>
            <b className="text-[17px] leading-[1.3]">{m.title}</b>
            <span className="text-sm leading-normal text-muted">{m.description}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}
