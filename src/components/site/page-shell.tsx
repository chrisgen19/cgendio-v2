import type {ReactNode} from 'react';
import {SiteFooter} from './site-footer';
import {SiteHeader} from './site-header';
import {SkipLink} from './skip-link';

/** Header, main and footer for the inner pages (blog, case studies, contact). The home page has its own overlay layout. */
export function PageShell({children}: {children: ReactNode}) {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="focus-visible:outline-none">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
