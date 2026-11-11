'use client';

import {createContext, useContext} from 'react';
import type {TourDevice} from './walkthrough-capture';

/**
 * The device the tour is showing. The frame's switch sets it, and every capture on the page follows: the pinned frame's
 * pages and the static captures beside the notes follow it. Before hydration, CSS and picture media queries select the
 * layout default without fetching the other device. After hydration, only the chosen device remains mounted.
 */
export const DeviceContext = createContext<TourDevice | null>(null);

export const useTourDevice = () => useContext(DeviceContext);
