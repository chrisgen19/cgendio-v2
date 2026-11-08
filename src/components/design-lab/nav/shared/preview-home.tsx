import {About} from '@/components/sections/about';
import {BlogTeaser} from '@/components/sections/blog-teaser';
import {ContactCta} from '@/components/sections/contact-cta';
import {Hero} from '@/components/sections/hero';
import {Milestones} from '@/components/sections/milestones';
import {StackStrip} from '@/components/sections/stack-strip';
import {Timeline} from '@/components/sections/timeline';
import {WhatWeBuild} from '@/components/sections/what-we-build';
import {Work} from '@/components/sections/work';
import {ScrollReveal} from '@/components/ui-site/scroll-reveal';
import {HOME_TITLE} from '@/lib/metadata';

/**
 * The real home page under a lab header: the same sections in the same order, so each direction is judged against
 * the content it will actually sit on rather than against filler.
 *
 * The marker after the hero is what `useHeaderState` watches to decide the header has left the film.
 */
export function PreviewHome() {
  return (
    <>
      <main id="main" tabIndex={-1} className="focus-visible:outline-none">
        <h1 className="sr-only">{HOME_TITLE}</h1>
        <Hero />
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
      <ScrollReveal />
    </>
  );
}
