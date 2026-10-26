'use client';

import {type RefObject, useCallback, useEffect, useRef, useState, useSyncExternalStore} from 'react';

/** Cruising speed in px/s, with each address taking between 6s and 12s to pass (so phones don't crawl) */
const SPEED = 95;
const UNIT_MS = {min: 6000, max: 12000};
/** Hover or focus inside the band slows the stream to this rate, so it can be read and aimed at */
const SLOW_RATE = 0.2;
/** The first view starts the stream at this rate and brakes it to cruising speed */
const LAUNCH_RATE = 9;
/** The first view's length (globals.css: the tab lands at about 1.2s), after which the band is disarmed */
const ENTRY_MS = 1800;
const MOTION_OK = '(prefers-reduced-motion: no-preference)';

type Ticker = {
  anim: Animation | null;
  /** How long one address takes to pass the centre at cruising speed */
  unitMs: number;
  /** Paused by the visitor (or by a failed copy, to hold the address still for selecting) */
  held: boolean;
  /** A pointer or keyboard focus is inside the band or its tab */
  engaged: boolean;
  visible: boolean;
  /** Armed for the first view, which hasn't played yet */
  waiting: boolean;
  /** Cancels the running tween */
  stop: () => void;
};

const easeOut = (t: number) => 1 - (1 - t) ** 3;

/** Calls `apply` on every frame with a value eased from `from` to `to` (and the frame time); returns a cancel function. */
const tween = (from: number, to: number, ms: number, apply: (value: number, now: number) => void, done?: () => void) => {
  const start = performance.now();
  let frame = 0;
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / ms);
    apply(from + (to - from) * easeOut(t), now);
    if (t < 1) frame = requestAnimationFrame(step);
    else done?.();
  };
  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
};

const timeOf = (anim: Animation) => (typeof anim.currentTime === 'number' ? anim.currentTime : 0);

/**
 * Eases the stream to its speed: slow while engaged, cruising otherwise. Does nothing while held, off screen or armed.
 * Setting playbackRate on a running animation can jump when the compositor runs it (Web Animations 4.4.15.2), so the
 * ease runs on the main thread: paused, stepped forward each frame at the eased rate, then played at the final rate.
 */
const cruise = (t: Ticker, ms = 500) => {
  const {anim} = t;
  if (!anim || t.held || !t.visible || t.waiting) return;
  t.stop();
  anim.pause();
  let last: number | undefined;
  const step = (rate: number, now: number) => {
    // The first frame only settles the pause: a running stream has already moved until then
    anim.currentTime = timeOf(anim) + (last === undefined ? 0 : (now - last) * rate);
    // Kept on the paused animation (no jump there), so an interrupted ease resumes from this rate
    anim.playbackRate = rate;
    last = now;
  };
  t.stop = tween(anim.playbackRate, t.engaged ? SLOW_RATE : 1, ms, step, () => anim.play());
};

/** Glides the stream on to the next stop with an address in the centre (one every `unitMs`), then holds it there. */
const park = (t: Ticker, done?: () => void) => {
  const {anim} = t;
  t.stop();
  if (!anim) return done?.();
  anim.pause();
  const from = timeOf(anim);
  const to = Math.ceil(from / t.unitMs) * t.unitMs;
  const seek = (time: number) => {
    anim.currentTime = time;
  };
  t.stop = tween(from, to, 280 + 720 * ((to - from) / t.unitMs), seek, done);
};

/** Hover or focus anywhere in the band (the link or the tab's buttons) slows the stream. */
const watchEngagement = (root: HTMLElement, t: Ticker) => {
  let pointer = false;
  let focus = false;
  const update = () => {
    t.engaged = pointer || focus;
    cruise(t);
  };
  const onEnter = () => {
    pointer = true;
    update();
  };
  const onLeave = () => {
    pointer = false;
    update();
  };
  const onFocusIn = () => {
    focus = true;
    update();
  };
  const onFocusOut = (event: FocusEvent) => {
    if (event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) return;
    focus = false;
    update();
  };
  root.addEventListener('pointerenter', onEnter);
  root.addEventListener('pointerleave', onLeave);
  root.addEventListener('focusin', onFocusIn);
  root.addEventListener('focusout', onFocusOut);
  return () => {
    root.removeEventListener('pointerenter', onEnter);
    root.removeEventListener('pointerleave', onLeave);
    root.removeEventListener('focusin', onFocusIn);
    root.removeEventListener('focusout', onFocusOut);
  };
};

/**
 * Runs the stream only while the band is on screen. If the band starts below the fold, the first view is armed
 * (`data-armed` hides the band in globals.css) and plays (`data-play`) once most of it is in view: the band shoots in
 * and the stream launches fast and brakes to cruising speed.
 */
const watchView = (root: HTMLElement, t: Ticker) => {
  const disarm = () => {
    root.removeAttribute('data-armed');
    root.removeAttribute('data-play');
  };
  let entry = 0;
  t.waiting = root.getBoundingClientRect().top > window.innerHeight;
  if (t.waiting) root.setAttribute('data-armed', '');

  const io = new IntersectionObserver(
    ([e]) => {
      if (!e) return;
      t.visible = e.isIntersecting;
      if (t.waiting && e.intersectionRatio >= 0.6) {
        t.waiting = false;
        root.setAttribute('data-play', '');
        if (t.anim) t.anim.playbackRate = LAUNCH_RATE;
        cruise(t, 1700);
        entry = window.setTimeout(disarm, ENTRY_MS);
      } else if (t.visible) cruise(t);
      else {
        t.stop();
        t.anim?.pause();
      }
    },
    {threshold: [0, 0.6]},
  );
  io.observe(root);
  return () => {
    io.disconnect();
    window.clearTimeout(entry);
    disarm();
  };
};

/** Sets up the loop (paused): from copy `perLoop` centred to copy 2 × `perLoop` centred, timed from a copy's width. */
const animateTrack = (track: HTMLElement, t: Ticker, perLoop: number) => {
  const count = perLoop * 3 + 1;
  const rest = -((perLoop + 0.5) / count) * 100;
  const end = rest - (perLoop / count) * 100;
  const unitPx = track.firstElementChild instanceof HTMLElement ? track.firstElementChild.offsetWidth : 0;
  t.unitMs = Math.min(UNIT_MS.max, Math.max(UNIT_MS.min, (unitPx / SPEED) * 1000));
  t.anim = track.animate([{translate: `${rest}% 0`}, {translate: `${end}% 0`}], {duration: perLoop * t.unitMs, iterations: Infinity});
  t.anim.pause();
};

const subscribeMotion = (onChange: () => void) => {
  const query = window.matchMedia(MOTION_OK);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};

const readMotion = () => window.matchMedia(MOTION_OK).matches;

/**
 * The ticker band's marquee, on the Web Animations API. The track holds 3 × `perLoop` + 1 copies of the address and
 * rests with copy `perLoop` centred, which is also how it renders without JavaScript or with reduced motion (CSS hides
 * the other copies there, and this hook does nothing). One loop moves the track by `perLoop` copies. The motion
 * preference is followed live: turning reduced motion on mid-visit stops the stream, turning it off starts it.
 */
export const useTicker = (rootRef: RefObject<HTMLElement | null>, trackRef: RefObject<HTMLElement | null>, perLoop: number, live: boolean) => {
  const [held, setHeld] = useState(false);
  const ticker = useRef<Ticker>({anim: null, unitMs: UNIT_MS.max, held: false, engaged: false, visible: false, waiting: false, stop: () => {}});
  // False while server rendering and hydrating, like the no-JavaScript render
  const motionOk = useSyncExternalStore(subscribeMotion, readMotion, () => false);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!live || !motionOk || !root || !track) return;
    const t = ticker.current;
    animateTrack(track, t, perLoop);
    const cleanups = [watchEngagement(root, t), watchView(root, t)];
    return () => {
      for (const cleanup of cleanups) cleanup();
      t.stop();
      t.anim?.cancel();
      t.anim = null;
    };
  }, [rootRef, trackRef, perLoop, live, motionOk]);

  const setHeldBoth = useCallback((value: boolean) => {
    ticker.current.held = value;
    setHeld(value);
  }, []);

  /** The pause/play button: pausing parks an address in the centre; playing eases back up to speed. */
  const toggle = useCallback(() => {
    const t = ticker.current;
    if (!t.anim) return;
    setHeldBoth(!t.held);
    if (t.held) return park(t);
    t.anim.playbackRate = 0.05;
    cruise(t, 900);
  }, [setHeldBoth]);

  /** Parks the stream and then hands over the index of the copy in the centre (for a failed copy to select it). */
  const hold = useCallback(
    (done: (centre: number) => void) => {
      const t = ticker.current;
      if (t.anim) setHeldBoth(true);
      park(t, () => done(perLoop + (t.anim ? Math.round(timeOf(t.anim) / t.unitMs) % perLoop : 0)));
    },
    [perLoop, setHeldBoth],
  );

  return {held, toggle, hold};
};
