'use client';

import {ErrorPanel} from '@/components/site/error-panel';
import {body, display, mono} from './fonts';
import './globals.css';

/** Errors in the root layout itself. It replaces the layout, so it brings its own document, fonts and styles. */
export default function GlobalError({retry}: {error: unknown; retry: () => void}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <title>Something went wrong · Cgdiomampo.dev</title>
        <ErrorPanel onRetry={retry} />
      </body>
    </html>
  );
}
