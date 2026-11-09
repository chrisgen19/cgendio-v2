'use client';

import {Moon, Sun} from 'lucide-react';
import {useLayoutEffect, useSyncExternalStore} from 'react';
import {cn} from '@/lib/cn';
import {applyTheme, readTheme, storeTheme, type Theme} from '@/lib/theme';

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const setTheme = (theme: Theme) => {
  storeTheme(theme);
  for (const listener of listeners) listener();
};

/**
 * The stored theme, or null while server rendering and hydrating (the pages are static, so the server never sees the
 * cookie). The head script has already applied the theme by then; only the button's label waits for hydration.
 */
const useTheme = () => {
  const theme = useSyncExternalStore(subscribe, readTheme, () => null);
  // In development React resets <html>'s attributes on the Strict Mode remount; put the theme back before paint
  useLayoutEffect(() => applyTheme(readTheme()), []);
  return theme;
};

/**
 * Header button on every viewport: a moon in light mode and a sun in dark mode. The icons follow
 * <html data-theme>, which the head script sets, so the right one shows before hydration.
 */
export function ThemeToggle({className}: {className?: string}) {
  const theme = useTheme();
  const label = theme === 'dark' ? 'Switch to light mode' : theme === 'light' ? 'Switch to dark mode' : 'Switch theme';
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme((theme ?? readTheme()) === 'dark' ? 'light' : 'dark')}
      className={cn(
        'inline-grid size-11 shrink-0 cursor-pointer place-items-center rounded-pill border border-line bg-white/82 text-ink backdrop-blur-[10px] hover:border-ink',
        className,
      )}
    >
      <Moon aria-hidden="true" size={18} className="in-data-[theme=dark]:hidden" />
      <Sun aria-hidden="true" size={18} className="hidden in-data-[theme=dark]:block" />
    </button>
  );
}
