import type {Metadata, Viewport} from 'next';
import {siteEnv} from '@/lib/env';
import {SITE_DESCRIPTION, SITE_NAME} from '@/lib/metadata';
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

export const viewport: Viewport = {
  themeColor: '#F5F6F8',
};

export default function RootLayout({children}: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
