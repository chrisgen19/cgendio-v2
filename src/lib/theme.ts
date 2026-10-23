/*
 * Theme preference: `system`, `light` or `dark`, stored in the `theme` cookie. No cookie means light, the default.
 * The root layout runs THEME_SCRIPT in <head> so data-theme is set before the first paint and pages stay static;
 * the toggles (src/components/site/theme-toggle.tsx) change it afterwards.
 */

export const THEME_PREFS = ['system', 'light', 'dark'] as const;
export type ThemePref = (typeof THEME_PREFS)[number];

export const THEME_COOKIE = 'theme';

/**
 * Sets data-theme (the resolved light/dark) and data-theme-pref (the choice, for the toggle's icon) on <html>. Plain
 * ES5 so it runs anywhere; keep it in step with readThemePref() and applyTheme() below.
 */
export const THEME_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(system|light|dark)(?:;|$)/);var p=m?m[1]:"light";var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.setAttribute("data-theme",d?"dark":"light");r.setAttribute("data-theme-pref",p)}catch(e){}})()`;

const isThemePref = (value: string | undefined): value is ThemePref => THEME_PREFS.includes(value as ThemePref);

/** The stored preference in the browser (light when there's no valid cookie). */
export const readThemePref = (): ThemePref => {
  const value = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]*)`))?.[1];
  return isThemePref(value) ? value : 'light';
};

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

/** Puts a preference on <html>, the same way THEME_SCRIPT does. */
export const applyTheme = (pref: ThemePref) => {
  const dark = pref === 'dark' || (pref === 'system' && prefersDark());
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme-pref', pref);
};

/** Saves a preference for a year and applies it. */
export const storeThemePref = (pref: ThemePref) => {
  // biome-ignore lint/suspicious/noDocumentCookie: a plain cookie the inline head script can read before React loads
  document.cookie = `${THEME_COOKIE}=${pref}; path=/; max-age=31536000; SameSite=Lax`;
  applyTheme(pref);
};

export const THEME_LABELS: Record<ThemePref, string> = {system: 'System', light: 'Light', dark: 'Dark'};
