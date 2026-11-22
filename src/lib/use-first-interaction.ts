'use client';

import {useEffect, useState} from 'react';

/**
 * Anything that means a visitor is engaging with the page. keydown covers keyboard users who Tab in without scrolling.
 * pointermove means a desktop visitor starts the film as soon as they move the mouse; phones have no hover, so there
 * it still waits for a scroll or tap. Each listener is `once`, so a moving mouse costs nothing after the first event.
 */
const INTERACTION_EVENTS = ['scroll', 'wheel', 'pointerdown', 'pointermove', 'touchstart', 'keydown'] as const;

/**
 * Mark a control with this so touching it doesn't count as "start the heavy work". The hero's "See my work" link uses
 * it: a tap emits pointerdown and touchstart, both of which bubble to the listeners below, so without it the film
 * mounts (about 2s of main-thread work on a mid-range phone) while the visitor is navigating away to #work.
 */
export const DEFER_FILM_ATTRIBUTE = 'data-defer-film';

/** Duck-typed so this stays testable without a DOM: a real EventTarget that can't `closest` is not inside anything. */
const canClosest = (target: EventTarget | null): target is EventTarget & {closest: (selector: string) => unknown} =>
  typeof (target as {closest?: unknown} | null)?.closest === 'function';

/** False only for events raised inside a [data-defer-film] element. Everything else is a real interaction. */
export const startsHeavyWork = (target: EventTarget | null) => !canClosest(target) || target.closest(`[${DEFER_FILM_ATTRIBUTE}]`) === null;

/**
 * True from the visitor's first scroll, tap, click, mouse movement or key press. Lets heavy, non-essential work (the hero film) wait
 * until someone is actually on the page, so it stays out of the first seconds of load.
 *
 * The listeners only exist once React has hydrated. A page that is already scrolled by then (the visitor scrolled
 * during load, or the browser restored a position) counts straight away; a tap or key press before hydration is
 * missed, and the next one counts.
 */
export const useFirstInteraction = () => {
  const [interacted, setInteracted] = useState(false);
  useEffect(() => {
    if (interacted) return;
    if (window.scrollY > 0) {
      setInteracted(true);
      return;
    }
    // Not `once`: an event inside a deferred control is ignored, and `once` would have spent the listener on it
    const remove = () => {
      for (const type of INTERACTION_EVENTS) window.removeEventListener(type, onInteract);
    };
    const onInteract = (event: Event) => {
      if (!startsHeavyWork(event.target)) return;
      remove();
      setInteracted(true);
    };
    for (const type of INTERACTION_EVENTS) window.addEventListener(type, onInteract, {passive: true});
    return remove;
  }, [interacted]);
  return interacted;
};
