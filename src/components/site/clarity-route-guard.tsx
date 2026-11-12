'use client';

import {usePathname} from 'next/navigation';
import {useEffect} from 'react';
import {isUntrackedPath} from '@/lib/analytics-paths';
import {stopClarityOn} from '@/lib/clarity';

/**
 * Stops Microsoft Clarity when a client-side navigation lands on an untracked page (admin, sign-in, a draft preview).
 * The loader only checks the path once, so without this a visitor who goes from a preview to a public page and back
 * would have the draft, and its signed URL, recorded. GA covers the same case with its per-hit opt-out.
 *
 * Mounted in the root layout so it outlives every page change, including into the preview, which renders no tags.
 */
export function ClarityRouteGuard() {
  const pathname = usePathname();
  useEffect(() => stopClarityOn(pathname, isUntrackedPath), [pathname]);
  return null;
}
