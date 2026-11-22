'use client';

import {ErrorPanel} from '@/components/site/error-panel';
import {SITE_NAME} from '@/lib/metadata';
import './globals.css';

/**
 * Errors in the root layout itself. It replaces the layout, so it brings its own document and styles. The fonts come
 * with globals.css (@font-face plus the --font-* variables on :root); it skips the preload tags the root layout sends,
 * because an error page is not worth a second set of font requests racing the stylesheet.
 */
export default function GlobalError({retry}: {error: unknown; retry: () => void}) {
  return (
    <html lang="en">
      <body>
        <title>{`Something went wrong · ${SITE_NAME}`}</title>
        <ErrorPanel onRetry={retry} />
      </body>
    </html>
  );
}
