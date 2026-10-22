import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Headline, SceneShell, useLayout} from '../layout';
import {Appear, Mark, MonoLabel, Pop} from '../primitives';
import {fonts, theme} from '../theme';

/** Cold open: the hook line, set up like the first card of an ad. */
export const Intro: React.FC = () => {
  const L = useLayout();
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const size = L.portrait ? Math.min(52, L.width * 0.12) : Math.round(Math.min(128, L.width * 0.085));
  const float = interpolate(frame, [0, durationInFrames], [0, -24]);

  return (
    <SceneShell sweep={false}>
      {/* floating geometry */}
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${float}px)`}}>
        <Pop delay={14} style={{position: 'absolute', left: '9%', top: '22%'}}>
          <div style={{width: 120, height: 120, borderRadius: '50%', border: `2px solid ${theme.accent}`}} />
        </Pop>
        <Pop delay={20} style={{position: 'absolute', right: '11%', top: '18%'}}>
          <div style={{width: 64, height: 64, background: theme.lime, borderRadius: 14, transform: 'rotate(14deg)'}} />
        </Pop>
        <Pop delay={26} style={{position: 'absolute', right: '16%', bottom: '22%'}}>
          <div style={{width: 180, height: 180, borderRadius: '50%', background: theme.tint}} />
        </Pop>
        {L.portrait ? null : (
          <Appear delay={32} style={{position: 'absolute', left: L.padX, bottom: L.padBottom + 8}}>
            <MonoLabel size={13}>{'// research → design → code → qa → deploy → live'}</MonoLabel>
          </Appear>
        )}
      </div>

      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: `0 ${L.padX}px`,
          gap: L.portrait ? 18 : 26,
        }}
      >
        <Appear delay={6}>
          <MonoLabel size={L.step} style={{letterSpacing: '0.14em', textTransform: 'uppercase'}}>
            Cgdiomampo.dev presents
          </MonoLabel>
        </Appear>
        <Headline size={size} style={{maxWidth: 1100}}>
          <Appear delay={10}>Great websites</Appear>
          <Appear delay={18}>
            don&apos;t happen <Mark delay={40}>by accident.</Mark>
          </Appear>
        </Headline>
        <Appear delay={30}>
          <p style={{margin: 0, maxWidth: 520, fontSize: L.lede, lineHeight: 1.55, color: theme.muted, fontFamily: fonts.body}}>
            Here&apos;s how we take an idea from first question to a live URL — in about thirty seconds.
          </p>
        </Appear>
      </AbsoluteFill>
    </SceneShell>
  );
};
