/**
 * A Work card's place in the stack (see the `.work-card` CSS in globals.css): its own view timeline, its index, and
 * the timeline of the card that covers it next (`none` for the last one).
 */
export type StackPlace = {
  own: string;
  index: number;
  next: string;
};

/** The view timeline name of the nth card, scoped to the stack so its siblings can follow it. */
export const stackTimeline = (n: number) => `--work-c${n}`;

/** Every card's timeline name, for `timeline-scope` on the stack. */
export const stackScope = (count: number) => Array.from({length: count}, (_, n) => stackTimeline(n)).join(', ');

/** Each of `count` cards' places in the stack, so every card recedes under the one after it. */
export const stackPlaces = (count: number): StackPlace[] =>
  Array.from({length: count}, (_, n) => ({own: stackTimeline(n), index: n, next: n + 1 < count ? stackTimeline(n + 1) : 'none'}));
