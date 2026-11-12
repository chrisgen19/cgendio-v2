import {GoogleAnalytics} from '@/components/site/google-analytics';
import {MicrosoftClarity} from '@/components/site/microsoft-clarity';
import {SiteFooter} from '@/components/site/site-footer';
import {SiteHeader} from '@/components/site/site-header';
import {SkipLink} from '@/components/site/skip-link';
import {ScrollReveal} from '@/components/ui-site/scroll-reveal';
import {HOME_TITLE} from '@/lib/metadata';
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
    // One root element rather than a fragment, for the reason spelled out in page-shell.tsx
    <div>
      <SkipLink />
      <GoogleAnalytics />
      <MicrosoftClarity />
      <SiteHeader overlay />
      <main id="main" tabIndex={-1} className="scroll-mt-[calc(var(--header-h)+1rem)] focus-visible:outline-none">
        {/* Inside <main> so every piece of content sits in a landmark */}
        <h1 className="sr-only">{HOME_TITLE}</h1>
        <Hero />
        {/* The hero's bottom edge: what the header watches to decide the film has ended and the rail should fill in */}
        <div data-nav-sentinel aria-hidden="true" className="-mt-px h-px" />
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
    </div>
  );
}
