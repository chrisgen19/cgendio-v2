import type {ReactNode} from 'react';
import {Hero} from '@/components/sections/hero';
import {SiteFooter} from '@/components/site/site-footer';
import {SiteHeader} from '@/components/site/site-header';
import {Eyebrow} from '@/components/ui-site/eyebrow';
import {Mark} from '@/components/ui-site/mark';
import {SectionHeading} from '@/components/ui-site/section-heading';
import {cn} from '@/lib/cn';

type PlaceholderSectionProps = {
  id: string;
  eyebrow: string;
  heading?: ReactNode;
  white?: boolean;
};

// Temporary stand-in until Phase 3 builds the real sections
function PlaceholderSection({id, eyebrow, heading, white = false}: PlaceholderSectionProps) {
  return (
    <section id={id} className={cn('px-14 py-28 max-md:px-5 max-md:py-18', white && 'border-y border-line bg-white')}>
      <div className="mx-auto flex min-h-80 max-w-site flex-col gap-5">
        <Eyebrow>{eyebrow}</Eyebrow>
        {heading && <SectionHeading>{heading}</SectionHeading>}
        <p className="m-0 font-mono text-[13px] text-muted">[Section arrives in Phase 3]</p>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <h1 className="sr-only">Cgdiomampo.dev — web design and development studio by Christian</h1>
      <SiteHeader overlay />
      <main>
        <Hero />
        <PlaceholderSection id="about" eyebrow="About" />
        <PlaceholderSection
          id="work"
          eyebrow="Selected work"
          white
          heading={
            <>
              Things we&apos;ve <Mark>shipped.</Mark>
            </>
          }
        />
        <PlaceholderSection
          id="milestones"
          eyebrow="Achievements & milestones"
          heading={
            <>
              Milestones, <Mark>so far.</Mark>
            </>
          }
        />
        <PlaceholderSection
          id="timeline"
          eyebrow="Work timeline"
          white
          heading={
            <>
              The road <Mark>here.</Mark>
            </>
          }
        />
        <PlaceholderSection
          id="blog"
          eyebrow="Dev notes & tech news"
          heading={
            <>
              From the <Mark>blog.</Mark>
            </>
          }
        />
        <PlaceholderSection id="contact" eyebrow="Open to projects & roles" heading="Have a project — or a role — in mind?" />
      </main>
      <SiteFooter />
    </>
  );
}
