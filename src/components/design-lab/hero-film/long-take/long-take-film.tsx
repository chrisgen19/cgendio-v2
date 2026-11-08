'use client';

import type React from 'react';
import {FilmPlayer, type LabFilmProps} from '../shared/film-player';
import {LongTakeCut} from './board';
import {DESKTOP, PHONE} from './layout';

const Desktop: React.FC<LabFilmProps> = (props) => <LongTakeCut {...props} cut={DESKTOP} />;
const Phone: React.FC<LabFilmProps> = (props) => <LongTakeCut {...props} cut={PHONE} />;

/** Direction 01: one board, one continuous camera move, no cuts. */
export function LongTakeFilm() {
  return (
    <FilmPlayer
      desktop={{component: Desktop, durationInFrames: DESKTOP.duration}}
      mobile={{component: Phone, durationInFrames: PHONE.duration}}
      label="Hero film: the long take"
      description="One continuous camera move across a working board. It opens on my name and the line: I design, build and ship websites that work. The camera visits research notes on who the site is for (recruiters, clients and visitors), a wireframe that fills into a styled page, and the same page live in a browser after a Vercel deploy with launch checks passing. It ends back on my name and that line, beside a link to see my work."
    />
  );
}
