import {Pause, Play} from 'lucide-react';
import {Button} from '@/components/ui-site/button';
import {cn} from '@/lib/cn';
import type {CopyStatus} from './use-copy-email';

const LABELS: Record<CopyStatus, string> = {idle: 'Copy email', copied: 'Copied', failed: 'Copy failed'};
const STATUSES = Object.keys(LABELS) as CopyStatus[];
/** What to do after a failed copy, shown beside the tab while the pill says Copy failed (the live region says it too) */
const FAILED_HINT = 'Select the address and copy it instead.';

type TickerTabProps = {
  status: CopyStatus;
  /** The stream is paused */
  held: boolean;
  onCopy: () => void;
  onToggle: () => void;
};

/**
 * The ink tab hanging under the band's right end, holding the Copy email pill and the pause control, both stationary.
 * Hidden without JavaScript (neither works there); the pause control also goes with reduced motion (nothing moves).
 * After a failed copy the hint shows to the tab's left, or under it on phones where there's no room beside it.
 */
export function TickerTab({status, held, onCopy, onToggle}: TickerTabProps) {
  return (
    <div className="-mt-px flex items-center gap-4 self-end noscript:hidden max-md:flex-col-reverse max-md:items-end max-md:gap-3 md:absolute md:top-full md:right-0">
      {status === 'failed' ? <p className="m-0 max-w-[28ch] text-right text-sm leading-[1.4] font-medium text-ink">{FAILED_HINT}</p> : null}
      <div className="contact-tab relative flex items-center gap-2 rounded-b-[34px] p-2 max-md:rounded-b-[30px]">
        <TabControls status={status} held={held} onCopy={onCopy} onToggle={onToggle} />
      </div>
    </div>
  );
}

/** The Copy email pill, which keeps the width of its longest label, and the pause/play control. */
function TabControls({status, held, onCopy, onToggle}: TickerTabProps) {
  return (
    <>
      <Button variant="lime" onClick={onCopy} className="max-md:min-h-11 max-md:px-5 max-md:text-sm">
        {/* Every label in one grid cell, so the pill keeps the width of the longest */}
        <span className="grid text-center">
          {STATUSES.map((key) => (
            <span key={key} className={cn('col-start-1 row-start-1', key !== status && 'invisible')}>
              {LABELS[key]}
              {key === 'idle' ? <span className="sr-only"> address</span> : null}
            </span>
          ))}
        </span>
      </Button>
      <button
        type="button"
        onClick={onToggle}
        aria-label={held ? 'Play animation' : 'Pause animation'}
        className="inline-flex size-13 cursor-pointer items-center justify-center rounded-full border border-lime/35 text-lime transition-colors duration-200 hover:border-lime focus-visible:outline-lime motion-reduce:hidden max-md:size-11"
      >
        {held ? <Play aria-hidden="true" className="size-[18px] fill-current" /> : <Pause aria-hidden="true" className="size-[18px] fill-current" />}
      </button>
    </>
  );
}
