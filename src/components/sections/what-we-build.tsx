import {Eyebrow} from '@/components/ui-site/eyebrow';
import {MarkedText} from '@/components/ui-site/marked-text';
import {getPageCopy, getSiteSettings} from '@/server/content';
import {BuildSplit} from './what-we-build/build-split';
import {buildCopy} from './what-we-build/copy';

/**
 * "Two Halves", right after the About: a full-width ink stage (a deep indigo one in dark mode) with Christian's portrait
 * split down the middle between the two kinds of site we build, WordPress and Next.js, each half through its own print
 * screen. Pointing at, focusing or pressing a side slides the seam its way (BuildSplit); the copy for both sides is
 * always on the page.
 */
export async function WhatWeBuild() {
  const [copy, settings] = await Promise.all([getPageCopy(), getSiteSettings()]);
  const r2 = process.env.R2_PUBLIC_URL?.replace(/\/+$/, '');
  // Uploaded in admin Settings; R2 uploads go through the image optimizer, like CoverImage
  const photo = settings.photoUrl
    ? {src: settings.photoUrl, alt: `Photo of ${copy['about.name']}`, unoptimized: !r2 || !settings.photoUrl.startsWith(`${r2}/`)}
    : null;
  const build = buildCopy(copy);

  return (
    <section id="what-we-build" aria-labelledby="what-we-build-heading" className="bg-ground p-3 max-md:p-2">
      <div data-ink-stage className="rounded-cta bg-ink-stage px-14 py-24 max-md:rounded-panel max-md:px-5 max-md:py-14">
        <div className="mx-auto flex max-w-site flex-col gap-20 max-md:gap-12">
          <div className="flex flex-col gap-[18px]">
            <Eyebrow>{build.eyebrow}</Eyebrow>
            <h2 id="what-we-build-heading" className="m-0 font-display text-[clamp(34px,3.6vw,52px)] leading-[1.02] font-bold tracking-[-0.035em]">
              <MarkedText text={build.heading} />
            </h2>
          </div>
          <BuildSplit photo={photo} sides={build.sides} />
        </div>
      </div>
    </section>
  );
}
