import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Headline, SceneShell, StepLabel, useLayout} from '../layout';
import {Appear, Check, Mark} from '../primitives';
import {fonts, theme} from '../theme';

export type BrandProps = {
  /** Where "See my works" goes. */
  worksHref?: string;
  /** Wired by the page player; absent when rendering an MP4. */
  onReplay?: () => void;
};

const services = [
  {n: '01 · BUILD', title: 'WordPress & WooCommerce', desc: 'Custom themes, stores and integrations your team can run day to day.'},
  {n: '02 · BUILD', title: 'Next.js & React', desc: "Typed, component-driven sites and apps, deployed on Vercel's edge."},
  {n: '03 · EVOLVE', title: 'Migrations & redesigns', desc: 'Change platforms or refresh the look without losing rankings or content.'},
];

const benefits = ['Research to launch, one team', 'Accessible & SEO-ready', 'Clean code you can grow', 'Care after go-live'];

const btnBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  minHeight: 52,
  padding: '0 24px',
  borderRadius: 999,
  fontFamily: fonts.body,
  fontWeight: 600,
  fontSize: 15,
  lineHeight: 1,
  textDecoration: 'none',
  cursor: 'pointer',
  border: '1px solid transparent',
};

/** Phone sizing: both buttons fit on one row and stay ≥ 44px tall. */
const compact: React.CSSProperties = {minHeight: 46, padding: '0 16px', fontSize: 14, gap: 8};

const Arrow = () => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const ReplayIcon = () => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

/** Final card: the brand, what we do, what clients get — and the two exits. */
export const Brand: React.FC<BrandProps> = ({worksHref = '#work', onReplay}) => {
  const L = useLayout();
  // Short phones (e.g. 360×640, or a tall browser toolbar): keep the brand line, services and buttons; drop the rest.
  const short = L.portrait && L.height < 720;
  const narrow = L.width < 380;
  const titleSize = L.portrait ? Math.min(40, L.width * 0.1) : Math.round(Math.min(78, Math.max(44, L.width * 0.052)));

  return (
    <SceneShell number=".dev" numberSize={Math.round(L.height * 0.5)} sweep={false}>
      <AbsoluteFill
        style={{
          padding: `${L.padTop - 8}px ${L.padX}px ${L.padBottom - 8}px`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{width: L.innerW, display: 'flex', flexDirection: 'column', gap: L.portrait ? 14 : 24}}>
          <Appear delay={14}>
            <StepLabel n="cg" label="Cgdiomampo.dev · Web studio" size={L.step} />
          </Appear>
          <Appear delay={19}>
            <Headline size={titleSize} style={{maxWidth: 1100}}>
              We design, build &amp; ship websites that <Mark delay={42}>work.</Mark>
            </Headline>
          </Appear>
          {short ? null : (
          <Appear delay={25}>
            <p style={{margin: 0, maxWidth: 640, fontSize: L.lede, lineHeight: 1.55, color: theme.muted}}>
              One team from first question to live URL. WordPress, WooCommerce, Next.js and React — built for the people who&apos;ll actually use them.
            </p>
          </Appear>
          )}

          <div style={{display: 'grid', gridTemplateColumns: L.portrait ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: L.portrait ? 8 : 14}}>
            {services.map((s, i) => (
              <Appear key={s.title} delay={30 + i * 4}>
                <div
                  style={{
                    background: theme.white,
                    border: `1px solid ${theme.line}`,
                    borderRadius: 22,
                    boxShadow: theme.shadow,
                    padding: short ? '11px 16px' : L.portrait ? '14px 18px' : '20px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  {L.portrait ? null : <span style={{fontFamily: fonts.mono, fontSize: 12, color: theme.accent}}>{s.n}</span>}
                  <span style={{fontFamily: fonts.display, fontSize: short ? 17 : L.portrait ? 19 : 22, fontWeight: 700, letterSpacing: '-0.02em'}}>{s.title}</span>
                  {L.portrait ? null : <span style={{fontSize: 14, lineHeight: 1.5, color: theme.muted}}>{s.desc}</span>}
                </div>
              </Appear>
            ))}
          </div>

          {short ? null : (
          <Appear delay={44} style={{display: 'flex', flexWrap: 'wrap', gap: L.portrait ? '8px 16px' : '10px 26px'}}>
            {benefits.map((b) => (
              <span key={b} style={{display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: L.portrait ? 13 : 15, fontWeight: 500}}>
                <Check size={20} dark />
                {b}
              </span>
            ))}
          </Appear>
          )}

          <Appear delay={52} style={{display: 'flex', flexWrap: 'wrap', gap: L.portrait ? 8 : 12}}>
            <a href={worksHref} style={{...btnBase, ...(L.portrait ? compact : null), background: theme.ink, color: '#fff'}}>
              See my works <Arrow />
            </a>
            <button
              type="button"
              onClick={onReplay}
              disabled={!onReplay}
              style={{...btnBase, ...(L.portrait ? compact : null), background: '#fff', color: theme.ink, borderColor: theme.line}}
            >
              <ReplayIcon />
              {narrow ? 'Replay' : 'Replay the film'}
            </button>
          </Appear>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
