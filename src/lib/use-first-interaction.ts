'use client';

import {useEffect, useState} from 'react';

/** Anything that means a visitor is engaging with the page. keydown covers keyboard users who Tab in without scrolling. */
const INTERACTION_EVENTS = ['scroll', 'wheel', 'pointerdown', 'touchstart', 'keydown'] as const;

/**
 * True from the visitor's first scroll, tap, click or key press. Lets heavy, non-essential work (the hero film,
 * analytics) wait until someone is actually on the page, so it stays out of the first seconds of load.
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
    const onInteract = () => setInteracted(true);
    for (const type of INTERACTION_EVENTS) window.addEventListener(type, onInteract, {passive: true, once: true});
    return () => {
      for (const type of INTERACTION_EVENTS) window.removeEventListener(type, onInteract);
    };
  }, [interacted]);
  return interacted;
};
