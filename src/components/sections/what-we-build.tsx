import {Eyebrow} from '@/components/ui-site/eyebrow';
import {MarkedText} from '@/components/ui-site/marked-text';
import {SectionHeading} from '@/components/ui-site/section-heading';
import {getPageCopy} from '@/server/content';
import {BuildSplit} from './what-we-build/build-split';
import {buildCopy} from './what-we-build/copy';

/**
 * "Two Halves", right after the About: a full-width ink stage (a deep indigo one in dark mode) with the WordPress and
 * Next.js logos split down the middle, each half through its own print screen. Pointing at, focusing or pressing a side
 * slides the seam across until its whole logo shows (BuildSplit); the copy for both sides is always on the page.
 */
export async function WhatWeBuild() {
  const build = buildCopy(await getPageCopy());

  return (
    <section id="what-we-build" aria-labelledby="what-we-build-heading" className="bg-ground p-3 max-md:p-2">
      <div data-ink-stage className="rounded-cta bg-ink-stage py-24 pl-(--pad-l) pr-(--pad-r) max-md:rounded-panel max-md:py-14">
        <div className="mx-auto flex max-w-site flex-col gap-20 max-md:gap-12">
          <div className="flex flex-col gap-[18px]">
            <Eyebrow>{build.eyebrow}</Eyebrow>
            <SectionHeading id="what-we-build-heading">
              <MarkedText text={build.heading} />
            </SectionHeading>
          </div>
          <BuildSplit sides={build.sides} />
        </div>
      </div>
    </section>
  );
}
