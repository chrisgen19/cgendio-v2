import {SiteFooter} from '@/components/site/site-footer';
import {SiteHeader} from '@/components/site/site-header';
import {ScrollReveal} from '@/components/ui-site/scroll-reveal';
import type {WorkFilter} from '@/lib/work-filter';
import {About} from './about';
import {BlogTeaser} from './blog-teaser';
import {ContactCta} from './contact-cta';
import {Hero} from './hero';
import {Milestones} from './milestones';
import {StackStrip} from './stack-strip';
import {Timeline} from './timeline';
import {Work} from './work';

type HomePageProps = {
  /** Which Work filter is active. `/` renders `all`; the rewritten `/?filter=…` variants render the others. */
  filter: WorkFilter;
};

/** The whole home page, shared by `/` and its prerendered filter variants. */
export function HomePage({filter}: HomePageProps) {
  return (
    <>
      <h1 className="sr-only">Cgdiomampo.dev — web design and development studio by Christian</h1>
      <SiteHeader overlay />
      <main>
        <Hero />
        <StackStrip />
        <About />
        <Work filter={filter} />
        <Milestones />
        <Timeline />
        <BlogTeaser />
        <ContactCta />
      </main>
      <SiteFooter />
      <ScrollReveal />
    </>
  );
}
