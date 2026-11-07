import {Barlow, Barlow_Condensed} from 'next/font/google';

/** Flap glyphs: a condensed signage face, so each character sits in a tall, narrow flap like a station board. */
export const flapFont = Barlow_Condensed({subsets: ['latin'], weight: ['600'], variable: '--font-dep-flap', display: 'swap'});

/** Painted board text (column heads, domain, lede, Replay): the same superfamily at normal width. */
export const plateFont = Barlow({subsets: ['latin'], weight: ['400', '500'], variable: '--font-dep-plate', display: 'swap'});
