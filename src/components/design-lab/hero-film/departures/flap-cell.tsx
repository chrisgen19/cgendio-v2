import type React from 'react';
import {memo} from 'react';
import {ARRIVE, LEAVE} from '../shared/motion';
import type {Tone} from './board-script';

/**
 * The call to the gate reads its colours through `--dep-cta-now` / `--dep-cta-ink-now` when the board sets them, so
 * hovering or focusing the link can swap the tiles without re-rendering the film.
 */
const CTA_FACE = 'var(--dep-cta-now, var(--dep-cta))';
const CTA_INK = 'var(--dep-cta-ink-now, var(--dep-cta-ink))';

const FACE: Record<Tone, string> = {plain: 'var(--dep-face)', live: 'var(--dep-live)', cta: CTA_FACE};
const INK: Record<Tone, string> = {plain: 'var(--dep-ink)', live: 'var(--dep-live-ink)', cta: CTA_INK};
/** The lower flap sits slightly in shadow, as on a real unit. */
const LOW: Record<Tone, string> = {
  plain: 'color-mix(in srgb, var(--dep-face) 93%, var(--dep-shade))',
  live: 'color-mix(in srgb, var(--dep-live) 90%, var(--dep-shade))',
  cta: `color-mix(in srgb, ${CTA_FACE} 90%, var(--dep-shade))`,
};
/**
 * The hinge: a 1px low-contrast line painted on the face behind the glyph (not a gap to the housing), so the strokes
 * stay whole and small phone flaps never read as struck through.
 */
const HINGE: Record<Tone, string> = {
  plain: 'color-mix(in srgb, var(--dep-face) 78%, var(--dep-shade))',
  live: 'color-mix(in srgb, var(--dep-live) 78%, var(--dep-shade))',
  cta: `color-mix(in srgb, ${CTA_FACE} 78%, var(--dep-shade))`,
};

type HalfProps = {
  ch: string;
  tone: Tone;
  part: 'top' | 'bottom';
  w: number;
  h: number;
  fontSize: number;
  /** Rotation around the hinge, in degrees (x axis). */
  angle?: number;
  /** 0..1 darkening while the half is falling. */
  shade?: number;
};

const Half: React.FC<HalfProps> = ({ch, tone, part, w, h, fontSize, angle = 0, shade = 0}) => {
  // Whole pixels, so the halves meet without a sub-pixel seam showing the housing through
  const split = Math.floor(h / 2);
  const top = part === 'top';
  const radius = Math.max(2, Math.round(w * 0.08));
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: top ? 0 : split,
        width: w,
        height: top ? split : h - split,
        overflow: 'hidden',
        background: top ? `linear-gradient(to top, ${HINGE[tone]} 1px, ${FACE[tone]} 1px)` : LOW[tone],
        borderRadius: top ? `${radius}px ${radius}px 0 0` : `0 0 ${radius}px ${radius}px`,
        transformOrigin: top ? '50% 100%' : '50% 0%',
        rotate: angle === 0 ? undefined : `x ${angle}deg`,
        backfaceVisibility: 'hidden',
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: 0,
          // Barlow's caps sit a little low in the em box: lift them so the hinge cuts them through the middle
          top: (top ? 0 : -split) - Math.round(h * 0.04),
          width: w,
          height: h,
          lineHeight: `${h}px`,
          textAlign: 'center',
          fontSize,
          color: INK[tone],
        }}
      >
        {ch === ' ' ? ' ' : ch}
      </span>
      {shade > 0 ? <span style={{position: 'absolute', inset: 0, background: 'var(--dep-shade)', opacity: shade}} /> : null}
    </div>
  );
};

type FlapCellProps = {
  fromCh: string;
  fromTone: Tone;
  toCh: string;
  toTone: Tone;
  /** 0..1 through one flip; 0 means at rest on `from`. */
  t: number;
  w: number;
  h: number;
  fontSize: number;
};

/**
 * One split-flap unit. At rest it is two halves of the same glyph. Mid-flip, the new glyph's top and the old glyph's
 * bottom wait behind; the old top half falls to 90deg (ease-in, gravity), then the new bottom half lands (ease-out).
 * Memoised on primitive props, so cells at rest skip rendering while their row updates every frame.
 */
export const FlapCell = memo(function FlapCell({fromCh, fromTone, toCh, toTone, t, w, h, fontSize}: FlapCellProps) {
  const size = {w, h, fontSize};
  if (t === 0) {
    return (
      <div style={{position: 'relative', width: w, height: h, flex: 'none'}}>
        <Half ch={fromCh} tone={fromTone} part="top" {...size} />
        <Half ch={fromCh} tone={fromTone} part="bottom" {...size} />
      </div>
    );
  }
  const falling = t < 0.5;
  const fall = LEAVE(Math.min(1, t * 2));
  const land = ARRIVE(Math.max(0, (t - 0.5) * 2));
  return (
    <div style={{position: 'relative', width: w, height: h, flex: 'none', perspective: h * 5}}>
      <Half ch={toCh} tone={toTone} part="top" {...size} />
      <Half ch={fromCh} tone={fromTone} part="bottom" {...size} shade={falling ? fall * 0.18 : 0} />
      {falling ? (
        <Half ch={fromCh} tone={fromTone} part="top" {...size} angle={-90 * fall} shade={fall * 0.3} />
      ) : (
        <Half ch={toCh} tone={toTone} part="bottom" {...size} angle={90 * (1 - land)} shade={(1 - land) * 0.3} />
      )}
    </div>
  );
});
