import type React from 'react';
import {fonts, theme} from '@/components/hero-film/theme';
import {Arrive, Fade, Progress, Swap, Wipe} from './bits';
import type {CutSpec, Rect} from './layout';
import {PageMock} from './page-mock';

const GREEN = '#16A34A';

type SectionProps = {rect: Rect; n: string; label: string; heading: string; compact: boolean; children: React.ReactNode};

/** A section of the board: a tab above it and a heading that was written before the work arrived. */
export const Section: React.FC<SectionProps> = ({rect, n, label, heading, compact, children}) => (
  <>
    <div
      style={{
        position: 'absolute',
        left: rect.x + 4,
        top: rect.y - 46,
        display: 'flex',
        gap: 14,
        fontFamily: fonts.mono,
        fontWeight: 500,
        fontSize: 22,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      <span style={{color: theme.accent}}>{n}</span>
      <span style={{color: theme.muted}}>{label}</span>
    </div>
    <div
      style={{
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        boxSizing: 'border-box',
        padding: compact ? 28 : 32,
        background: theme.surface,
        border: `2px solid ${theme.line}`,
        borderRadius: 28,
        boxShadow: theme.shadow,
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? 20 : 22,
      }}
    >
      <div
        style={{
          margin: 0,
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: compact ? 38 : 40,
          lineHeight: 1.02,
          letterSpacing: '-0.035em',
          color: theme.ink,
          textWrap: 'balance',
        }}
      >
        {heading}
      </div>
      {children}
    </div>
  </>
);

const PERSONAS = [
  {name: 'Recruiter', need: 'Wants proof of skill, fast.', bg: theme.lime, fg: theme.onLime, rot: -1},
  {name: 'Client', need: 'Wants it live, on brand and on budget.', bg: theme.tint, fg: theme.ink, rot: 0.8},
  {name: 'Visitor', need: 'Wants it to load and make sense.', bg: theme.surface, fg: theme.ink, rot: -0.6},
];
const RESEARCH_TAGS = ['Goals', 'Audiences', 'Competitors', 'Analytics'];

/** Station 1: three empty sticky slots fill with the people the site is for. */
export const ResearchBody: React.FC<{cut: CutSpec}> = ({cut}) => {
  const h = cut.compact ? 104 : 92;
  return (
    <>
      <div style={{display: 'flex', flexDirection: 'column', gap: cut.compact ? 12 : 14}}>
        {PERSONAS.map((p, i) => (
          <div key={p.name} style={{position: 'relative', height: h}}>
            <Fade at={cut.t.s1 + i * 5} style={{position: 'absolute', inset: 0, borderRadius: 8, border: `2px dashed ${theme.line}`}} />
            <Arrive at={cut.t.s1 + i * 5} y={18} style={{position: 'absolute', inset: 0}}>
              {/* Only the paper is tilted: rotated text renders with uneven baselines at every camera scale */}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  rotate: `${p.rot}deg`,
                  borderRadius: 8,
                  background: p.bg,
                  border: p.bg === theme.surface ? `2px solid ${theme.line}` : 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div
                style={{
                  position: 'relative',
                  height: '100%',
                  boxSizing: 'border-box',
                  color: p.fg,
                  padding: cut.compact ? '12px 20px' : '14px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                <span style={{fontFamily: fonts.display, fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em', lineHeight: 1.05}}>{p.name}</span>
                <span style={{fontFamily: fonts.body, fontSize: cut.compact ? 20 : 19, lineHeight: 1.25}}>{p.need}</span>
              </div>
            </Arrive>
          </div>
        ))}
      </div>
      {cut.t.s1Tags === null ? null : (
        <div style={{display: 'flex', gap: 6}}>
          {RESEARCH_TAGS.map((tag, i) => (
            <Arrive key={tag} at={(cut.t.s1Tags ?? 0) + i * 3} dur={10} y={8}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '6px 11px',
                  borderRadius: 999,
                  border: `1.5px solid ${theme.line}`,
                  background: theme.surface,
                  fontFamily: fonts.mono,
                  fontWeight: 500,
                  fontSize: 15,
                  color: theme.ink,
                }}
              >
                {tag}
              </span>
            </Arrive>
          ))}
        </div>
      )}
    </>
  );
};

/** Station 2: the wireframe that was already on the board fills into the styled page. */
export const WireframeBody: React.FC<{cut: CutSpec; w: number; h: number}> = ({cut, w, h}) => (
  <div style={{borderRadius: 14, border: `2px solid ${theme.line}`, overflow: 'hidden', width: w, height: h}}>
    <PageMock w={w - 4} h={h - 4} fillAt={cut.t.s2} />
  </div>
);

const CHECKS = ['Responsive at every breakpoint', 'Accessibility (WCAG 2.2 AA)', 'Core Web Vitals'];

const Tick: React.FC<{size: number; bg: string; fg: string}> = ({size, bg, fg}) => (
  <span style={{width: size, height: size, flex: 'none', borderRadius: '50%', background: bg, color: fg, display: 'grid', placeItems: 'center'}}>
    <svg aria-hidden="true" viewBox="0 0 24 24" width={size * 0.58} height={size * 0.58} fill="none" stroke="currentColor" strokeWidth={3.2}>
      <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

/** Station 3: the same page, built, in a browser; the deploy goes green and the launch checks tick. */
export const LiveBody: React.FC<{cut: CutSpec; w: number; browserH: number}> = ({cut, w, browserH}) => {
  const {t, compact} = cut;
  const chrome = compact ? 40 : 44;
  const pageH = browserH - chrome - 4;
  return (
    <>
      <div style={{position: 'relative', width: w, height: browserH}}>
        <div
          style={{
            width: w,
            height: browserH,
            boxSizing: 'border-box',
            borderRadius: 14,
            border: `2px solid ${theme.line}`,
            background: theme.surface,
            overflow: 'hidden',
          }}
        >
          <div style={{height: chrome, display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px', boxSizing: 'border-box'}}>
            <span style={{display: 'flex', gap: 6}}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{width: 10, height: 10, borderRadius: '50%', background: theme.windowDot}} />
              ))}
            </span>
            <span
              style={{
                flex: 1,
                height: chrome - 14,
                borderRadius: 999,
                background: theme.field,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 12px',
                fontFamily: fonts.mono,
                fontSize: compact ? 15 : 16,
                color: theme.ink,
              }}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" width={14} height={14} fill="none" stroke={theme.muted} strokeWidth={2.4}>
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              <span style={{flex: 1}}>your-site.com</span>
              <Swap
                at={t.s3Page}
                before={<span style={{color: theme.muted}}>Building</span>}
                after={
                  <span style={{display: 'flex', alignItems: 'center', gap: 6}}>
                    <span style={{width: 9, height: 9, borderRadius: '50%', background: GREEN}} />
                    Ready
                  </span>
                }
              />
            </span>
          </div>
          <Progress at={t.s3Bar} end={t.s3Page} color={theme.accent} height={4} />
          <div style={{position: 'relative', height: pageH}}>
            <PageMock w={w - 4} h={pageH} fillAt={null} />
            <Wipe at={t.s3Page} dur={16} from="top" style={{position: 'absolute', inset: 0}}>
              <PageMock w={w - 4} h={pageH} fillAt={-100} />
            </Wipe>
          </div>
        </div>
        <Arrive at={t.s3Toast} y={14} style={{position: 'absolute', right: -14, bottom: compact ? -22 : -24}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: compact ? '10px 16px 10px 12px' : '12px 18px 12px 14px',
              borderRadius: 16,
              background: theme.surface,
              border: `1.5px solid ${theme.line}`,
              boxShadow: theme.shadow,
            }}
          >
            <Tick size={compact ? 32 : 34} bg={GREEN} fg="#FFFFFF" />
            <span style={{display: 'flex', flexDirection: 'column', gap: 2}}>
              <span style={{fontFamily: fonts.display, fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', color: theme.ink}}>
                And it&apos;s live.
              </span>
              <span style={{fontFamily: fonts.mono, fontSize: 15, color: theme.muted}}>Deployed on Vercel</span>
            </span>
          </div>
        </Arrive>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 9, marginTop: compact ? 8 : 10}}>
        {CHECKS.map((check, i) => (
          <Arrive key={check} at={t.s3Checks + i * 4} dur={10} y={8} style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <Tick size={26} bg={theme.badge} fg={theme.badgeInk} />
            <span style={{fontFamily: fonts.body, fontSize: 19, color: theme.ink}}>{check}</span>
          </Arrive>
        ))}
      </div>
    </>
  );
};
