import type {Metadata, Viewport} from 'next';
import {body, display, mono} from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cgdiomampo.dev',
  description: 'We take brands from research and Figma to fast WordPress and Next.js sites, then keep them running.',
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
