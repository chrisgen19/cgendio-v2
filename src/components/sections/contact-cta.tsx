import {Button} from '@/components/ui-site/button';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {MarkedText} from '@/components/ui-site/marked-text';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';
import {isEmail} from '@/lib/email';
import {getPageCopy, getSiteSettings} from '@/server/content';
import {ContactTicker} from './contact/contact-ticker';

/**
 * The closing call to action. The email address is the main action: it runs on an ink ticker band across the lime
 * panel (ContactTicker), with the contact form as the secondary path below. The section clips the band's full bleed.
 */
export async function ContactCta() {
  const [copy, settings] = await Promise.all([getPageCopy(), getSiteSettings()]);

  return (
    <Section
      id="contact"
      padding="cta"
      innerTheme="light"
      className="overflow-x-clip"
      innerClassName="relative flex flex-col gap-7 rounded-cta bg-lime p-[clamp(36px,6vw,80px)]"
    >
      <Eyebrow tone="ink">{copy['contact.eyebrow']}</Eyebrow>
      <SectionHeading size="cta" className="max-w-[1000px]">
        <MarkedText text={copy['contact.heading']} />
      </SectionHeading>
      <p className="m-0 max-w-[560px] text-lg leading-[1.55] text-ink-soft">{copy['contact.lede']}</p>
      {/* The [YOUR EMAIL] placeholder shows as plain text on the band, with no link and no copy button */}
      <ContactTicker address={settings.contactEmail} live={isEmail(settings.contactEmail)} />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <Button href="/contact" variant="outline">
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
        {/* Only once a CV is uploaded in admin Settings */}
        {settings.cvUrl ? (
          <Button href={settings.cvUrl} variant="outline">
            {copy['contact.cvLabel']}
          </Button>
        ) : null}
        <span className="font-mono text-[13px] text-ink-soft">{copy['contact.location']}</span>
      </div>
    </Section>
  );
}
