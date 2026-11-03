import {cn} from '@/lib/cn';

const BAR = 'block rounded-full bg-wire';
const SOFT = 'block rounded-full bg-wire-soft';

type CaptureSkeletonProps = {
  className?: string;
};

/**
 * A wireframe web page with a light sweep, shown behind a site capture while it loads. Sized in container units, so it
 * scales from a phone frame to the full walkthrough. Put it before the image inside a `.skeleton-host`: globals.css hides
 * it once the host's `LoadingImage` has loaded, stops the sweep if it failed, and never shows it without JavaScript.
 */
export function CaptureSkeleton({className}: CaptureSkeletonProps) {
  return (
    <div aria-hidden="true" className={cn('capture-skeleton @container absolute inset-0 overflow-hidden bg-white', className)}>
      <div className="flex items-center justify-between gap-[3cqw] border-b border-wire-soft px-[5cqw] py-[clamp(10px,2.6cqw,22px)]">
        <span className={cn(BAR, 'h-[clamp(8px,1.6cqw,14px)] w-[clamp(36px,10cqw,96px)]')} />
        <span className="flex gap-[2.4cqw] @max-sm:hidden">
          <span className={cn(SOFT, 'h-[clamp(6px,1cqw,9px)] w-[6cqw]')} />
          <span className={cn(SOFT, 'h-[clamp(6px,1cqw,9px)] w-[6cqw]')} />
          <span className={cn(SOFT, 'h-[clamp(6px,1cqw,9px)] w-[6cqw]')} />
          <span className={cn(SOFT, 'h-[clamp(6px,1cqw,9px)] w-[6cqw]')} />
        </span>
        <span className={cn(BAR, 'h-[clamp(14px,3cqw,28px)] w-[clamp(28px,10cqw,96px)]')} />
      </div>
      <div className="grid grid-cols-[3fr_2fr] items-center gap-[5cqw] px-[5cqw] pt-[7cqw] @max-sm:grid-cols-1">
        <div className="flex flex-col gap-[clamp(6px,1.4cqw,12px)]">
          <span className="block h-[clamp(12px,3.4cqw,34px)] w-full rounded-[clamp(3px,0.6cqw,6px)] bg-wire" />
          <span className="block h-[clamp(12px,3.4cqw,34px)] w-4/5 rounded-[clamp(3px,0.6cqw,6px)] bg-wire" />
          <span className={cn(SOFT, 'mt-[clamp(4px,1cqw,10px)] h-[clamp(6px,1.1cqw,10px)] w-full')} />
          <span className={cn(SOFT, 'h-[clamp(6px,1.1cqw,10px)] w-3/5')} />
          <span className={cn(BAR, 'mt-[clamp(6px,1.6cqw,16px)] h-[clamp(16px,3.6cqw,34px)] w-[clamp(52px,14cqw,132px)]')} />
        </div>
        <span className="block aspect-[4/3] rounded-[clamp(6px,1.4cqw,14px)] bg-wire-soft" />
      </div>
      <div className="grid grid-cols-3 gap-[3cqw] px-[5cqw] pt-[6cqw]">
        <span className="block aspect-[4/3] rounded-[clamp(6px,1.4cqw,14px)] bg-wire-soft" />
        <span className="block aspect-[4/3] rounded-[clamp(6px,1.4cqw,14px)] bg-wire-soft" />
        <span className="block aspect-[4/3] rounded-[clamp(6px,1.4cqw,14px)] bg-wire-soft" />
      </div>
    </div>
  );
}
