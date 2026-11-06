'use client';

import {Player, type PlayerRef} from '@remotion/player';
import type React from 'react';
import {type CSSProperties, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {isPortrait} from '@/components/hero-film/timeline';
import {useLabFlags} from './lab-flags';
import {LAB_FPS} from './motion';

/** Props every lab film composition receives. */
export type LabFilmProps = {
  /** Anchor or route for "See my work". */
  worksHref: string;
  /** Restarts the film from frame 0 (for an in-film "Replay" button). */
  onReplay: () => void;
};

export type FilmCut = {
  component: React.ComponentType<LabFilmProps>;
  durationInFrames: number;
};

type Size = {width: number; height: number};
type Variant = 'desktop' | 'mobile';

type FilmPlayerProps = {
  desktop: FilmCut;
  mobile: FilmCut;
  /** Accessible name of the film region. */
  label: string;
  /** Screen-reader summary of what the film shows. */
  description: string;
  worksHref?: string;
  /** Background behind the Player (also shown before it mounts). */
  stageBackground?: string;
  /**
   * HUD colours, as CSS custom properties: --hud-bg, --hud-fg, --hud-line, --hud-accent, --hud-track.
   * Defaults follow the site tokens (and so the site's dark mode).
   */
  hudStyle?: CSSProperties;
};

const HUD_DEFAULTS = {
  '--hud-bg': 'var(--color-white)',
  '--hud-fg': 'var(--color-ink)',
  '--hud-line': 'var(--color-line)',
  '--hud-accent': 'var(--color-accent)',
  '--hud-track': 'var(--color-line)',
} as CSSProperties;

/**
 * Lab version of the hero Player. Same sizing and cut selection as src/components/hero-film/HeroPlayer.tsx, with
 * the fixes from the audit:
 * - the frame never lives in this component's state (the HUD reads it through Player events and writes the
 *   progress bar straight to the DOM), so the Player's parent doesn't re-render 30 times a second;
 * - a solid HUD (no backdrop-blur over moving frames);
 * - `?f=<frame>` seeks and pauses, `?rm=1` simulates reduced motion (the film opens on its last frame, paused).
 */
export function FilmPlayer({desktop, mobile, label, description, worksHref = '#work', stageBackground, hudStyle}: FilmPlayerProps) {
  const playerRef = useRef<PlayerRef>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const userPaused = useRef(false);
  const flags = useLabFlags();
  const [size, setSize] = useState<Size | null>(null);

  const variant: Variant | null = size ? (isPortrait(size.width, size.height) ? 'mobile' : 'desktop') : null;
  const cut = variant === 'mobile' ? mobile : desktop;
  const lastFrame = cut.durationInFrames - 1;
  const reducedMotion = flags?.reducedMotion ?? false;
  const stillFrame = flags?.frame ?? null;

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    let raf = 0;
    const ro = new ResizeObserver(([entry]) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const width = Math.max(320, Math.round(entry.contentRect.width));
        const height = Math.max(560, Math.round(entry.contentRect.height));
        setSize((prev) => (prev && prev.width === width && prev.height === height ? prev : {width, height}));
      });
    });
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  /** Open on a fixed frame (screenshots) or on the final frame (reduced motion). */
  // biome-ignore lint/correctness/useExhaustiveDependencies: variant is the Player's key, so a new cut needs the seek again
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (stillFrame !== null) player.seekTo(Math.min(stillFrame, lastFrame));
    else if (reducedMotion) player.seekTo(lastFrame);
  }, [variant, stillFrame, reducedMotion, lastFrame]);

  /** Pause while scrolled away; resume unless the visitor paused on purpose. */
  // biome-ignore lint/correctness/useExhaustiveDependencies: variant is the Player's key, so observe again for a new Player
  useEffect(() => {
    const el = boxRef.current;
    if (!el || reducedMotion || stillFrame !== null) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const player = playerRef.current;
        if (!player) return;
        if (!entry.isIntersecting && player.isPlaying()) player.pause();
        else if (entry.isIntersecting && !userPaused.current && !player.isPlaying() && player.getCurrentFrame() < lastFrame) player.play();
      },
      {threshold: 0.25},
    );
    io.observe(el);
    return () => io.disconnect();
  }, [variant, reducedMotion, stillFrame, lastFrame]);

  const replay = useCallback((e?: React.SyntheticEvent) => {
    const player = playerRef.current;
    if (!player) return;
    userPaused.current = false;
    const wasPlaying = player.isPlaying();
    player.seekTo(0);
    if (!wasPlaying) player.play(e);
  }, []);

  const inputProps: LabFilmProps = useMemo(() => ({worksHref, onReplay: () => replay()}), [worksHref, replay]);
  const ready = size !== null && variant !== null && flags !== null;

  return (
    <section
      aria-label={label}
      className="relative h-full overflow-hidden"
      style={{...HUD_DEFAULTS, ...hudStyle, background: stageBackground ?? 'var(--film-stage, #FFFFFF)'}}
    >
      <p className="sr-only">{description}</p>
      <div ref={boxRef} data-film-box className="absolute inset-0">
        {ready ? (
          <Player
            key={variant}
            ref={playerRef}
            component={cut.component}
            inputProps={inputProps}
            durationInFrames={cut.durationInFrames}
            fps={LAB_FPS}
            compositionWidth={size.width}
            compositionHeight={size.height}
            style={{width: '100%', height: '100%'}}
            autoPlay={!reducedMotion && stillFrame === null}
            loop={false}
            moveToBeginningWhenEnded={false}
            controls={false}
            clickToPlay={false}
            doubleClickToFullscreen={false}
            spaceKeyToPlayOrPause={false}
            initiallyMuted
            acknowledgeRemotionLicense
          />
        ) : null}
      </div>
      {ready ? <FilmHud key={variant} playerRef={playerRef} lastFrame={lastFrame} userPaused={userPaused} onReplay={replay} /> : null}
    </section>
  );
}

type FilmHudProps = {
  playerRef: React.RefObject<PlayerRef | null>;
  lastFrame: number;
  userPaused: React.RefObject<boolean>;
  onReplay: (e?: React.SyntheticEvent) => void;
};

/** Play/pause/replay plus a thin progress line. Only this component re-renders on play state changes. */
function FilmHud({playerRef, lastFrame, userPaused, onReplay}: FilmHudProps) {
  const barRef = useRef<HTMLSpanElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const paint = (frame: number) => {
      if (barRef.current) barRef.current.style.transform = `scaleX(${Math.min(1, frame / lastFrame)})`;
    };
    paint(player.getCurrentFrame());
    setPlaying(player.isPlaying());
    // The Player fires frameupdate from an effect; deferring the state update avoids nested-update warnings
    const onFrame = (e: {detail: {frame: number}}) => {
      const frame = e.detail.frame;
      paint(frame);
      queueMicrotask(() => setEnded(frame >= lastFrame));
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      setEnded(true);
    };
    player.addEventListener('frameupdate', onFrame);
    player.addEventListener('seeked', onFrame);
    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);
    player.addEventListener('ended', onEnded);
    return () => {
      player.removeEventListener('frameupdate', onFrame);
      player.removeEventListener('seeked', onFrame);
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
      player.removeEventListener('ended', onEnded);
    };
  }, [playerRef, lastFrame]);

  const toggle = (e: React.SyntheticEvent) => {
    const player = playerRef.current;
    if (!player) return;
    if (ended) return onReplay(e);
    if (player.isPlaying()) {
      userPaused.current = true;
      player.pause();
    } else {
      userPaused.current = false;
      player.play(e);
    }
  };

  const labelText = ended ? 'Replay film' : playing ? 'Pause film' : 'Play film';

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label={labelText}
        className="absolute right-4 bottom-4 z-20 inline-grid size-11 place-items-center rounded-full border border-(--hud-line) bg-(--hud-bg) text-(--hud-fg) hover:border-(--hud-fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--hud-accent) md:right-8 md:bottom-6"
      >
        <PlayStateIcon ended={ended} playing={playing} />
      </button>
      <span aria-hidden className="absolute inset-x-0 bottom-0 z-20 block h-[3px] bg-(--hud-track)">
        <span ref={barRef} className="block h-full origin-left bg-(--hud-accent)" style={{transform: 'scaleX(0)'}} />
      </span>
    </>
  );
}

function PlayStateIcon({ended, playing}: {ended: boolean; playing: boolean}) {
  if (ended) {
    return (
      <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    );
  }
  if (playing) {
    return (
      <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden="true">
        <rect x="6" y="5" width="4" height="14" rx="1" />
        <rect x="14" y="5" width="4" height="14" rx="1" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden="true">
      <path d="M7 4.5v15l13-7.5z" />
    </svg>
  );
}
