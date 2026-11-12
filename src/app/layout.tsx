import type {Metadata, Viewport} from 'next';
import {Suspense} from 'react';
import {ClarityRouteGuard} from '@/components/site/clarity-route-guard';
import {siteEnv} from '@/lib/env';
import {OG_LOCALE, SITE_DESCRIPTION, SITE_NAME} from '@/lib/metadata';
import {THEME_COLORS, THEME_SCRIPT} from '@/lib/theme';
import {body, display, mono} from './fonts';
import './globals.css';

/**
 * The Search Console property for cgdiomampo.dev, carried over from the previous site (#81) so the domain stays verified
 * through the cutover. The token is public: it ships in the HTML of every page.
 */
const GOOGLE_SITE_VERIFICATION = 'uRp-UbI0NWG6cjziZS9a40Y0BNqg2dFX-oVehIhyOUY';

/** Defaults for routes without their own metadata (pageMetadata() in src/lib/metadata.ts sets the rest per route). */
export const metadata: Metadata = {
  metadataBase: new URL(siteEnv().NEXT_PUBLIC_SITE_URL),
  title: {default: SITE_NAME, template: `%s · ${SITE_NAME}`},
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {siteName: SITE_NAME, locale: OG_LOCALE, type: 'website'},
  twitter: {card: 'summary_large_image'},
  // Lets Google show a large image and an untruncated snippet. Indexing stays at its default; the admin, sign-in and
  // preview routes set their own noindex, which replaces this whole object rather than merging with it.
  robots: {'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1},
  verification: {google: GOOGLE_SITE_VERIFICATION},
};

/*
 * The no-JS fallback (light is the default theme). THEME_SCRIPT adds a theme-color for the chosen theme in front of it.
 *
 * `viewportFit: 'cover'` lets the full-bleed hero fill a notched phone edge to edge, as the previous site did (#112).
 * It only means anything paired with safe-area insets, or the layout runs under the status bar and the home indicator:
 * --header-h in globals.css carries env(safe-area-inset-top), Container carries the left and right insets, and the
 * footer and skip link carry the bottom and top ones.
 */
export const viewport: Viewport = {
  themeColor: THEME_COLORS.light,
  viewportFit: 'cover',
};

export default function RootLayout({children}: LayoutProps<'/'>) {
  return (
    /*
     * The head script changes data-theme before React hydrates, hence suppressHydrationWarning (it covers <html> only).
     *
     * data-scroll-behavior tells Next that globals.css sets `scroll-behavior: smooth` here, so it can turn that off
     * while it moves the scroll on a route change and put it back afterwards. Without it a navigation that resets the
     * scroll is animated the whole way instead of being instant, which is what made #110's mis-targeted scroll slide
     * visibly down to the footer rather than simply landing in the wrong place. In-page anchors still scroll smoothly.
     */
    <html
      lang="en"
      data-theme="light"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <head>
        {/* Reads the theme cookie and sets data-theme before the first paint, so static pages never flash (src/lib/theme.ts) */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a fixed script from src/lib/theme.ts, no user input */}
        <script dangerouslySetInnerHTML={{__html: THEME_SCRIPT}} />
      </head>
      <body>
        {children}
        {/* Renders nothing. Its own boundary because usePathname can suspend on a route with an unknown dynamic param */}
        <Suspense fallback={null}>
          <ClarityRouteGuard />
        </Suspense>
      </body>
    </html>
  );
}
