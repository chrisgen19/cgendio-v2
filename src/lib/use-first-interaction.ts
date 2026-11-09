'use client';

import {useEffect, useState} from 'react';

/** Anything that means a visitor is engaging with the page. keydown covers keyboard users who Tab in without scrolling. */
const INTERACTION_EVENTS = ['scroll', 'wheel', 'pointerdown', 'touchstart', 'keydown'] as const;

/**
 * True from the visitor's first scroll, tap, click or key press. Lets heavy, non-essential work (the hero film,
 * analytics) wait until someone is actually on the page, so it stays out of the first seconds of load.
 */
export const useFirstInteraction = (enabled = true) => {
  const [interacted, setInteracted] = useState(false);
  useEffect(() => {
    if (!enabled || interacted) return;
    const onInteract = () => setInteracted(true);
    for (const type of INTERACTION_EVENTS) window.addEventListener(type, onInteract, {passive: true, once: true});
    return () => {
      for (const type of INTERACTION_EVENTS) window.removeEventListener(type, onInteract);
    };
  }, [enabled, interacted]);
  return interacted;
};
