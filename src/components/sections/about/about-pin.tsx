import type {CSSProperties} from 'react';
import {cn} from '@/lib/cn';
import type {AboutPinKey} from './copy';

/** Where a pin sits on the frame, in % of the frame box: `x`/`y` from 860px up, `mx`/`my` on phones (none: hidden there). */
export type PinPlace = {x: string; y: string; mx?: string; my?: string; side: 'left' | 'right'};

type AboutPinProps = {
  pinKey: AboutPinKey;
  label: string;
  note: string;
  place: PinPlace;
  /** Drop order in the entry */
  index: number;
};

/**
 * A comment pin on the portrait: the "cg" avatar marker with its pointed corner on the spot, a short label that is
 * always visible, and a bubble with the full note that opens while the pin or its panel row is hovered (AboutStage sets
 * `data-on`). Decorative: the canvas hides it from assistive tech, since the inspect panel holds the same facts.
 * Left pins face left from 860px up; on phones every pin faces right, into the space beside the frame, and pins without
 * a phone place are left out to keep the small canvas calm.
 */
export function AboutPin({pinKey, label, note, place, index}: AboutPinProps) {
  const left = place.side === 'left';
  const style = {'--x': place.x, '--y': place.y, '--mx': place.mx, '--my': place.my, '--i': index} as CSSProperties;

  return (
    <span
      data-fact={pinKey}
      data-side={place.side}
      style={style}
      className={cn('group/pin absolute top-(--y) left-(--x) max-md:top-(--my) max-md:left-(--mx)', !place.mx && 'max-md:hidden')}
    >
      <span
        className={cn(
          'about-drop absolute bottom-0 flex items-end gap-1.5',
          left
            ? 'right-0 origin-bottom-right flex-row-reverse max-md:right-auto max-md:left-0 max-md:origin-bottom-left max-md:flex-row'
            : 'left-0 origin-bottom-left',
        )}
      >
        <span
          className={cn(
            'grid size-7 shrink-0 place-items-center bg-badge font-display text-[11px] leading-none font-extrabold tracking-[-0.04em] text-badge-ink shadow-(--shadow-card) ring-accent ring-offset-2 ring-offset-film transition-shadow group-data-on/pin:ring-2 max-md:size-6 max-md:text-[10px] motion-reduce:transition-none',
            left ? 'rounded-[50%_50%_4px_50%] max-md:rounded-[50%_50%_50%_4px]' : 'rounded-[50%_50%_50%_4px]',
          )}
        >
          cg
        </span>
        <span className="about-chip mb-1 rounded-pill border border-line bg-white px-2.5 py-1.5 font-mono text-xs leading-none font-medium whitespace-nowrap text-ink shadow-(--shadow-card) transition-colors group-data-on/pin:border-accent group-data-on/pin:text-accent max-md:px-2 max-md:text-[11px] motion-reduce:transition-none">
          {label}
        </span>
      </span>
      {/* Starts at the anchor, so the pointer can travel from the pin onto the bubble without closing it */}
      <span
        className={cn(
          'invisible absolute top-0 w-56 scale-95 pt-2 opacity-0 transition-[opacity,scale,visibility] duration-200 group-data-on/pin:visible group-data-on/pin:scale-100 group-data-on/pin:opacity-100 max-md:hidden motion-reduce:transition-none',
          left ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
        )}
      >
        <span className="block rounded-[14px] border border-line bg-white px-4 py-3 text-sm leading-[1.45] text-ink shadow-(--shadow-menu)">
          {note}
        </span>
      </span>
    </span>
  );
}
