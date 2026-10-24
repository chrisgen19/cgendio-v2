'use client';

import {type RefObject, useEffect, useState} from 'react';

/**
 * Tracks the height of the panel that is showing, so its wrapper can ease between views. Undefined until measured,
 * which leaves the wrapper at its natural height for server rendering and no-JS visitors.
 */
export const useShownHeight = (panelRef: RefObject<HTMLElement | null>): number | undefined => {
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const observer = new ResizeObserver(() => setHeight(panel.offsetHeight));
    observer.observe(panel);
    return () => observer.disconnect();
  }, [panelRef]);

  return height;
};
