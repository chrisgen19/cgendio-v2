'use client';

import {Button} from '@/components/ui-site/button';
import {useHeroFilm} from './hero-stage';

/**
 * Starts the hero film on demand. Phones fire no `pointermove`, so useFirstInteraction never trips on its own there
 * and the film would wait for a scroll or tap the page gives no reason to make (#mobile-hero-cta). This is the
 * deliberate way in; the static frame fades out as soon as the film has its first frame.
 *
 * Hidden under reduced motion: HeroPlayer opens on the final brand card there, paused (HeroPlayer.tsx, `autoPlay` and
 * the reduced-motion seek), as the accessibility rules require, so the film would not play and the label would lie.
 * Those visitors still get the card once the page is idle.
 */
export function PlayFilmButton() {
  const {startFilm} = useHeroFilm();
  return (
    <Button variant="secondary" className="motion-reduce:hidden" onClick={startFilm}>
      Play the film
    </Button>
  );
}
