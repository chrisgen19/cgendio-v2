'use client';

import {ErrorPanel} from '@/components/site/error-panel';

/** Unexpected errors below the root layout. `retry` re-fetches and re-renders the failed segment (Next.js 16.4). */
export default function ErrorPage({retry}: {error: unknown; retry: () => void}) {
  return <ErrorPanel onRetry={retry} />;
}
