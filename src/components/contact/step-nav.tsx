'use client';

import {Button} from '@/components/ui-site/button';

type StepNavProps = {
  onBack?: () => void;
  /** Without onNext this is the last step, and the main button sends the form */
  onNext?: () => void;
  pending?: boolean;
};

/** Back and Next (or Send) under each step. Back keeps everything typed: the fields never unmount. */
export function StepNav({onBack, onNext, pending}: StepNavProps) {
  return (
    <div className="mt-7 flex flex-wrap items-center gap-3">
      {onNext ? (
        <Button onClick={onNext}>
          Next
          <Arrow />
        </Button>
      ) : (
        <Button type="submit" disabled={pending} className="disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0">
          {pending ? 'Sending…' : 'Send message'}
        </Button>
      )}
      {onBack ? (
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
      ) : null}
    </div>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
