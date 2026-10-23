'use client';

import {Monitor, Moon, Sun} from 'lucide-react';
import {useId, useLayoutEffect, useSyncExternalStore} from 'react';
import {cn} from '@/lib/cn';
import {applyTheme, readThemePref, storeThemePref, THEME_LABELS, THEME_PREFS, type ThemePref} from '@/lib/theme';

/* One store for every toggle on the page (header, mobile menu, footer), so they never disagree. */
const listeners = new Set<() => void>();
let systemQuery: MediaQueryList | null = null;

/** While the choice is System, follow the OS switching between light and dark. */
const onSystemChange = () => {
  if (readThemePref() === 'system') applyTheme('system');
};

const subscribe = (listener: () => void) => {
  if (listeners.size === 0) {
    systemQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemQuery.addEventListener('change', onSystemChange);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) systemQuery?.removeEventListener('change', onSystemChange);
  };
};

const setThemePref = (pref: ThemePref) => {
  storeThemePref(pref);
  for (const listener of listeners) listener();
};

/**
 * The stored choice, or null while server rendering and hydrating (the pages are static, so the server never sees the
 * cookie). The head script has already applied the theme by then; only the controls' state waits for hydration.
 */
const useThemePref = () => {
  const pref = useSyncExternalStore(subscribe, readThemePref, () => null);
  // In development React resets <html>'s attributes on the Strict Mode remount; put the theme back before paint
  useLayoutEffect(() => applyTheme(readThemePref()), []);
  return pref;
};

const ICONS = {system: Monitor, light: Sun, dark: Moon} as const;
const NEXT: Record<ThemePref, ThemePref> = {system: 'light', light: 'dark', dark: 'system'};
// The head script sets data-theme-pref on <html>, so the right icon shows before hydration. Full class names for Tailwind.
const SHOW_WHEN: Record<ThemePref, string> = {
  system: 'in-data-[theme-pref=system]:block',
  light: 'in-data-[theme-pref=light]:block',
  dark: 'in-data-[theme-pref=dark]:block',
};

/** Desktop header: one 44px button that steps System → Light → Dark. Its label names the current and next choice. */
export function ThemeCycleButton({className}: {className?: string}) {
  const pref = useThemePref();
  const label = pref ? `Theme: ${THEME_LABELS[pref]}. Switch to ${THEME_LABELS[NEXT[pref]]}` : 'Change theme';
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setThemePref(NEXT[pref ?? readThemePref()])}
      className={cn(
        'inline-grid size-11 shrink-0 cursor-pointer place-items-center rounded-pill border border-line bg-white/82 text-ink backdrop-blur-[10px] hover:border-ink',
        className,
      )}
    >
      {THEME_PREFS.map((value) => {
        const Icon = ICONS[value];
        return <Icon key={value} aria-hidden="true" size={18} className={cn('hidden', SHOW_WHEN[value])} />;
      })}
    </button>
  );
}

/** Mobile menu and footer: the three choices as a radio group, 44px tall. */
export function ThemeSegmented({className}: {className?: string}) {
  const pref = useThemePref();
  const name = useId();
  return (
    <fieldset className={cn('m-0 inline-flex min-w-0 gap-0.5 rounded-pill border border-line bg-white p-1', className)}>
      <legend className="sr-only">Theme</legend>
      {THEME_PREFS.map((value) => {
        const Icon = ICONS[value];
        return (
          <label
            key={value}
            className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-pill px-3.5 text-[13px] font-medium text-muted outline-accent hover:text-ink has-checked:bg-ink has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2"
          >
            <input type="radio" name={name} value={value} checked={pref === value} onChange={() => setThemePref(value)} className="sr-only" />
            <Icon aria-hidden="true" size={15} />
            {THEME_LABELS[value]}
          </label>
        );
      })}
    </fieldset>
  );
}
