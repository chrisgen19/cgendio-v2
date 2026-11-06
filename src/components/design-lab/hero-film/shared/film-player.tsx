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

export type FilmChapter = {
  label: string;
  /** First frame of the chapter; it runs until the next chapter starts (or the film's rest frame). */
  startFrame: number;
};

export type FilmCut = {
  component: React.ComponentType<LabFilmProps>;
  durationInFrames: number;
  /** Optional chapter navigation (chips on desktop, segments on phones) plus a Skip button. */
  chapters?: FilmChapter[];
  /** Where Skip jumps to and where the last chapter ends: the first frame of the final rest scene. */
  restFrame?: number;
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

  /**
   * Seek, then make sure the film plays. If it was already playing, seekTo() resumes it by itself; calling play()
   * as well would leave the Player's "resume after seek" flag set (see HeroPlayer.tsx).
   */
  const seekAndPlay = useCallback((frame: number, e?: React.SyntheticEvent) => {
    const player = playerRef.current;
    if (!player) return;
    userPaused.current = false;
    const wasPlaying = player.isPlaying();
    player.seekTo(frame);
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
      {ready ? (
        <FilmHud
          key={variant}
          variant={variant}
          playerRef={playerRef}
          lastFrame={lastFrame}
          chapters={cut.chapters}
          restFrame={cut.restFrame ?? lastFrame}
          userPaused={userPaused}
          onReplay={replay}
          onJump={seekAndPlay}
        />
      ) : null}
    </section>
  );
}

type FilmHudProps = {
  variant: Variant;
  playerRef: React.RefObject<PlayerRef | null>;
  lastFrame: number;
  chapters?: FilmChapter[];
  restFrame: number;
  userPaused: React.RefObject<boolean>;
  onReplay: (e?: React.SyntheticEvent) => void;
  onJump: (frame: number, e?: React.SyntheticEvent) => void;
};

/** Index of the chapter playing at `frame`; -1 before the first one, chapters.length once the rest scene starts. */
const chapterAt = (chapters: FilmChapter[], restFrame: number, frame: number) => {
  if (frame >= restFrame) return chapters.length;
  let index = -1;
  for (let i = 0; i < chapters.length; i++) if (frame >= chapters[i].startFrame) index = i;
  return index;
};

/**
 * Play/pause/replay, a thin progress line and, when the cut has chapters, chapter navigation and Skip.
 * Only this component re-renders, and only when the play state or the current chapter changes.
 */
function FilmHud({variant, playerRef, lastFrame, chapters, restFrame, userPaused, onReplay, onJump}: FilmHudProps) {
  const barRef = useRef<HTMLSpanElement>(null);
  const segmentRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [chapter, setChapter] = useState(-1);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const paint = (frame: number) => {
      if (barRef.current) barRef.current.style.transform = `scaleX(${Math.min(1, frame / lastFrame)})`;
      chapters?.forEach((c, i) => {
        const end = chapters[i + 1]?.startFrame ?? restFrame;
        const fill = Math.max(0, Math.min(1, (frame - c.startFrame) / (end - c.startFrame)));
        const el = segmentRefs.current[i];
        if (el) el.style.transform = `scaleX(${fill})`;
      });
    };
    paint(player.getCurrentFrame());
    setPlaying(player.isPlaying());
    if (chapters) setChapter(chapterAt(chapters, restFrame, player.getCurrentFrame()));
    // The Player fires frameupdate from an effect; deferring the state update avoids nested-update warnings
    const onFrame = (e: {detail: {frame: number}}) => {
      const frame = e.detail.frame;
      paint(frame);
      queueMicrotask(() => {
        setEnded(frame >= lastFrame);
        if (chapters) setChapter(chapterAt(chapters, restFrame, frame));
      });
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
  }, [playerRef, lastFrame, chapters, restFrame]);

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

  const atRest = chapters ? chapter >= chapters.length : true;
  const skip = (e: React.SyntheticEvent) => {
    onJump(restFrame, e);
    // Skip removes itself, so keep focus on the play state button instead of dropping it to <body>
    toggleRef.current?.focus();
  };

  return (
    <>
      {chapters ? (
        <ChapterNav variant={variant} chapters={chapters} current={chapter} atRest={atRest} segmentRefs={segmentRefs} onJump={onJump} onSkip={skip} />
      ) : null}
      <button
        ref={toggleRef}
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

type ChapterNavProps = {
  variant: Variant;
  chapters: FilmChapter[];
  current: number;
  atRest: boolean;
  segmentRefs: React.RefObject<(HTMLSpanElement | null)[]>;
  onJump: (frame: number, e?: React.SyntheticEvent) => void;
  onSkip: (e: React.SyntheticEvent) => void;
};

/** Shape and focus only; colours come from HUD_IDLE or the active chip's classes, so they never compete. */
const hudButton =
  'inline-flex h-11 items-center gap-2 rounded-full border px-4 text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--hud-accent)';
const HUD_IDLE = 'border-(--hud-line) bg-(--hud-bg) text-(--hud-fg) hover:border-(--hud-fg)';

/** Desktop: numbered chapter chips and Skip. Phones: one tappable segment per chapter, the chapter name and Skip. */
function ChapterNav({variant, chapters, current, atRest, segmentRefs, onJump, onSkip}: ChapterNavProps) {
  const skipButton = atRest ? null : (
    <button type="button" onClick={onSkip} className={`${hudButton} ${HUD_IDLE}`}>
      Skip <SkipIcon />
    </button>
  );

  if (variant === 'mobile') {
    const label = atRest ? 'cgdiomampo.dev' : current >= 0 ? `${String(current + 1).padStart(2, '0')} ${chapters[current].label}` : 'Intro';
    return (
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col gap-1 pr-[72px] pb-3 pl-4">
        <div className="flex items-center justify-between gap-3">
          <span aria-live="polite" className="font-mono text-[12px] tracking-[0.08em] text-(--hud-fg) uppercase opacity-70">
            {label}
          </span>
          <div className="pointer-events-auto">{skipButton}</div>
        </div>
        {/* biome-ignore lint/a11y/useSemanticElements: a group of playback buttons, not a form; fieldset would imply form semantics (same as HeroPlayer) */}
        <div role="group" aria-label="Film chapters" className="pointer-events-auto flex gap-1.5">
          {chapters.map((c, i) => (
            <button
              key={c.label}
              type="button"
              onClick={(e) => onJump(c.startFrame, e)}
              aria-label={`Jump to ${c.label}`}
              aria-current={i === current ? 'step' : undefined}
              className="flex h-8 flex-1 items-center focus-visible:outline-2 focus-visible:outline-(--hud-accent)"
            >
              <span className="relative block h-1 w-full overflow-hidden rounded-full bg-(--hud-track)">
                <span
                  ref={(el) => {
                    segmentRefs.current[i] = el;
                  }}
                  className="absolute inset-0 origin-left rounded-full bg-(--hud-accent)"
                  style={{transform: 'scaleX(0)'}}
                />
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-4 pr-[96px] pb-6 pl-8 xl:pl-14">
      {/* biome-ignore lint/a11y/useSemanticElements: a group of playback buttons, not a form; fieldset would imply form semantics (same as HeroPlayer) */}
      <div role="group" aria-label="Film chapters" className="pointer-events-auto flex flex-wrap gap-1.5">
        {chapters.map((c, i) => {
          const active = i === current;
          const done = i < current;
          return (
            <button
              key={c.label}
              type="button"
              aria-current={active ? 'step' : undefined}
              onClick={(e) => onJump(c.startFrame, e)}
              className={`${hudButton} ${active ? 'border-(--hud-fg) bg-(--hud-fg) text-(--hud-bg)' : `${HUD_IDLE}${done ? '' : ' opacity-80'}`}`}
            >
              <span className="font-mono text-[11px] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              {c.label}
            </button>
          );
        })}
      </div>
      <div className="pointer-events-auto">{skipButton}</div>
    </div>
  );
}

function SkipIcon() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
      <path d="M5 5l8 7-8 7M17 5v14" />
    </svg>
  );
}
