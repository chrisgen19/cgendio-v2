import type {ProjectGroup} from '@/content/schema';

export type WorkFilter = ProjectGroup | 'all';

export const WORK_FILTERS: ReadonlyArray<{id: WorkFilter; label: string}> = [
  {id: 'all', label: 'All'},
  {id: 'client', label: 'Client work'},
  {id: 'personal', label: 'Personal'},
];

/**
 * `/?filter=client` is served from a prerendered variant (see the rewrite in next.config.ts), so the filter works
 * without JavaScript. `#work` brings visitors without JS back to the section after the reload.
 */
export const workFilterHref = (filter: WorkFilter) => (filter === 'all' ? '/#work' : `/?filter=${filter}#work`);
