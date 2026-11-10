'use client';

import {Monitor, Smartphone} from 'lucide-react';
import {type ReactNode, useEffect, useRef, useState} from 'react';
import {flushSync} from 'react-dom';
import {CaptureSkeleton} from '@/components/ui-site/capture-skeleton';
import {cn} from '@/lib/cn';
import {captureGroups, captureKey, tourAddress, tourHref} from '@/lib/tour';
import type {TourStop} from '@/server/content';
import {CaptureImage, PanSurface, Selection, type TourDevice} from './walkthrough-capture';

const DEVICES: {key: TourDevice; label: string; icon: typeof Monitor}[] = [
  {key: 'desktop', label: 'Desktop', icon: Monitor},
  {key: 'mobile', label: 'Mobile', icon: Smartphone},
];

type DeviceSwitchProps = {
  device: TourDevice | 'auto';
  onChange: (device: TourDevice) => void;
  className?: string;
};

function DeviceSwitch({device, onChange, className}: DeviceSwitchProps) {
  return (
    <fieldset className={cn('m-0 flex min-w-0 gap-0.5 border-0 p-0', className)}>
      <legend className="sr-only">Show the site on</legend>
      {DEVICES.map(({key, label, icon: Icon}) => (
        <button
          key={key}
          type="button"
          aria-pressed={device === key}
          onClick={() => onChange(key)}
          aria-label={label}
          title={label}
          className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-pill border-0 bg-transparent px-3 text-[13px] font-semibold text-muted hover:text-ink aria-pressed:bg-ink aria-pressed:text-white"
        >
          <Icon size={15} aria-hidden="true" />
          <span className="walkthrough-switch-label">{label}</span>
        </button>
      ))}
    </fieldset>
  );
}

type AddressProps = {
  stop: TourStop;
  host: string | null;
};

/** The address bar's text. On a phone a long path hides the host, so the page's own path stays readable. */
function Address({stop, host}: AddressProps) {
  const address = tourAddress(stop.path, host);
  return (
    <span key={stop.path} className="walkthrough-address truncate font-mono text-xs leading-none">
      {address.host ? <span className={address.path ? 'max-sm:hidden' : undefined}>{address.host}</span> : null}
      {address.path}
    </span>
  );
}

/** The active frame and the furthest frame reached, from the note on the reading line. */
function useReadingLine(root: React.RefObject<HTMLDivElement | null>, frameCount: number) {
  const [active, setActive] = useState(0);
  const [reached, setReached] = useState(0);

  useEffect(() => {
    const narrow = window.matchMedia('(max-width: 1079.98px)');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const notes = [...(root.current?.querySelectorAll<HTMLElement>('[data-stop]') ?? [])];
    const first = notes.at(0);
    const last = notes.at(-1);
    if (!first || !last) return;
    let observer: IntersectionObserver | undefined;
    let line = 50;
    // A long scroll or a jump can carry the line clear of the notes between two frames, so no note ever reports crossing it
    const settleEnds = () => {
      const y = (window.innerHeight * line) / 100;
      if (first.getBoundingClientRect().top > y) setActive(0);
      else if (last.getBoundingClientRect().bottom < y) setActive(frameCount - 1);
    };
    const observe = () => {
      observer?.disconnect();
      // The notes run under the pinned frame on phones, so the reading line sits lower there
      line = narrow.matches ? 62 : 50;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.stop));
          }
          settleEnds();
        },
        {rootMargin: `-${line}% 0px -${100 - line}% 0px`},
      );
      for (const note of notes) observer.observe(note);
    };
    observe();
    narrow.addEventListener('change', observe);
    window.addEventListener('scroll', settleEnds, {passive: true});
    return () => {
      narrow.removeEventListener('change', observe);
      window.removeEventListener('scroll', settleEnds);
      observer?.disconnect();
    };
  }, [root, frameCount]);

  useEffect(() => {
    setReached((previous) => Math.max(previous, active));
    for (const note of root.current?.querySelectorAll<HTMLElement>('[data-stop]') ?? []) {
      note.toggleAttribute('data-current', Number(note.dataset.stop) === active);
    }
  }, [root, active]);

  return {active, reached};
}

type PagesProps = {
  frames: TourStop[];
  current: TourStop;
  reached: number;
  optimizedUrls: string[];
};

/** Every page the frame has reached, and the next one, so it is ready to slide in. Stops that share captures share a page and pan within it. */
function Pages({frames, current, reached, optimizedUrls}: PagesProps) {
  const groups = captureGroups(frames);
  const indexOf = (stop: TourStop) => groups.findIndex(({key}) => key === captureKey(stop));
  const currentPage = indexOf(current);
  const lastMounted = indexOf(frames[reached] ?? frames[0]) + 1;
  return DEVICES.map(({key: layer}) =>
    groups.map((group, index) => {
      if (index > lastMounted && index !== currentPage) return null;
      const isCurrent = index === currentPage;
      const shown = isCurrent ? current : group.stops[0];
      return (
        <div
          key={`${layer}-${group.key}`}
          data-layer={layer}
          data-state={isCurrent ? 'active' : index < currentPage ? 'before' : 'after'}
          aria-hidden={!isCurrent || undefined}
          className="walkthrough-page skeleton-host"
        >
          <CaptureSkeleton />
          <PanSurface view={shown.positions[layer]} capture={shown.captures[layer]} atStart={!isCurrent}>
            <CaptureImage
              stop={group.stops[0]}
              device={layer}
              optimized={optimizedUrls.includes(shown.captures[layer].url)}
              zoom={Math.max(...group.stops.map(({positions}) => positions[layer].zoom ?? 1))}
              first={index === 0}
            />
            {group.stops.map((stop) => (
              <Selection key={stop.key} stop={stop} device={layer} on={stop.key === current.key} />
            ))}
          </PanSurface>
        </div>
      );
    }),
  );
}

type TourProps = {
  /** frames[0] is what the frame opens on; frames[i + 1] is the note marked data-stop={i + 1}. */
  frames: TourStop[];
  liveUrl: string | null;
  host: string | null;
  optimizedUrls: string[];
  hero: ReactNode;
  notes: ReactNode;
};

/**
 * The pinned browser and the state behind it. A note on the reading line sets the active stop (an IntersectionObserver, so it also works where scroll
 * timelines do not), the switch sets the device. Everything else is server-rendered: without JavaScript or with reduced motion this frame is hidden
 * by CSS and each note shows its own capture.
 */
export function WalkthroughTour({frames, liveUrl, host, optimizedUrls, hero, notes}: TourProps) {
  const root = useRef<HTMLDivElement>(null);
  const {active, reached} = useReadingLine(root, frames.length);
  const [device, setDevice] = useState<TourDevice | 'auto'>('auto');

  // The frame opens on the desktop captures at every width: that is what the CSS shows before hydration, and a phone can switch to mobile
  useEffect(() => {
    setDevice('desktop');
  }, []);

  const choose = (next: TourDevice) => {
    if (next === device) return;
    const html = document.documentElement;
    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDevice(next);
      return;
    }
    html.classList.add('walkthrough-device-swap');
    const transition = document.startViewTransition(() => flushSync(() => setDevice(next)));
    transition.finished.finally(() => html.classList.remove('walkthrough-device-swap'));
  };

  const current = frames[active] ?? frames[0];
  const href = tourHref(current.path, liveUrl);

  return (
    <div
      ref={root}
      data-device={device}
      className="walkthrough-tour motion-js:lg:grid motion-js:lg:grid-cols-[calc(var(--gutter)+clamp(320px,28vw,400px)+40px)_minmax(0,1fr)]"
    >
      <div className="motion-js:lg:col-start-1 motion-js:lg:row-start-1">{hero}</div>

      <div className="walkthrough-tour-only dot-grid max-lg:contents lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:border-l lg:border-line">
        <figure
          aria-label="The live site, in a browser"
          className="walkthrough-stage z-20 m-0 flex flex-col gap-2 max-lg:border-b max-lg:border-line max-lg:bg-ground max-lg:py-2 max-lg:pl-(--pad-l) max-lg:pr-(--pad-r)"
        >
          <div className="walkthrough-frame flex min-h-0 flex-col overflow-hidden border border-line bg-white shadow-(--shadow-deep)">
            <div className="relative flex min-h-13 shrink-0 items-center gap-3 border-b border-line pr-1.5 pl-3">
              <span aria-hidden="true" className="walkthrough-dots flex gap-1.5 max-lg:hidden">
                <i className="size-2.5 rounded-full bg-line" />
                <i className="size-2.5 rounded-full bg-line" />
                <i className="size-2.5 rounded-full bg-line" />
              </span>
              {href ? (
                <a href={href} rel="noreferrer" className="flex min-h-11 min-w-0 flex-1 items-center gap-2 text-ink no-underline hover:text-accent">
                  <Address stop={current} host={host} />
                  <span className="sr-only">: open {current.heading} on the live site</span>
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    width="12"
                    height="12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    className="shrink-0"
                  >
                    <path d="M7 17 17 7M9 7h8v8" />
                  </svg>
                </a>
              ) : (
                <span className="flex min-w-0 flex-1 text-ink">
                  <Address stop={current} host={host} />
                </span>
              )}
              <DeviceSwitch device={device} onChange={choose} className="shrink-0" />
              <span key={captureKey(current)} aria-hidden="true" className="walkthrough-progress absolute inset-x-0 -bottom-px h-0.5 bg-accent" />
            </div>
            <div data-theme="light" className="walkthrough-viewport relative min-h-0 flex-1 overflow-hidden bg-white">
              <Pages frames={frames} current={current} reached={reached} optimizedUrls={optimizedUrls} />
            </div>
          </div>
        </figure>
      </div>

      <div className="motion-js:lg:col-start-1 motion-js:lg:row-start-2">
        <div className="walkthrough-static-only walkthrough-script-only pt-6 pl-(--pad-l) pr-(--pad-r) md:px-(--gutter)">
          <DeviceSwitch device={device} onChange={choose} className="w-fit" />
        </div>
        {notes}
      </div>
    </div>
  );
}
