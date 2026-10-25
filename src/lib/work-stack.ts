import type {ProjectGroup} from '@/server/content';
import {WORK_FILTERS, type WorkFilter} from './work-filter';

/**
 * A Work card's place in the stack (see the `.work-card` CSS in globals.css): its own view timeline, and for each
 * filter its index among the visible cards and the timeline of the card that covers it next (`none` for the last one).
 */
export type StackPlace = {
  own: string;
  index: Record<WorkFilter, number>;
  next: Record<WorkFilter, string>;
};

/** The view timeline name of the nth card, scoped to the stack so its siblings can follow it. */
export const stackTimeline = (n: number) => `--work-c${n}`;

/** Every card's timeline name, for `timeline-scope` on the stack. */
export const stackScope = (count: number) => Array.from({length: count}, (_, n) => stackTimeline(n)).join(', ');

/**
 * Each card's place in the stack under every filter, so the sticky offsets stay evenly spaced and every card recedes
 * under the next card that filter shows, whatever the filter hides. A card the filter hides gets index 0 and no next.
 */
export const stackPlaces = (projects: ReadonlyArray<{group: ProjectGroup}>): StackPlace[] => {
  const shown = (filter: WorkFilter) => projects.flatMap((project, n) => (filter === 'all' || project.group === filter ? [n] : []));
  const lists = Object.fromEntries(WORK_FILTERS.map(({id}) => [id, shown(id)])) as Record<WorkFilter, number[]>;

  return projects.map((_, n) => {
    const index = {} as Record<WorkFilter, number>;
    const next = {} as Record<WorkFilter, string>;
    for (const {id} of WORK_FILTERS) {
      const at = lists[id].indexOf(n);
      const after = at >= 0 ? lists[id][at + 1] : undefined;
      index[id] = Math.max(at, 0);
      next[id] = after === undefined ? 'none' : stackTimeline(after);
    }
    return {own: stackTimeline(n), index, next};
  });
};
