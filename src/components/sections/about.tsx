import {Eyebrow} from '@/components/ui-site/eyebrow';
import {MarkedText} from '@/components/ui-site/marked-text';
import {Section} from '@/components/ui-site/section';
import {getPageCopy} from '@/server/content';

export async function About() {
  const copy = await getPageCopy();
  const facts = [
    {title: copy['about.fact1.title'], body: copy['about.fact1.body']},
    {title: copy['about.fact2.title'], body: copy['about.fact2.body']},
    {title: copy['about.fact3.title'], body: copy['about.fact3.body']},
  ];

  return (
    <Section id="about" innerClassName="grid grid-cols-[minmax(0,4fr)_minmax(0,8fr)] items-start gap-16 max-md:grid-cols-1 max-md:gap-8">
      <div data-reveal className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-photo bg-tint">
        <span className="font-mono text-[14px] text-accent">[YOUR PHOTO]</span>
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-[20px] border border-line bg-white px-[18px] py-4">
          <span className="flex flex-col gap-1">
            <b className="text-[16px]">{copy['about.name']}</b>
            <span className="text-[13px] text-muted">{copy['about.role']}</span>
          </span>
          <span
            aria-hidden="true"
            data-theme="light"
            className="grid size-10 place-items-center rounded-xl bg-lime font-display text-[15px] leading-none font-extrabold"
          >
            cg
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-9 pt-2">
        <Eyebrow>{copy['about.eyebrow']}</Eyebrow>
        <p data-reveal className="m-0 font-display text-[clamp(28px,3.4vw,46px)] leading-[1.12] font-semibold tracking-[-0.03em]">
          <MarkedText text={copy['about.statement']} />
        </p>
        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          {facts.map((fact) => (
            <div key={fact.title} data-reveal className="flex flex-col gap-1.5 border-t-2 border-ink pt-4">
              <b className="font-display text-[24px] tracking-[-0.02em]">{fact.title}</b>
              <span className="text-[15px] leading-normal text-muted">{fact.body}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
