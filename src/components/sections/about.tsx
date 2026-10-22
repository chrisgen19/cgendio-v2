import {Eyebrow} from '@/components/ui-site/eyebrow';
import {Mark} from '@/components/ui-site/mark';
import {Section} from '@/components/ui-site/section';

const FACTS = [
  {title: 'Full-stack', body: 'React, Next.js, TypeScript, PHP and WordPress — front to back.'},
  {title: '20+ sites', body: 'Built and looked after for Access Group Australia.'},
  {title: 'UTC+8', body: 'Working hours that overlap Australia and APAC.'},
];

export function About() {
  return (
    <Section id="about" innerClassName="grid grid-cols-[minmax(0,4fr)_minmax(0,8fr)] items-start gap-16 max-md:grid-cols-1 max-md:gap-8">
      <div data-reveal className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-photo bg-tint">
        <span className="font-mono text-sm text-accent">[YOUR PHOTO]</span>
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-[20px] border border-line bg-white px-[18px] py-4">
          <span className="flex flex-col gap-1">
            <b className="text-base">Christian Diomampo</b>
            <span className="text-[13px] text-muted">Full-stack developer · Taguig, PH</span>
          </span>
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-xl bg-lime font-display text-[15px] leading-none font-extrabold"
          >
            cg
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-9 pt-2">
        <Eyebrow>About</Eyebrow>
        <p data-reveal className="m-0 font-display text-[clamp(28px,3.4vw,46px)] leading-[1.12] font-semibold tracking-[-0.03em]">
          Hi, I&apos;m Christian — a full-stack developer in Taguig, Philippines. Through Cgdiomampo.dev, we take brands from research and Figma to{' '}
          <Mark>fast WordPress and Next.js sites</Mark>, then keep them running.
        </p>
        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          {FACTS.map((fact) => (
            <div key={fact.title} data-reveal className="flex flex-col gap-1.5 border-t-2 border-ink pt-4">
              <b className="font-display text-2xl tracking-[-0.02em]">{fact.title}</b>
              <span className="text-[15px] leading-normal text-muted">{fact.body}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
