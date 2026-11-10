'use client';

import {createContext, useContext} from 'react';
import type {TourDevice} from './walkthrough-capture';

/**
 * The device the tour is showing. The frame's switch sets it, and every capture on the page follows: the pinned frame's
 * pages and the static captures beside the notes each render that device alone, so the other one is never in the markup.
 * Desktop is what the server renders, so a reader without JavaScript gets the captures they can read.
 */
export const DeviceContext = createContext<TourDevice>('desktop');

export const useTourDevice = () => useContext(DeviceContext);
