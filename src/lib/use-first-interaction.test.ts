import {describe, expect, it} from 'vitest';
import {DEFER_FILM_ATTRIBUTE, startsHeavyWork} from './use-first-interaction';

/**
 * A stand-in for an event target, the way clarity.test.ts fakes a browser: these run in the node environment, so there
 * is no DOM. `closest` answers for the selector the hook actually asks about.
 */
const target = (insideDeferred: boolean) =>
  ({
    closest: (selector: string) => (selector === `[${DEFER_FILM_ATTRIBUTE}]` && insideDeferred ? {} : null),
  }) as unknown as EventTarget;

describe('startsHeavyWork', () => {
  it('counts an ordinary element, so a tap anywhere else still starts the film', () => {
    expect(startsHeavyWork(target(false))).toBe(true);
  });

  it('ignores an element inside [data-defer-film], so following "See my work" does not mount the film', () => {
    expect(startsHeavyWork(target(true))).toBe(false);
  });

  it('counts a target with no closest(), which is what window reports for scroll', () => {
    expect(startsHeavyWork({} as EventTarget)).toBe(true);
    expect(startsHeavyWork({closest: 'not a function'} as unknown as EventTarget)).toBe(true);
  });

  it('counts a null target rather than swallowing the interaction', () => {
    expect(startsHeavyWork(null)).toBe(true);
  });

  it('asks for the attribute the markup actually sets', () => {
    const asked: string[] = [];
    const spy = {
      closest: (selector: string) => {
        asked.push(selector);
        return null;
      },
    };
    startsHeavyWork(spy as unknown as EventTarget);
    expect(asked).toEqual(['[data-defer-film]']);
  });
});
