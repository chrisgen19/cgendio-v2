import type {ProjectGroup} from '@/content/schema';

export type WorkFilter = ProjectGroup | 'all';

export const WORK_FILTERS: ReadonlyArray<{id: WorkFilter; label: string}> = [
  {id: 'all', label: 'All'},
  {id: 'client', label: 'Client work'},
  {id: 'personal', label: 'Personal'},
];

/**
 * Link for the filter pills without JavaScript: `/?filter=client` is served from a prerendered variant (see the rewrite
 * in next.config.ts), and `#work` brings the visitor back to the section after the reload.
 */
export const workFilterHref = (filter: WorkFilter) => `${workFilterUrl(filter)}#work`;

/** The address bar URL for a filter, used with history.replaceState when JavaScript filters in place. */
export const workFilterUrl = (filter: WorkFilter) => (filter === 'all' ? '/' : `/?filter=${filter}`);
