import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import {PreviewToolbar} from '@/components/design-lab/hero-film/preview-toolbar';

export const metadata: Metadata = {
  title: {default: 'Hero film lab', template: '%s · Hero film lab'},
  description: 'Five directions for the home page hero film.',
  robots: {index: false, follow: false},
};

export default function HeroFilmLabLayout({children}: {children: ReactNode}) {
  return (
    <div className="min-h-svh bg-ground font-body text-ink">
      <a
        href="#main"
        className="fixed top-2 left-4 z-[60] -translate-y-[150%] rounded-full bg-ink px-5 py-3 text-white focus:translate-y-0 focus-visible:outline-2 focus-visible:outline-accent"
      >
        Skip to content
      </a>
      <PreviewToolbar />
      {children}
    </div>
  );
}
