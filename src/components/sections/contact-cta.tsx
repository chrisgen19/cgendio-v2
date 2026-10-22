import {Button} from '@/components/ui-site/button';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {MarkedText} from '@/components/ui-site/marked-text';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';
import {getPageCopy, getSiteSettings} from '@/server/content';

export async function ContactCta() {
  const [copy, settings] = await Promise.all([getPageCopy(), getSiteSettings()]);

  return (
    <Section id="contact" padding="cta" innerClassName="relative flex flex-col gap-7 overflow-hidden rounded-cta bg-lime p-[clamp(36px,6vw,80px)]">
      <div aria-hidden="true" className="absolute -top-30 -right-30 size-105 rounded-full border-2 border-ink opacity-12" />
      <div aria-hidden="true" className="absolute -top-10 -right-10 size-65 rounded-full border-2 border-ink opacity-12" />
      <Eyebrow tone="ink">{copy['contact.eyebrow']}</Eyebrow>
      <SectionHeading size="cta" className="max-w-[1000px]">
        <MarkedText text={copy['contact.heading']} />
      </SectionHeading>
      <p className="m-0 max-w-[560px] text-lg leading-[1.55] text-ink-soft">{copy['contact.lede']}</p>
      {/* The contact form arrives in Phase 6, so "Start a project" stays on #contact; the CV links to the uploaded file once there is one */}
      <div className="flex flex-wrap gap-3">
        <Button href="#contact">
          {copy['contact.primaryLabel']}
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
        <Button href={settings.cvUrl ?? '#contact'} variant="outline">
          {copy['contact.cvLabel']}
        </Button>
      </div>
      <span className="font-mono text-[13px] text-ink-soft">
        {settings.contactEmail} · {copy['contact.location']}
      </span>
    </Section>
  );
}
