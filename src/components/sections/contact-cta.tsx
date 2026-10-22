import {Button} from '@/components/ui-site/button';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';

export function ContactCta() {
  return (
    <Section id="contact" padding="cta" innerClassName="relative flex flex-col gap-7 overflow-hidden rounded-cta bg-lime p-[clamp(36px,6vw,80px)]">
      <div aria-hidden="true" className="absolute -top-30 -right-30 size-105 rounded-full border-2 border-ink opacity-12" />
      <div aria-hidden="true" className="absolute -top-10 -right-10 size-65 rounded-full border-2 border-ink opacity-12" />
      <Eyebrow tone="ink">Open to projects &amp; roles</Eyebrow>
      <SectionHeading size="cta" className="max-w-[1000px]">
        Have a project — or a role — in mind?
      </SectionHeading>
      <p className="m-0 max-w-[560px] text-lg leading-[1.55] text-ink-soft">
        Agencies, recruiters and founders: tell us what you&apos;re building and we&apos;ll come back with next steps.
      </p>
      {/* The contact form arrives in Phase 6 and the CV file is still a placeholder; both stay on #contact, as in the canvas */}
      <div className="flex flex-wrap gap-3">
        <Button href="#contact">
          Start a project
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Button>
        <Button href="#contact" variant="outline">
          Download CV
        </Button>
      </div>
      <span className="font-mono text-[13px] text-ink-soft">[YOUR EMAIL] · Taguig, Philippines · Asia/Manila (UTC+8)</span>
    </Section>
  );
}
