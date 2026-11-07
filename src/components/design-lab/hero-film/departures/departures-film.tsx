'use client';

import type {CSSProperties} from 'react';
import {FilmPlayer} from '../shared/film-player';
import {DESKTOP_DURATION, DeparturesDesktop, DeparturesMobile, MOBILE_DURATION} from './board-film';

const HUD = {
  '--hud-bg': 'var(--dep-stage)',
  '--hud-fg': 'var(--dep-text)',
  '--hud-line': 'var(--dep-rule)',
  '--hud-accent': 'var(--dep-progress)',
  '--hud-track': 'var(--dep-rule)',
} as CSSProperties;

export function DeparturesFilm() {
  return (
    <FilmPlayer
      desktop={{component: DeparturesDesktop, durationInFrames: DESKTOP_DURATION}}
      mobile={{component: DeparturesMobile, durationInFrames: MOBILE_DURATION}}
      label="Hero film: departures board"
      description="A split-flap departures board. It flaps in my name, Christian Diomampo, and the line: I design, build and ship websites that work. Beneath it, what I build rolls in: a WooCommerce store, a Next.js web app, a WordPress theme and a landing page, each moving from idea to design, build and live. A last row reads See my work, boarding."
      hudStyle={HUD}
      stageBackground="var(--dep-stage)"
    />
  );
}
