'use client';

import {CaptureSkeleton} from '@/components/ui-site/capture-skeleton';
import {tourAddress} from '@/lib/tour';
import type {TourStop} from '@/server/content';
import {CaptureImage, PanSurface, Selection} from './walkthrough-capture';
import {useTourDevice} from './walkthrough-device';

type StaticCaptureProps = {
  stop: TourStop;
  host: string | null;
  optimizedUrls: string[];
  first?: boolean;
};

/**
 * A note's own capture, for readers without the pinned frame: no JavaScript, or reduced motion. It renders the device the
 * switch is on, and only that one, so the other device's file is never fetched (a hidden image still downloads wherever
 * lazy loading is not deferring, which is every page without JavaScript).
 */
export function StaticCapture({stop, host, optimizedUrls, first = false}: StaticCaptureProps) {
  const device = useTourDevice();
  const caption = tourAddress(stop.path, host);
  return (
    <figure className="walkthrough-static-only m-0 max-lg:mt-6">
      <figcaption className="walkthrough-static-caption flex min-h-9 items-center rounded-t-[14px] border border-b-0 border-line bg-white px-3 font-mono text-xs text-ink">
        {caption.host}
        {caption.path}
      </figcaption>
      <div data-theme="light" className="walkthrough-viewport walkthrough-static-frame relative overflow-hidden border border-line bg-white">
        <div key={device} data-layer={device} data-state="active" className="walkthrough-page skeleton-host">
          <CaptureSkeleton />
          <PanSurface view={stop.positions[device]} capture={stop.captures[device]}>
            <CaptureImage
              stop={stop}
              device={device}
              optimized={optimizedUrls.includes(stop.captures[device].url)}
              zoom={stop.positions[device].zoom}
              first={first}
            />
            <Selection stop={stop} device={device} on />
          </PanSurface>
        </div>
      </div>
    </figure>
  );
}
