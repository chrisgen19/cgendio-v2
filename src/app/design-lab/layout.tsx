import {notFound} from 'next/navigation';
import type {ReactNode} from 'react';

/**
 * The design labs are comparison tools for `next dev` (#62), not public pages. A production build answers 404 for every
 * route under /design-lab, so the deployed site never serves them (#81).
 */
export default function DesignLabRootLayout({children}: {children: ReactNode}) {
  if (process.env.NODE_ENV === 'production') notFound();
  return children;
}
