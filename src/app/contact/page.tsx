import type {Metadata} from 'next';
import {ContactForm} from '@/components/contact/contact-form';
import {PageShell} from '@/components/site/page-shell';
import {Button} from '@/components/ui-site/button';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {MarkedText} from '@/components/ui-site/marked-text';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';
import {isEmail} from '@/lib/email';
import {pageMetadata} from '@/lib/metadata';
import {getPageCopy, getSiteSettings} from '@/server/content';

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description: "Agencies, recruiters and founders: tell us what you're building and we'll come back with next steps.",
  path: '/contact',
});

/** The contact form, with the same heading and copy as the home page's contact panel. */
export default async function ContactPage() {
  const [copy, settings] = await Promise.all([getPageCopy(), getSiteSettings()]);
  return (
    <PageShell>
      <Section padding="cta" innerClassName="flex flex-col gap-[18px] pt-10 max-md:pt-4">
        <Eyebrow>{copy['contact.eyebrow']}</Eyebrow>
        <SectionHeading level={1} className="max-w-[1000px]">
          <MarkedText text={copy['contact.heading']} />
        </SectionHeading>
        <p className="m-0 max-w-[560px] text-lg leading-[1.55] text-muted max-md:text-base">{copy['contact.lede']}</p>
      </Section>
      <Section tone="white" innerClassName="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-start gap-16 max-lg:grid-cols-1 max-lg:gap-10">
        <div className="flex flex-col gap-5">
          <p className="m-0 flex flex-col gap-1.5 font-mono text-[13px] leading-[1.6] text-muted">
            {isEmail(settings.contactEmail) ? (
              <a href={`mailto:${settings.contactEmail}`} className="inline-flex min-h-11 items-center self-start">
                {settings.contactEmail}
              </a>
            ) : (
              <span>{settings.contactEmail}</span>
            )}
            <span>{copy['contact.location']}</span>
          </p>
          {settings.cvUrl ? (
            <Button href={settings.cvUrl} variant="secondary" size="sm" className="self-start">
              {copy['contact.cvLabel']}
            </Button>
          ) : null}
        </div>
        <ContactForm />
      </Section>
    </PageShell>
  );
}
