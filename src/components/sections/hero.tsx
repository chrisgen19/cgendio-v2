import {HeroStage} from './hero-stage';
import {HeroStaticFrame} from './hero-static-frame';

/**
 * Above-the-fold hero: the Remotion film (lazy, client-only) under a server-rendered first frame. The page renders
 * the overlay header before <main> (not through HeroPlayer's `header` slot) so it stays the banner landmark, is
 * server-rendered, and comes before the film's controls in the tab order.
 */
export function Hero() {
  return (
    <div
      id="top"
      className="@container relative h-[min(100svh,980px)] min-h-[640px] bg-film max-md:h-svh max-md:min-h-[600px] portrait:h-svh portrait:min-h-[600px]"
    >
      <HeroStage worksHref="#work">
        <HeroStaticFrame />
      </HeroStage>
    </div>
  );
}
