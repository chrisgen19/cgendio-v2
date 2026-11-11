import {getImageProps} from 'next/image';
import type {CSSProperties, ReactNode} from 'react';
import {LoadingImage} from '@/components/ui-site/loading-image';
import {cn} from '@/lib/cn';
import {captureSizes} from '@/lib/tour';
import type {TourStop, TourView} from '@/server/content';

export type TourDevice = 'desktop' | 'mobile';

const HANDLES = ['top-0 left-0', 'top-0 left-full', 'top-full left-full', 'top-full left-0'];

const LABEL_PLACES = {
  top: 'bottom-full left-0 mb-1.5',
  right: 'top-0 left-full ml-2.5',
  bottom: 'top-full left-0 mt-1.5',
  inside: 'top-2 left-2',
};

type CaptureImageProps = {
  stop: TourStop;
  device: TourDevice;
  /** Worked out on the server: the R2 host is only known there, and this also renders in the browser. */
  optimized: boolean;
  /** The largest zoom this capture is shown at. */
  zoom?: number;
  /** The capture in the first viewport: fetched first, once the browser knows it is visible. */
  first?: boolean;
  /** Media-gated source for the responsive server render. */
  responsive?: boolean;
};

/** A full-page capture of the live site. */
export function CaptureImage({stop, device, optimized, zoom = 1, first = false, responsive = false}: CaptureImageProps) {
  const {url, width, height} = stop.captures[device];
  const sizes = captureSizes(device, zoom);
  const image = (
    <LoadingImage
      src={responsive ? 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=' : url}
      alt={stop.alt}
      width={width}
      height={height}
      sizes={sizes}
      unoptimized={responsive || !optimized}
      loading="lazy"
      fetchPriority={first ? 'high' : undefined}
      draggable={false}
      className="block h-auto w-full max-w-none select-none"
    />
  );
  if (!responsive) return image;
  const {props} = getImageProps({src: url, alt: stop.alt, width, height, sizes, unoptimized: !optimized});
  // The transparent fallback prevents a hidden layer from downloading even with JavaScript disabled (#142).
  return (
    <picture>
      <source media={device === 'mobile' ? '(width < 1080px)' : '(width >= 1080px)'} srcSet={props.srcSet ?? props.src} sizes={props.sizes} />
      {image}
    </picture>
  );
}

type SelectionProps = {
  stop: TourStop;
  device: TourDevice;
  on: boolean;
};

/** The inspect canvas's selection box: a label, an outline and four handles, placed in percent so it moves and scales with the capture. */
export function Selection({stop, device, on}: SelectionProps) {
  const {width, height} = stop.captures[device];
  const {box, labelAt} = stop.positions[device];
  const place = {
    '--box-y': box.y,
    left: `${(box.x / width) * 100}%`,
    top: `${(box.y / height) * 100}%`,
    width: `${(box.w / width) * 100}%`,
    height: `${(box.h / height) * 100}%`,
  } as CSSProperties;
  const at = labelAt ?? 'top';
  return (
    <span aria-hidden="true" data-on={on || undefined} style={place} className="walkthrough-selection pointer-events-none absolute">
      <span className="walkthrough-outline absolute -inset-px border-[1.5px] border-accent">
        {HANDLES.map((at) => (
          <span key={at} className={cn('walkthrough-handle absolute size-2.5 -translate-1/2 border-[1.5px] border-accent bg-white', at)} />
        ))}
      </span>
      <span
        data-at={at}
        className={cn(
          'walkthrough-label absolute rounded-[3px] bg-accent px-2 py-1 font-mono text-[11px] leading-none font-medium whitespace-nowrap text-on-accent',
          LABEL_PLACES[at],
        )}
      >
        {stop.selected}
      </span>
    </span>
  );
}

type PanSurfaceProps = {
  view: TourView;
  capture: {width: number; height: number};
  /** Set while the page is off screen, so it pans down from its start each time it opens. */
  atStart?: boolean;
  children: ReactNode;
};

/**
 * The capture plus its selections, moved as one inside a size container. The CSS works out the pan from these capture-pixel values, and moves it
 * off `y` only as far as it takes to keep the stop's box in a frame of any shape.
 */
export function PanSurface({view, capture, atStart = false, children}: PanSurfaceProps) {
  const vars = {
    '--cap-w': capture.width,
    '--cap-h': capture.height,
    '--x': view.x ?? 0,
    '--y': atStart ? (view.startY ?? 0) : view.y,
    '--zoom': view.zoom ?? 1,
    // The box the pan keeps in view. At its start the pan holds startY, so a box from the bottom up to the end leaves it alone
    '--focus-top': atStart ? capture.height : view.box.y,
    '--focus-bottom': atStart ? 0 : view.box.y + view.box.h,
  } as CSSProperties;
  return (
    <div style={vars} className="walkthrough-pan">
      {children}
    </div>
  );
}
