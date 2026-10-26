import type {ComponentType} from 'react';
import {TimelineV1} from './timeline-v1';
import {TimelineV2} from './timeline-v2';
import {TimelineV3} from './timeline-v3';
import {TimelineV4} from './timeline-v4';
import {TimelineV5} from './timeline-v5';
import {TimelineV6} from './timeline-v6';

type TimelineVariant = {
  slug: string;
  name: string;
  approach: string;
  Component: ComponentType;
};

/** Design explorations for the Work timeline, previewed at /lab/timeline/<slug>. Not linked from the site. */
export const TIMELINE_VARIANTS: TimelineVariant[] = [
  {slug: 'v1', name: 'Scroll-drawn rail', approach: 'The rail fills as you scroll; each stop lights up when reached.', Component: TimelineV1},
  {slug: 'v2', name: 'Career span chart', approach: 'A year axis from 2007 to now; each role is a bar sized to its dates.', Component: TimelineV2},
  {slug: 'v3', name: 'Expanding ledger', approach: 'Dense, scannable rows that open in place to show the detail.', Component: TimelineV3},
  {
    slug: 'v4',
    name: 'Pinned horizontal track',
    approach: 'Vertical scroll pans a horizontal track of roles along a year ruler.',
    Component: TimelineV4,
  },
  {slug: 'v5', name: 'Year counter', approach: 'A large sticky year ticks over as each role scrolls past.', Component: TimelineV5},
  {slug: 'v6', name: 'Master and detail', approach: 'Roles as tabs on the left, a dark detail panel that swaps on the right.', Component: TimelineV6},
];
