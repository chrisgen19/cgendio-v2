import type {ReactNode} from 'react';
import {GoogleAnalytics} from './google-analytics';
import {SiteFooter} from './site-footer';
import {SiteHeader} from './site-header';
import {SkipLink} from './skip-link';

/**
 * Header, main and footer for the inner pages (blog, case studies, contact). The home page has its own overlay layout.
 *
 * `tracked` is the analytics tag. Every public page wants it; the draft preview is the one caller that does not, since
 * it is an admin view of unpublished content behind the session check.
 */
export function PageShell({children, tracked = true}: {children: ReactNode; tracked?: boolean}) {
  return (
    <>
      {tracked ? <GoogleAnalytics /> : null}
      <SkipLink />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="scroll-mt-[calc(var(--header-h)+1rem)] focus-visible:outline-none">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
