import type {Metadata} from 'next';
import {type ReactNode, Suspense} from 'react';
import {PreviewToolbar} from '@/components/design-lab/nav/preview-toolbar';

export const metadata: Metadata = {
  title: {default: 'Nav lab — header directions', template: '%s · Nav lab'},
  description: 'Three sticky header directions for cgdiomampo.dev, over the real home page.',
  robots: {index: false, follow: false},
};

export default function NavLabLayout({children}: {children: ReactNode}) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-70 rounded-pill bg-ink px-5 font-semibold text-white no-underline focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:inline-flex focus:min-h-11 focus:items-center hover:text-white"
      >
        Skip to content
      </a>
      {children}
      {/* useSearchParams needs a boundary so the previews can still be prerendered */}
      <Suspense fallback={null}>
        <PreviewToolbar />
      </Suspense>
    </>
  );
}
