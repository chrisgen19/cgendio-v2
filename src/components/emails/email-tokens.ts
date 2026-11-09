import type {CSSProperties} from 'react';

/*
 * The site's design tokens as raw values. Email clients only read inline styles, so (like the hero film's theme.ts)
 * these can't come from the Tailwind theme. Keep them in step with `src/app/globals.css`.
 */
export const EMAIL_COLORS = {
  ink: '#0D0E12',
  muted: '#565B67',
  line: '#E3E5EA',
  ground: '#F5F6F8',
  white: '#FFFFFF',
  lime: '#D7FF3D',
  accent: '#3B2BFF',
} as const;

/** Web fonts load in Apple Mail and iOS; Gmail and Outlook fall back to Helvetica or Arial. */
export const EMAIL_FONTS = {
  display: "'Bricolage Grotesque', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  body: "Geist, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono: "'Geist Mono', ui-monospace, Menlo, Consolas, monospace",
} as const;

export const EMAIL_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Geist:wght@400;600&family=Geist+Mono:wght@500&display=swap';

/** The mono uppercase eyebrow used for labels across both emails. */
export const eyebrowStyle: CSSProperties = {
  margin: 0,
  fontFamily: EMAIL_FONTS.mono,
  fontSize: '12px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  lineHeight: '1.4',
  textTransform: 'uppercase',
  color: EMAIL_COLORS.muted,
};

export const headingStyle: CSSProperties = {
  margin: 0,
  fontFamily: EMAIL_FONTS.display,
  fontSize: '34px',
  fontWeight: 800,
  letterSpacing: '-0.035em',
  lineHeight: '1.05',
  color: EMAIL_COLORS.ink,
};

/**
 * The lime highlighter as a background band, since emails have no pseudo-elements. Clients that drop gradients
 * (some Outlook versions) show the plain word.
 */
export const highlightStyle: CSSProperties = {
  padding: '0 0.06em',
  backgroundImage: `linear-gradient(transparent 57%, ${EMAIL_COLORS.lime} 57%, ${EMAIL_COLORS.lime} 93%, transparent 93%)`,
};

export const pillButtonStyle: CSSProperties = {
  display: 'inline-block',
  // Space below so the buttons don't touch when they wrap onto two lines on a phone
  marginBottom: '8px',
  padding: '15px 24px',
  borderRadius: '999px',
  fontFamily: EMAIL_FONTS.body,
  fontSize: '15px',
  fontWeight: 600,
  lineHeight: '18px',
  textDecoration: 'none',
};
