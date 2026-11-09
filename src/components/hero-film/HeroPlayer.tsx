'use client';

import {Player, type PlayerRef} from '@remotion/player';
import type React from 'react';
import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {HeroFilmProps} from './HeroFilm';
import {theme} from './theme';
import {type Chapter, DESKTOP_TIMELINE, FPS, formatTimecode, isPortrait, MOBILE_TIMELINE, type Timeline} from './timeline';

type Size = {width: number; height: number};
type Variant = 'desktop' | 'mobile';

type HeroPlayerProps = {
  /** Anchor or route for the "See my work" button. */
  worksHref?: string;
  /** Rendered over the top of the film (your site header). */
  header?: React.ReactNode;
  className?: string;
  /** Called once, when the Player first plays, renders a new frame or seeks (the static first frame can go). */
  onFirstFrame?: () => void;
};

type FilmComponent = React.FC<HeroFilmProps>;

// Each cut is its own chunk, so a phone never downloads or parses the landscape film (and a desktop never gets the phone cut)
const FILMS: Record<Variant, {load: () => Promise<FilmComponent>; timeline: Timeline}> = {
  desktop: {load: () => import('./HeroFilm').then((m) => m.HeroFilm), timeline: DESKTOP_TIMELINE},
  mobile: {load: () => import('./HeroFilmMobile').then((m) => m.HeroFilmMobile), timeline: MOBILE_TIMELINE},
};

/**
 * Loads the film component for the chosen cut. Returns null until that cut's chunk has arrived (or if it fails to load,
 * in which case the server-rendered first frame simply stays up, since the Player never reports a first frame).
 */
const useFilmComponent = (variant: Variant | null) => {
  const [loaded, setLoaded] = useState<{variant: Variant; component: FilmComponent} | null>(null);
  useEffect(() => {
    if (!variant) return;
    let cancelled = false;
    FILMS[variant]
      .load()
      .then((component) => {
        if (!cancelled) setLoaded({variant, component});
      })
      .catch(() => {
        // Keep the static first frame: a missing film is better than a broken hero
      });
    return () => {
      cancelled = true;
    };
  }, [variant]);
  return loaded?.variant === variant ? loaded.component : null;
};

const PLAYER_STYLE: React.CSSProperties = {width: '100%', height: '100%'};

type FilmPlayerProps = {
  playerRef: React.RefObject<PlayerRef | null>;
  component: FilmComponent;
  inputProps: HeroFilmProps;
  durationInFrames: number;
  width: number;
  height: number;
  autoPlay: boolean;
};

/**
 * The Remotion Player, memoised: HeroPlayer re-renders on every frame to move the HUD, and none of these props change
 * during playback, so the Player tree is left alone and only the composition renders each frame.
 */
const FilmPlayer = memo(function FilmPlayer({playerRef, component, inputProps, durationInFrames, width, height, autoPlay}: FilmPlayerProps) {
  return (
    <Player
      ref={playerRef}
      component={component}
      inputProps={inputProps}
      durationInFrames={durationInFrames}
      fps={FPS}
      compositionWidth={width}
      compositionHeight={height}
      style={PLAYER_STYLE}
      autoPlay={autoPlay}
      loop={false}
      moveToBeginningWhenEnded={false}
      controls={false}
      clickToPlay={false}
      doubleClickToFullscreen={false}
      spaceKeyToPlayOrPause={false}
      initiallyMuted
      acknowledgeRemotionLicense
    />
  );
});

/**
 * Full-bleed, above-the-fold hero that plays the Remotion film once.
 *
 * - Two cuts: the landscape film on desktop, a phone-native ~26s cut on
 *   phones and tall windows. The cut is chosen from the section's size.
 * - The composition is sized to the section in CSS pixels, so it always
 *   fills the hero edge to edge (no letterboxing).
 * - Plays once and holds on the brand card — no loop.
 * - Desktop HUD: chapter chips, timecode, skip, pause/play/replay.
 *   Mobile HUD: story-style segments (tap to jump), chapter label, skip,
 *   pause/play/replay.
 * - Pauses while scrolled away; respects prefers-reduced-motion by opening
 *   on the final card.
 */
export function HeroPlayer({worksHref = '#work', header, className, onFirstFrame}: HeroPlayerProps) {
  const playerRef = useRef<PlayerRef>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  /** The play/pause/replay button: Skip removes itself, so focus moves here instead of falling back to <body>. */
  const toggleRef = useRef<HTMLButtonElement>(null);

  const onFirstFrameRef = useRef(onFirstFrame);
  onFirstFrameRef.current = onFirstFrame;
  const firstFrameSent = useRef(false);
  const notifyFirstFrame = useCallback(() => {
    if (firstFrameSent.current) return;
    firstFrameSent.current = true;
    onFirstFrameRef.current?.();
  }, []);

  const [size, setSize] = useState<Size | null>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  /** True when the visitor paused on purpose — don't auto-resume on scroll. */
  const userPaused = useRef(false);

  const variant: Variant | null = size ? (isPortrait(size.width, size.height) ? 'mobile' : 'desktop') : null;
  const timeline = FILMS[variant ?? 'desktop'].timeline;
  const Film = useFilmComponent(variant);
  const lastFrame = timeline.durationInFrames - 1;

  /* -- measure the section --------------------------------------------- */
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

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  /* -- player events (re-subscribe whenever the Player remounts) ------- */
  // biome-ignore lint/correctness/useExhaustiveDependencies: variant is the Player's key and Film gates its mount, so either changing means a new playerRef to subscribe to
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    setFrame(player.getCurrentFrame());
    setEnded(false);
    // autoPlay starts in the Player's own mount effect, before this listener exists, so read the state instead
    setPlaying(player.isPlaying());

    // The Player fires frameupdate from a useEffect, so setting state right away counts as a nested passive update.
    // When slow frames batch every commit together, React warns "Maximum update depth exceeded"; a microtask runs after the flush.
    const onFrame = (e: {detail: {frame: number}}) => {
      notifyFirstFrame();
      const next = e.detail.frame;
      queueMicrotask(() => {
        setFrame(next);
        if (next < lastFrame) setEnded(false);
      });
    };
    const onPlay = () => {
      notifyFirstFrame();
      setPlaying(true);
    };
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      setEnded(true);
    };

    player.addEventListener('frameupdate', onFrame);
    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);
    player.addEventListener('ended', onEnded);

    if (reducedMotion) {
      player.seekTo(lastFrame);
      setEnded(true);
      notifyFirstFrame();
    }

    return () => {
      player.removeEventListener('frameupdate', onFrame);
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
      player.removeEventListener('ended', onEnded);
    };
  }, [variant, Film, reducedMotion, lastFrame, notifyFirstFrame]);

  /* -- pause while the hero is off screen ------------------------------ */
  // The Player only mounts once the box is measured, so the first callback can arrive before it exists (a deep link
  // to #work, or a restored scroll position). Re-observing on each cut gives the new Player its own first check.
  // biome-ignore lint/correctness/useExhaustiveDependencies: variant is the Player's key and Film gates its mount, so re-run when a new Player mounts
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const player = playerRef.current;
        if (!player) return;
        if (!entry.isIntersecting && player.isPlaying()) player.pause();
        else if (entry.isIntersecting && !userPaused.current && !reducedMotion && !player.isPlaying() && player.getCurrentFrame() < lastFrame) {
          player.play();
        }
      },
      {threshold: 0.25},
    );
    io.observe(el);
    return () => io.disconnect();
  }, [variant, Film, reducedMotion, lastFrame]);

  /* -- controls --------------------------------------------------------- */
  /**
   * Seek, then make sure the film plays. If it was already playing, seekTo() resumes it by itself; calling play()
   * as well leaves the Player's "resume after seek" flag set, and that flag restarts the film from 0 when it ends.
   */
  const seekAndPlay = useCallback((startFrame: number, e?: React.SyntheticEvent) => {
    const player = playerRef.current;
    if (!player) return;
    userPaused.current = false;
    const wasPlaying = player.isPlaying();
    player.seekTo(startFrame);
    if (!wasPlaying) player.play(e);
  }, []);

  const replay = useCallback(
    (e?: React.SyntheticEvent) => {
      setEnded(false);
      seekAndPlay(0, e);
    },
    [seekAndPlay],
  );

  const jumpTo = seekAndPlay;

  const toggle = useCallback(
    (e: React.SyntheticEvent) => {
      const player = playerRef.current;
      if (!player) return;
      if (ended) return replay(e);
      if (player.isPlaying()) {
        userPaused.current = true;
        player.pause();
      } else {
        userPaused.current = false;
        player.play(e);
      }
    },
    [ended, replay],
  );

  const inputProps: HeroFilmProps = useMemo(() => ({worksHref, onReplay: () => replay()}), [worksHref, replay]);

  const atBrand = frame >= timeline.brandStart;
  const current = timeline.chapters.find((c) => frame >= c.startFrame && frame < c.endFrame) ?? null;
  const hud: HudProps = {
    chapters: timeline.chapters,
    current,
    frame,
    durationInFrames: timeline.durationInFrames,
    atBrand,
    ended,
    playing,
    onJump: jumpTo,
    onSkip: (e) => {
      jumpTo(timeline.brandStart, e);
      toggleRef.current?.focus();
    },
    onToggle: toggle,
    toggleRef,
  };

  return (
    <section
      aria-label="Brand film: how I take a website from research to live"
      className={className}
      style={{
        position: 'relative',
        // The page's hero wrapper owns the height (100svh on phones, min(100svh, 980px) on desktop) so its static first frame lines up
        height: '100%',
        minHeight: variant === 'mobile' ? 600 : 640,
        overflow: 'hidden',
        background: theme.stage,
        borderBottom: `1px solid ${theme.line}`,
      }}
    >
      <p className="sr-only">
        A short animated film of my process in six steps — research, design, Figma to web development, QA, deploying to Vercel and going live — ending
        with what Chris Diomampo offers, a link to the work and a replay button.
      </p>

      {/* theme.ts colours follow the site theme through CSS variables; data-film-box lets the visual tests hide the film */}
      <div ref={boxRef} data-film-box style={{position: 'absolute', inset: 0}}>
        {size && variant && Film ? (
          <FilmPlayer
            key={variant}
            playerRef={playerRef}
            component={Film}
            inputProps={inputProps}
            durationInFrames={timeline.durationInFrames}
            width={size.width}
            height={size.height}
            autoPlay={!reducedMotion}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `radial-gradient(circle, ${theme.dot} 1px, transparent 1.3px)`,
              backgroundSize: '26px 26px',
            }}
          />
        )}
      </div>

      {header ? <div className="absolute inset-x-0 top-0 z-20">{header}</div> : null}

      {variant === 'mobile' ? <MobileHud {...hud} /> : variant === 'desktop' ? <DesktopHud {...hud} /> : null}
    </section>
  );
}

/* ====================================================================== */
/* HUDs                                                                    */
/* ====================================================================== */

type HudProps = {
  chapters: Chapter[];
  current: Chapter | null;
  frame: number;
  durationInFrames: number;
  atBrand: boolean;
  ended: boolean;
  playing: boolean;
  onJump: (startFrame: number, e: React.SyntheticEvent) => void;
  onSkip: (e: React.SyntheticEvent) => void;
  onToggle: (e: React.SyntheticEvent) => void;
  toggleRef: React.RefObject<HTMLButtonElement | null>;
};

const iconBtn = 'inline-grid size-11 place-items-center rounded-full border border-line bg-white/90 text-ink backdrop-blur hover:border-ink';

const PlayStateIcon: React.FC<{ended: boolean; playing: boolean}> = ({ended, playing}) =>
  ended ? (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  ) : playing ? (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden="true">
      <path d="M7 4.5v15l13-7.5z" />
    </svg>
  );

const playLabel = (ended: boolean, playing: boolean) => (ended ? 'Replay film' : playing ? 'Pause film' : 'Play film');

const SkipIcon = () => (
  <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
    <path d="M5 5l8 7-8 7M17 5v14" />
  </svg>
);

/** Desktop: chapter chips + timecode + skip + play state, thin progress bar. */
function DesktopHud({chapters, frame, durationInFrames, atBrand, ended, playing, onJump, onSkip, onToggle, toggleRef}: HudProps) {
  const progress = Math.min(1, frame / (durationInFrames - 1));
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 mx-auto flex max-w-site items-center justify-between gap-4 pb-[calc(1.5rem+var(--safe-bottom))] pl-[max(2.5rem,env(safe-area-inset-left,0px))] pr-[max(2.5rem,env(safe-area-inset-right,0px))] xl:pl-[max(3.5rem,env(safe-area-inset-left,0px))] xl:pr-[max(3.5rem,env(safe-area-inset-right,0px))]">
        <div role="group" aria-label="Film chapters" className="pointer-events-auto flex flex-wrap gap-1.5">
          {chapters.map((c) => {
            const active = frame >= c.startFrame && frame < c.endFrame;
            const done = frame >= c.endFrame;
            return (
              <button
                key={c.label}
                type="button"
                aria-current={active ? 'step' : undefined}
                onClick={(e) => onJump(c.startFrame, e)}
                className={[
                  'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[13px] font-medium backdrop-blur transition-colors',
                  active
                    ? 'border-ink bg-ink text-white'
                    : done
                      ? 'border-line bg-white/90 text-ink hover:border-ink'
                      : 'border-line bg-white/90 text-muted hover:border-ink hover:text-ink',
                ].join(' ')}
              >
                {/* Dimmed only on ink and done chips: on upcoming chips the label is already muted, and 70% of muted fails 4.5:1 */}
                <span className={active || done ? 'font-mono text-[11px] opacity-70' : 'font-mono text-[11px]'}>{c.number}</span>
                {c.label}
              </button>
            );
          })}
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <span className="px-2 font-mono text-xs tabular-nums text-muted">
            {formatTimecode(frame)} / {formatTimecode(durationInFrames)}
          </span>
          {!atBrand ? (
            <button
              type="button"
              onClick={onSkip}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white/90 px-4 text-[13px] font-medium text-ink backdrop-blur hover:border-ink"
            >
              Skip intro <SkipIcon />
            </button>
          ) : null}
          <button ref={toggleRef} type="button" onClick={onToggle} aria-label={playLabel(ended, playing)} className={iconBtn}>
            <PlayStateIcon ended={ended} playing={playing} />
          </button>
        </div>
      </div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 z-20 h-[3px] bg-line">
        <div className="h-full origin-left bg-accent" style={{transform: `scaleX(${progress})`}} />
      </div>
    </>
  );
}

/**
 * Mobile: story-style segments, one per chapter, each filling as its scene
 * plays; tap a segment to jump. Above them: the chapter name, Skip and the
 * play state. The brand scene reserves room at the bottom so the HUD never
 * covers its buttons.
 */
function MobileHud({chapters, current, frame, atBrand, ended, playing, onJump, onSkip, onToggle, toggleRef}: HudProps) {
  const label = atBrand ? 'Chris Diomampo' : current ? `${current.number} · ${current.label}` : 'Intro';
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col gap-1 pb-[calc(0.75rem+var(--safe-bottom))] pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))]">
      <div className="flex items-center justify-between gap-3">
        <span aria-live="polite" className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted">
          {label}
        </span>
        <div className="pointer-events-auto flex items-center gap-2">
          {!atBrand ? (
            <button
              type="button"
              onClick={onSkip}
              className="inline-flex h-11 items-center gap-1.5 rounded-full border border-line bg-white/90 px-3.5 text-[13px] font-medium text-ink backdrop-blur"
            >
              Skip <SkipIcon />
            </button>
          ) : null}
          <button ref={toggleRef} type="button" onClick={onToggle} aria-label={playLabel(ended, playing)} className={iconBtn}>
            <PlayStateIcon ended={ended} playing={playing} />
          </button>
        </div>
      </div>

      <div role="group" aria-label="Film chapters" className="pointer-events-auto flex gap-1.5">
        {chapters.map((c) => {
          const fill = Math.max(0, Math.min(1, (frame - c.startFrame) / (c.endFrame - c.startFrame)));
          const active = frame >= c.startFrame && frame < c.endFrame;
          return (
            <button
              key={c.label}
              type="button"
              onClick={(e) => onJump(c.startFrame, e)}
              aria-label={`Jump to ${c.label}`}
              aria-current={active ? 'step' : undefined}
              // The bar stays 32px tall; the ::after reaches down through the HUD's own bottom padding for a 44px target
              className="group relative flex h-8 flex-1 items-center after:absolute after:inset-x-0 after:top-0 after:-bottom-3 after:content-['']"
            >
              <span className="relative block h-1 w-full overflow-hidden rounded-full bg-line">
                <span
                  className={`absolute inset-0 origin-left rounded-full ${active ? 'bg-accent' : 'bg-ink'}`}
                  style={{transform: `scaleX(${fill})`}}
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
