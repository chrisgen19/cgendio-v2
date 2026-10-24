'use client';

import {type RefObject, useEffect, useState} from 'react';

/** The whole intro, start to last line, so it reads as one quick write rather than slow typing */
const TOTAL_MS = 1200;
/** A beat after each line, where the caret rests at the line end */
const LINE_PAUSE_MS = 40;

/** Parks the caret at the end of a line, read from the empty anchor the line ends with. */
const moveCaret = (panel: HTMLElement, caret: HTMLElement, line: HTMLElement) => {
  const anchor = line.querySelector('[data-caret-anchor]');
  if (!anchor) return;
  const a = anchor.getBoundingClientRect();
  const p = panel.getBoundingClientRect();
  caret.style.translate = `${a.left - p.left + 2}px ${a.top - p.top}px`;
  caret.style.height = `${a.height}px`;
  caret.style.opacity = '1';
};

/**
 * Writes the lines in one after another: each line is unclipped in steps of one character (fast, so it reads as
 * line-by-line), and the caret jumps to its end. Afterwards the caret blinks a few times (well under 5s) and goes.
 * Returns a cleanup that stops everything and leaves the finished text showing.
 */
const playTyping = (panel: HTMLElement, caret: HTMLElement, onDone: () => void): (() => void) => {
  const lines = [...panel.querySelectorAll<HTMLElement>('[data-line-text]')];
  const chars = lines.map((line) => Math.max(1, line.textContent?.length ?? 1));
  const perChar = (TOTAL_MS - LINE_PAUSE_MS * lines.length) / chars.reduce((sum, n) => sum + n, 0);
  const animations: Animation[] = [];
  const timers: ReturnType<typeof setTimeout>[] = [];
  let at = 0;
  lines.forEach((line, i) => {
    const steps = chars[i] ?? 1;
    const duration = Math.max(50, steps * perChar);
    const keyframes = [{clipPath: 'inset(0 100% 0 0)'}, {clipPath: 'inset(0 0 0 0)'}];
    animations.push(line.animate(keyframes, {duration, delay: at, easing: `steps(${steps}, end)`, fill: 'backwards'}));
    at += duration;
    timers.push(setTimeout(() => moveCaret(panel, caret, line), at));
    at += LINE_PAUSE_MS;
  });
  timers.push(
    setTimeout(() => {
      onDone();
      const blink = caret.animate([{opacity: 1}, {opacity: 0}], {duration: 420, iterations: 5, direction: 'alternate', easing: 'steps(1, end)'});
      blink.onfinish = () => {
        caret.style.opacity = '0';
      };
      animations.push(blink);
    }, at),
  );
  return () => {
    for (const timer of timers) clearTimeout(timer);
    for (const animation of animations) animation.cancel();
    caret.style.opacity = '0';
  };
};

/**
 * The window's one motion moment: the first time it scrolls into view, the code is written in. It only arms when JS
 * runs, motion is allowed and the window starts off screen; otherwise the finished code simply shows. While armed the
 * lines are clipped by CSS (`data-armed` on the root). Returns true until the code is written, for the status line.
 */
export const useTypingIntro = (
  rootRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
  caretRef: RefObject<HTMLElement | null>,
): boolean => {
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    const caret = caretRef.current;
    if (!root || !panel || !caret || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = root.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    root.dataset.armed = '';
    setPending(true);
    let stop = () => {};
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        stop = playTyping(panel, caret, () => setPending(false));
        // The animations now hold each line hidden until its turn, so the CSS clip can go
        delete root.dataset.armed;
      },
      {threshold: 0.45},
    );
    io.observe(root);
    return () => {
      io.disconnect();
      stop();
      delete root.dataset.armed;
      setPending(false);
    };
  }, [rootRef, panelRef, caretRef]);

  return pending;
};
