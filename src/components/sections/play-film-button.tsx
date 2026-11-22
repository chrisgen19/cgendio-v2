'use client';

import {Button} from '@/components/ui-site/button';
import {useHeroFilm} from './hero-stage';

/**
 * Starts the hero film on demand. Phones fire no `pointermove`, so useFirstInteraction never trips on its own there
 * and the film would wait for a scroll or tap the page gives no reason to make (#mobile-hero-cta). This is the
 * deliberate way in; the static frame fades out as soon as the film has its first frame.
 */
export function PlayFilmButton() {
  const {startFilm} = useHeroFilm();
  return (
    <Button variant="secondary" onClick={startFilm}>
      Play the film
    </Button>
  );
}
