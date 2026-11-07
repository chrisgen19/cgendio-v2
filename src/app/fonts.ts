import localFont from 'next/font/local';

/*
 * Self-hosted, so `next build` never fetches from Google: next/font/google failed intermittently in Turbopack (#92).
 * The files in ./_fonts are the latin variable fonts Google Fonts serves, byte for byte the ones next/font/google
 * downloaded (Bricolage with its opsz axis; Geist Mono 400 and 500 were already one variable file). Characters outside
 * the latin subset fall back to the system font. Licences sit next to them (SIL OFL 1.1).
 */
export const display = localFont({
  src: './_fonts/bricolage-grotesque-latin-variable.woff2',
  weight: '200 800',
  variable: '--font-bricolage',
  display: 'swap',
});
export const body = localFont({src: './_fonts/geist-latin-variable.woff2', weight: '100 900', variable: '--font-geist', display: 'swap'});
export const mono = localFont({src: './_fonts/geist-mono-latin-variable.woff2', weight: '100 900', variable: '--font-geist-mono', display: 'swap'});
