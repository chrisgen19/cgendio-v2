import type {Metadata, Viewport} from 'next';
import {siteEnv} from '@/lib/env';
import {SITE_DESCRIPTION, SITE_NAME} from '@/lib/metadata';
import {THEME_COLORS, THEME_SCRIPT} from '@/lib/theme';
import {body, display, mono} from './fonts';
import './globals.css';

/** Defaults for routes without their own metadata (pageMetadata() in src/lib/metadata.ts sets the rest per route). */
export const metadata: Metadata = {
  metadataBase: new URL(siteEnv().NEXT_PUBLIC_SITE_URL),
  title: {default: SITE_NAME, template: `%s · ${SITE_NAME}`},
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {siteName: SITE_NAME, locale: 'en', type: 'website'},
  twitter: {card: 'summary_large_image'},
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
