import Image from 'next/image';
import type {CSSProperties} from 'react';
import {AboutGuides} from './about-guides';
import {AboutPin, type PinPlace} from './about-pin';
import {ABOUT_COPY, type AboutPinKey} from './copy';

type AboutCanvasProps = {
  photoUrl: string | null;
  alt: string;
  /** R2 uploads go through the image optimizer, like CoverImage; any other host is shown as is */
  optimizable: boolean;
};

/** Pins sit on quiet parts of the photo (the wall, the office, the shoulders), never on the face. */
const PLACES: Record<AboutPinKey, PinPlace> = {
  timezone: {x: '76%', y: '9%', mx: '76%', my: '17%', side: 'right'},
  experience: {x: '5%', y: '27%', side: 'left'},
  sites: {x: '97%', y: '50%', mx: '97%', my: '52%', side: 'right'},
  role: {x: '68%', y: '87%', mx: '66%', my: '90%', side: 'right'},
};

/** The pins drop clockwise from the top right */
const PIN_ORDER: AboutPinKey[] = ['timezone', 'sites', 'role', 'experience'];

const HANDLES = ['top-0 left-0', 'top-0 left-full', 'top-full left-full', 'top-full left-0'];

/**
 * The design-tool canvas: the portrait as a selected frame on the dot grid, with its name, selection handles, redline
 * guides to the canvas edges and comment pins. The frame's box lives in CSS variables (--fx/--fy/--fw/--fh) so the
 * guides can reach it. Everything but the photo is aria-hidden: the inspect panel beside it carries the same facts.
 */
export function AboutCanvas({photoUrl, alt, optimizable}: AboutCanvasProps) {
  const pins = ABOUT_COPY.rows.filter((row) => row.pinKey !== undefined);

  return (
    <div
      data-canvas
      className="dot-grid relative min-h-[660px] overflow-hidden [--fh:500px] [--fw:400px] [--fx:calc(50%_-_210px)] [--fy:calc(50%_-_250px)] max-md:min-h-[400px] max-md:[--fh:270px] max-md:[--fw:216px] max-md:[--fx:20px] max-md:[--fy:64px]"
    >
      <AboutGuides />
      <div data-frame className="absolute top-(--fy) left-(--fx) h-(--fh) w-(--fw)">
        <div className="relative grid size-full place-items-center overflow-hidden bg-tint">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={alt}
              fill
              sizes="(max-width: 860px) 216px, 400px"
              unoptimized={!optimizable}
              className="object-cover object-[50%_40%]"
            />
          ) : (
            <span className="font-mono text-[14px] text-accent">{ABOUT_COPY.photoPlaceholder}</span>
          )}
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span className="about-wipe absolute bottom-full left-0 mb-2 font-mono text-xs leading-none font-medium whitespace-nowrap text-accent">
            {ABOUT_COPY.frameLabel}
          </span>
          <span className="about-snap absolute -inset-px border-[1.5px] border-accent">
            {HANDLES.map((at, i) => (
              <span
                key={at}
                style={{'--i': i} as CSSProperties}
                className={`about-handle absolute size-2.5 -translate-1/2 border-[1.5px] border-accent bg-white ${at}`}
              />
            ))}
          </span>
        </div>
        <div aria-hidden="true">
          {pins.map(({pinKey, pin = '', note = ''}) =>
            pinKey ? (
              <AboutPin key={pinKey} pinKey={pinKey} label={pin} note={note} place={PLACES[pinKey]} index={PIN_ORDER.indexOf(pinKey)} />
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
}
