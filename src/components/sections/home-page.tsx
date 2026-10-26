import {SiteFooter} from '@/components/site/site-footer';
import {SiteHeader} from '@/components/site/site-header';
import {SkipLink} from '@/components/site/skip-link';
import {ScrollReveal} from '@/components/ui-site/scroll-reveal';
import {About} from './about';
import {BlogTeaser} from './blog-teaser';
import {ContactCta} from './contact-cta';
import {Hero} from './hero';
import {Milestones} from './milestones';
import {StackStrip} from './stack-strip';
import {Timeline} from './timeline';
import {WhatWeBuild} from './what-we-build';
import {Work} from './work';

/** The whole home page. */
export function HomePage() {
  return (
    <>
      <SkipLink />
      <SiteHeader overlay />
      <main id="main" tabIndex={-1} className="focus-visible:outline-none">
        {/* Inside <main> so every piece of content sits in a landmark */}
        <h1 className="sr-only">Cgdiomampo.dev — web design and development studio by Christian</h1>
        <Hero />
        <StackStrip />
        <About />
        <WhatWeBuild />
        <Work />
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
