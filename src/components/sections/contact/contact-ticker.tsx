'use client';

import {type CSSProperties, useRef} from 'react';
import {TickerStream} from './ticker-stream';
import {TickerTab} from './ticker-tab';
import {useCopyEmail} from './use-copy-email';
import {useTicker} from './use-ticker';

type ContactTickerProps = {
  /** The contact address, or the `[YOUR EMAIL]` placeholder until there is one */
  address: string;
  /** False for the placeholder: plain text on the band, with no link and no controls */
  live: boolean;
};

/** Copies per loop: enough that the track always covers the band, up to about 32em wide (a 4K screen at the top size) */
const copiesPerLoop = (chars: number) => Math.max(2, Math.ceil((32 / (chars * 0.45 + 1) + 1) / 2));

/*
 * Full bleed past the panel (the section clips it). The type fits one whole address across the screen, so a paused or
 * static band always shows it complete: about 0.5em per character in Bricolage 800.
 */
const BAND =
  'contact-band relative z-10 mx-[calc(50%_-_50vw_-_32px)] h-[max(1.46em,84px)] overflow-clip font-display text-[min(clamp(40px,7.4vw,128px),calc((100vw_-_24px)/(var(--chars)*0.5)))] leading-none font-extrabold tracking-[-0.04em] whitespace-nowrap text-lime selection:bg-lime selection:text-ink';

/**
 * The email address as a ticker: an ink band across the lime panel, tilted, with the address streaming along it. The
 * whole band is the one mailto link and never moves (only its decorative text does); the tab under it holds Copy email
 * and the pause control. Hover or focus slows the stream, pausing parks an address in the centre, and a copy rolls the
 * band to a Copied row.
 */
export function ContactTicker({address, live}: ContactTickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const perLoop = copiesPerLoop(address.length);
  const {held, toggle, hold} = useTicker(rootRef, trackRef, perLoop, live);

  // A failed copy parks the stream and selects the centre address, ready to copy by hand
  const selectCentre = (index: number) => {
    const text = trackRef.current?.children[index]?.querySelector('[data-text]');
    if (text) window.getSelection()?.selectAllChildren(text);
  };
  const {status, message, copy} = useCopyEmail(address, () => hold(selectCentre));

  return (
    <div
      ref={rootRef}
      data-copied={status === 'copied' || undefined}
      style={{'--chars': address.length} as CSSProperties}
      className="group/ticker relative mt-1 mb-[calc(min(100vw,1320px)*0.044_-_8px)] flex -rotate-[2.5deg] flex-col"
    >
      <div className={BAND}>
        {live ? (
          <a
            href={`mailto:${address}`}
            className="group/band absolute inset-0 text-lime no-underline hover:text-lime focus-visible:-outline-offset-6 focus-visible:outline-lime"
          >
            <span className="sr-only">{address}</span>
            <TickerStream address={address} perLoop={perLoop} trackRef={trackRef} />
          </a>
        ) : (
          <span className="absolute inset-0 flex items-center justify-center">{address}</span>
        )}
      </div>
      {live ? <TickerTab status={status} held={held} onCopy={copy} onToggle={toggle} /> : null}
      {/* The copy result for screen readers: <output> is a status region, made polite explicitly for older readers */}
      <output aria-live="polite" className="sr-only">
        {message}
      </output>
    </div>
  );
}
