import {SiteHeader} from '@/components/site/site-header';
import {HeroStage} from './hero-stage';
import {HeroStaticFrame} from './hero-static-frame';

/**
 * Above-the-fold hero: the Remotion film (lazy, client-only) under a server-rendered first frame and the site header.
 * The header lives here rather than in HeroPlayer's `header` slot so it is server-rendered with the page.
 */
export function Hero() {
  return (
    <div
      id="top"
      className="@container relative h-[min(100svh,980px)] min-h-[640px] bg-white max-md:h-svh max-md:min-h-[600px] portrait:h-svh portrait:min-h-[600px]"
    >
      {/* First in the DOM so the main nav comes before the film's controls in the tab order */}
      <SiteHeader overlay />
      <HeroStage worksHref="#work">
        <HeroStaticFrame />
      </HeroStage>
    </div>
  );
}
