import type {Metadata} from 'next';
import {PageShell} from '@/components/site/page-shell';
import {Button} from '@/components/ui-site/button';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {MarkedText} from '@/components/ui-site/marked-text';
import {Section} from '@/components/ui-site/section';
import {SectionHeading} from '@/components/ui-site/section-heading';

export const metadata: Metadata = {title: 'Page not found'};

/** Unknown URLs, and drafts or unknown slugs that call notFound(). */
export default function NotFound() {
  return (
    <PageShell>
      <Section innerClassName="flex min-h-[50svh] flex-col justify-center gap-[18px]">
        <Eyebrow>Error 404</Eyebrow>
        <SectionHeading level={1}>
          <MarkedText text="This page doesn't [[exist.]]" />
        </SectionHeading>
        <p className="m-0 max-w-[560px] text-lg leading-[1.55] text-muted max-md:text-base">The link may be old or mistyped.</p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Button href="/">Back to home</Button>
          <Button href="/#work" variant="secondary">
            See our work
          </Button>
        </div>
      </Section>
    </PageShell>
  );
}
