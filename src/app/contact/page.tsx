import type {Metadata} from 'next';
import {ContactCta} from '@/components/sections/contact-cta';
import {PageShell} from '@/components/site/page-shell';
import {pageMetadata} from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description: "Building something, or hiring? Email me directly, or tell me about it in the form and I'll reply to you myself.",
  path: '/contact',
});

/** The same contact section as the home page, with its heading as the page's h1. */
export default function ContactPage() {
  return (
    <PageShell>
      <ContactCta level={1} />
    </PageShell>
  );
}
