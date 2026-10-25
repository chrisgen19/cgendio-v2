import type {CSSProperties} from 'react';

const CAP = 'absolute bg-accent';
const LABEL =
  'about-measure absolute -translate-1/2 rounded-[4px] bg-accent px-1.5 py-[3px] font-mono text-[11px] leading-none font-medium text-on-accent tabular-nums';

/**
 * Redline guides from the canvas edges to the selected frame, as a design tool shows spacing. The numbers are the real
 * distances in CSS pixels: AboutStage measures them on resize. The server renders the 1440px values, which is what a
 * page without JavaScript shows. Phones keep only the top guide, placed clear of the frame name.
 */
export function AboutGuides() {
  return (
    <div aria-hidden="true" className="pointer-events-none [--gx:0.5] max-md:[--gx:0.9]">
      {/* Top: canvas edge down to the frame */}
      <div className="absolute top-0 left-[calc(var(--fx)_+_var(--fw)_*_var(--gx))] h-(--fy)">
        <span className="about-draw-y absolute inset-y-0 -left-px w-px origin-top bg-accent">
          <span className={`${CAP} top-0 -left-[3px] h-px w-[7px]`} />
          <span className={`${CAP} bottom-0 -left-[3px] h-px w-[7px]`} />
        </span>
        <span data-measure="top" style={{'--i': 0} as CSSProperties} className={`${LABEL} top-1/2 left-0`}>
          80
        </span>
      </div>
      {/* Left: canvas edge across to the frame */}
      <div className="absolute top-[calc(var(--fy)_+_var(--fh)_*_0.62)] left-0 w-(--fx) max-md:hidden">
        <span className="about-draw-x absolute inset-x-0 -top-px h-px origin-left bg-accent">
          <span className={`${CAP} -top-[3px] left-0 h-[7px] w-px`} />
          <span className={`${CAP} -top-[3px] right-0 h-[7px] w-px`} />
        </span>
        <span data-measure="left" style={{'--i': 1} as CSSProperties} className={`${LABEL} top-0 left-1/2`}>
          279
        </span>
      </div>
    </div>
  );
}
