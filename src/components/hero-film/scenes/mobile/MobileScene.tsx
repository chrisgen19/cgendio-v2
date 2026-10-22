import type React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Headline, SceneShell, StepLabel} from '../../layout';
import {Appear} from '../../primitives';
import {theme} from '../../theme';

/**
 * Mobile illustrations are authored on a 350 × 400 stage — roughly a phone's
 * real width — so text inside them is drawn at true size (13–18px) instead
 * of being shrunk from the 1000px desktop canvas.
 */
export const STAGE_W = 350;
export const STAGE_H = 400;

/** Space reserved for the overlaid site header and the mobile HUD. */
const PAD_TOP = 84;
const PAD_BOTTOM = 104;
const PAD_X = 20;

export const useMobileLayout = (titleLines: number) => {
  const {width, height} = useVideoConfig();
  const compact = height < 700; // short phones / landscape browser chrome: drop the lede
  const title = Math.round(Math.min(42, Math.max(32, width * 0.105)));
  const lede = 16;
  const textH = 26 + 10 + titleLines * title * 0.98 + (compact ? 0 : 10 + 2 * lede * 1.45);
  const gap = compact ? 14 : 22;
  const stageAvailW = width - PAD_X * 2;
  const stageAvailH = Math.max(160, height - PAD_TOP - PAD_BOTTOM - textH - gap);
  const scale = Math.min(stageAvailW / STAGE_W, stageAvailH / STAGE_H, 1.2);
  return {width, height, compact, title, lede, gap, scale};
};

export const MobileScene: React.FC<{
  n: string;
  label: string;
  title: React.ReactNode;
  titleLines: number;
  lede: string;
  children: React.ReactNode;
}> = ({n, label, title, titleLines, lede, children}) => {
  const M = useMobileLayout(titleLines);
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const push = interpolate(frame, [0, durationInFrames], [1, 1.035]);
  const lift = interpolate(frame, [0, durationInFrames], [10, -6]);

  return (
    <SceneShell number={n} numberSize={Math.round(M.height * 0.42)}>
      <AbsoluteFill
        style={{
          padding: `${PAD_TOP}px ${PAD_X}px ${PAD_BOTTOM}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: M.gap,
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', zIndex: 2}}>
          <Appear delay={8}>
            <StepLabel n={n} label={label} size={12} />
          </Appear>
          <Appear delay={12}>
            <Headline size={M.title}>{title}</Headline>
          </Appear>
          {M.compact ? null : (
            <Appear delay={18}>
              <p style={{margin: 0, fontSize: M.lede, lineHeight: 1.45, color: theme.muted}}>{lede}</p>
            </Appear>
          )}
        </div>

        <div
          style={{
            width: STAGE_W * M.scale,
            height: STAGE_H * M.scale,
            alignSelf: 'center',
            position: 'relative',
            zIndex: 2,
            flex: 'none',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: STAGE_W,
              height: STAGE_H,
              transformOrigin: '0 0',
              transform: `scale(${M.scale}) translate(${STAGE_W / 2}px, ${STAGE_H / 2 + lift}px) scale(${push}) translate(${-STAGE_W / 2}px, ${-STAGE_H / 2}px)`,
            }}
          >
            {children}
          </div>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
