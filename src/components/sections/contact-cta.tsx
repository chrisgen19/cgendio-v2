import {ContactForm} from '@/components/contact/contact-form';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {MarkedText} from '@/components/ui-site/marked-text';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';
import {getPageCopy, getSiteSettings} from '@/server/content';
import {ContactCard} from './contact/contact-card';
import {ContactLinks} from './contact/contact-links';

type ContactCtaProps = {
  /** 2 on the home page; 1 on /contact, where this section is the whole page */
  level?: 1 | 2;
};

/**
 * The contact section: a dot-grid stage with the heading, lede and my business card (email, location, status) on the
 * left, and the contact form on a white sheet on the right, one question at a time. Under 1080px the card sits on top.
 */
export async function ContactCta({level = 2}: ContactCtaProps) {
  const [copy, settings] = await Promise.all([getPageCopy(), getSiteSettings()]);

  return (
    <Section
      id="contact"
      tone="white"
      className="bg-[radial-gradient(circle,var(--color-dot)_1px,transparent_1.3px)] bg-size-[26px_26px]"
      innerClassName="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start gap-x-20 gap-y-12 max-lg:grid-cols-1"
    >
      <div className="flex flex-col gap-12 max-md:gap-10 lg:sticky lg:top-28">
        <div className="flex flex-col gap-6">
          <Eyebrow>{copy['contact.eyebrow']}</Eyebrow>
          <SectionHeading id="contact-heading" level={level}>
            <MarkedText text={copy['contact.heading']} />
          </SectionHeading>
          <p className="m-0 max-w-[460px] text-lg leading-[1.55] text-muted max-md:text-base">{copy['contact.lede']}</p>
        </div>
        <div className="flex max-w-[500px] flex-col gap-6">
          <ContactCard copy={copy} settings={settings} />
          <ContactLinks copy={copy} settings={settings} />
        </div>
      </div>
      <div className="rounded-panel border border-line bg-white p-[clamp(24px,4vw,48px)] shadow-(--shadow-card)">
        <ContactForm headingLevel={level === 1 ? 2 : 3} />
      </div>
    </Section>
  );
}
