/*
 * Theme preference: `system`, `light` or `dark`, stored in the `theme` cookie. No cookie means light, the default.
 * The root layout runs THEME_SCRIPT in <head> so data-theme is set before the first paint and pages stay static;
 * the toggles (src/components/site/theme-toggle.tsx) change it afterwards.
 */

export const THEME_PREFS = ['system', 'light', 'dark'] as const;
export type ThemePref = (typeof THEME_PREFS)[number];

export const THEME_COOKIE = 'theme';

/** Browser chrome colour (meta theme-color) per resolved theme: the page ground. The light one is also the no-JS fallback. */
export const THEME_COLORS = {light: '#F5F6F8', dark: '#0D0E12'} as const;

/**
 * The script's own theme-color meta. It goes first in <head>, so it wins over the static fallback from the root
 * layout's viewport (browsers use the first theme-color that matches). It isn't React's, so changing it never trips
 * hydration, and React 19 skips extra tags in <head>.
 */
const THEME_COLOR_META_ID = 'theme-color';

/**
 * Sets data-theme (the resolved light/dark) and data-theme-pref (the choice, for the toggle's icon) on <html>, and
 * the theme-color meta. Plain ES5 so it runs anywhere; keep it in step with readThemePref() and applyTheme() below.
 */
export const THEME_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(system|light|dark)(?:;|$)/);var p=m?m[1]:"light";var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.setAttribute("data-theme",d?"dark":"light");r.setAttribute("data-theme-pref",p);var t=document.getElementById("${THEME_COLOR_META_ID}");if(!t){t=document.createElement("meta");t.id="${THEME_COLOR_META_ID}";t.name="theme-color";document.head.prepend(t)}t.content=d?"${THEME_COLORS.dark}":"${THEME_COLORS.light}"}catch(e){}})()`;

const isThemePref = (value: string | undefined): value is ThemePref => THEME_PREFS.includes(value as ThemePref);

/** The stored preference in the browser (light when there's no valid cookie). */
export const readThemePref = (): ThemePref => {
  const value = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]*)`))?.[1];
  return isThemePref(value) ? value : 'light';
};

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

/** Points the browser chrome at the resolved theme, creating the meta if the head script didn't run. */
const setThemeColor = (dark: boolean) => {
  let meta = document.getElementById(THEME_COLOR_META_ID) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.id = THEME_COLOR_META_ID;
    meta.name = 'theme-color';
    document.head.prepend(meta);
  }
  meta.content = dark ? THEME_COLORS.dark : THEME_COLORS.light;
};

/** Puts a preference on <html> and the theme-color meta, the same way THEME_SCRIPT does. */
export const applyTheme = (pref: ThemePref) => {
  const dark = pref === 'dark' || (pref === 'system' && prefersDark());
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme-pref', pref);
  setThemeColor(dark);
};

/** Saves a preference for a year and applies it. */
export const storeThemePref = (pref: ThemePref) => {
  // biome-ignore lint/suspicious/noDocumentCookie: a plain cookie the inline head script can read before React loads
  document.cookie = `${THEME_COOKIE}=${pref}; path=/; max-age=31536000; SameSite=Lax`;
  applyTheme(pref);
};

export const THEME_LABELS: Record<ThemePref, string> = {system: 'System', light: 'Light', dark: 'Dark'};
