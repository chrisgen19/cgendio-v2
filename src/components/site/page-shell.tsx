import type {ReactNode} from 'react';
import {SiteFooter} from './site-footer';
import {SiteHeader} from './site-header';

/** Header, main and footer for the inner pages (blog, case studies, contact). The home page has its own overlay layout. */
export function PageShell({children}: {children: ReactNode}) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
