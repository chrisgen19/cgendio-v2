import type {ReactNode, RefObject} from 'react';
import {cn} from '@/lib/cn';

/** The confirmation the band rolls to after a copy */
const COPIED = 'Copied';
const COPIED_PIECES = 9;

type PieceProps = {
  children: ReactNode;
  /** The centre piece is the one that shows without motion */
  centre: boolean;
};

/** One copy of the text, with a lime dot on its trailing edge, halfway to the next copy. */
function Piece({children, centre}: PieceProps) {
  return (
    <span className={cn('relative shrink-0 px-[0.5em]', !centre && 'invisible motion-js:visible')}>
      <span data-text className="decoration-[0.05em] underline-offset-[0.12em] group-hover/band:underline group-focus-visible/band:underline">
        {children}
      </span>
      <span className="absolute top-[0.56em] right-0 hidden size-[0.16em] translate-x-1/2 -translate-y-1/2 rounded-full bg-lime motion-js:block" />
    </span>
  );
}

type TickerStreamProps = {
  address: string;
  /** Copies the track moves per loop (see useTicker) */
  perLoop: number;
  trackRef: RefObject<HTMLSpanElement | null>;
};

/**
 * The band's moving text, all decorative (the link names the address once): a track of 3 × `perLoop` + 1 copies at
 * rest with copy `perLoop` centred, and below it the Copied row the band rolls up to after a copy.
 */
export function TickerStream({address, perLoop, trackRef}: TickerStreamProps) {
  const count = perLoop * 3 + 1;
  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 transition-transform duration-500 ease-mark group-data-copied/ticker:-translate-y-full motion-reduce:transition-none"
    >
      <span ref={trackRef} style={{translate: `${-((perLoop + 0.5) / count) * 100}% 0`}} className="absolute inset-y-0 left-1/2 flex items-center">
        {Array.from({length: count}, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: identical copies that never reorder
          <Piece key={i} centre={i === perLoop}>
            {address}
          </Piece>
        ))}
      </span>
      <span className="absolute inset-x-0 top-full flex h-full items-center justify-center">
        {Array.from({length: COPIED_PIECES}, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: identical copies that never reorder
          <Piece key={i} centre={i === (COPIED_PIECES - 1) / 2}>
            {COPIED}
          </Piece>
        ))}
      </span>
    </span>
  );
}
