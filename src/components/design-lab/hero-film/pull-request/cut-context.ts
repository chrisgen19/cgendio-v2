'use client';

import {createContext, useContext} from 'react';
import type {CutTiming, Geometry} from './timeline';

/** Type sizes for the PR page, in design px. */
export type Sizes = {
  title: number;
  body: number;
  small: number;
  mono: number;
  claim: number;
  diff: number;
  diffLine: number;
  row: number;
};

export const DESKTOP_SIZES: Sizes = {title: 28, body: 15, small: 14, mono: 13, claim: 46, diff: 14, diffLine: 21, row: 26};
export const MOBILE_SIZES: Sizes = {title: 20, body: 14, small: 13, mono: 11.5, claim: 30, diff: 11.5, diffLine: 20, row: 30};

export type Cut = {t: CutTiming; g: Geometry; sz: Sizes};

export const CutContext = createContext<Cut | null>(null);

export const useCut = (): Cut => {
  const cut = useContext(CutContext);
  if (!cut) throw new Error('useCut must be used inside a pull-request cut');
  return cut;
};
