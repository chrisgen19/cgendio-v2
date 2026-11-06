import type {Metadata, Viewport} from 'next';
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

// The no-JS fallback (light is the default theme). THEME_SCRIPT adds a theme-color for the chosen theme in front of it.
export const viewport: Viewport = {
  themeColor: THEME_COLORS.light,
};

export default function RootLayout({children}: LayoutProps<'/'>) {
  return (
    // The head script changes data-theme before React hydrates, hence suppressHydrationWarning (it covers <html> only)
    <html lang="en" data-theme="light" suppressHydrationWarning className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        {/* Reads the theme cookie and sets data-theme before the first paint, so static pages never flash (src/lib/theme.ts) */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a fixed script from src/lib/theme.ts, no user input */}
        <script dangerouslySetInnerHTML={{__html: THEME_SCRIPT}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
