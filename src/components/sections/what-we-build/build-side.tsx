import {cn} from '@/lib/cn';
import type {BuildSideCopy, BuildSideId} from './copy';

type BuildSideProps = {
  side: BuildSideCopy;
  pressed: boolean;
  onToggle: () => void;
  /** Keyboard focus previews the side like hover does; mouse and touch focus don't. */
  onFocusChange: (focused: boolean) => void;
  className?: string;
};

// Literal per side so Tailwind sees every class. The split root is the `split` group and carries data-active.
const STYLES: Record<BuildSideId, {column: string; label: string; text: string; proof: string; bar: string; dot: string}> = {
  wp: {
    column: 'md:items-end md:text-right',
    label:
      'origin-bottom-left md:origin-bottom-right group-data-[active=wp]/split:scale-112 group-data-[active=next]/split:scale-88 group-data-[active=next]/split:text-muted',
    text: 'group-data-[active=wp]/split:text-ink group-data-[active=next]/split:text-muted',
    proof: 'md:flex-row-reverse',
    bar: 'bg-side-wp group-data-[active=next]/split:bg-line',
    dot: 'bg-side-wp',
  },
  next: {
    column: 'md:items-start',
    label:
      'origin-bottom-left group-data-[active=next]/split:scale-112 group-data-[active=wp]/split:scale-88 group-data-[active=wp]/split:text-muted',
    text: 'group-data-[active=next]/split:text-ink group-data-[active=wp]/split:text-muted',
    proof: '',
    bar: 'bg-side-next group-data-[active=wp]/split:bg-line',
    dot: 'bg-side-next',
  },
};

const EASE = 'duration-800 ease-split motion-reduce:transition-none';

/** One side of the split: the giant label is the toggle; its line and proof always stay in the page. */
export function BuildSide({side, pressed, onToggle, onFocusChange, className}: BuildSideProps) {
  const styles = STYLES[side.id];
  return (
    <div className={cn('flex flex-col gap-6 max-md:gap-4', styles.column, className)}>
      <h3 className="m-0">
        <button
          type="button"
          aria-pressed={pressed}
          onClick={onToggle}
          onFocus={(event) => onFocusChange(event.currentTarget.matches(':focus-visible'))}
          onBlur={() => onFocusChange(false)}
          className={cn(
            'group/label flex min-h-11 cursor-pointer flex-col rounded-[14px] border-0 bg-transparent p-0 font-display text-[clamp(52px,5.4vw,80px)] leading-[0.92] font-extrabold tracking-[-0.045em] text-ink transition-[scale,color]',
            styles.column,
            styles.label,
            EASE,
          )}
        >
          <span>{side.label}</span>
          <span className="mt-1 flex items-center gap-2.5 text-[0.4em] leading-none font-semibold tracking-[-0.02em] text-muted">
            {side.labelSub}
            {/* Shows which side is pinned while the pointer previews the other */}
            <span
              aria-hidden="true"
              className={cn('size-2.5 scale-0 rounded-full transition-transform group-aria-pressed/label:scale-100', styles.dot)}
            />
          </span>
        </button>
      </h3>
      <p className={cn('m-0 max-w-[340px] text-[17px] leading-[1.5] text-ink-soft transition-colors max-md:text-base', styles.text, EASE)}>
        {side.line}
      </p>
      <p className={cn('m-0 flex max-w-[340px] gap-3 text-[15px] leading-[1.5] text-ink-soft transition-colors', styles.proof, styles.text, EASE)}>
        <span aria-hidden="true" className={cn('mt-[0.2em] w-[3px] shrink-0 self-stretch rounded-full transition-colors', styles.bar, EASE)} />
        {side.proof}
      </p>
    </div>
  );
}
