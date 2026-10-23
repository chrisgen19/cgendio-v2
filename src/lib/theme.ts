/*
 * Theme: `light` or `dark`, stored in the `theme` cookie. No cookie (or any other value, like the old `system`) means
 * light, the default. The root layout runs THEME_SCRIPT in <head> so data-theme is set before the first paint and pages
 * stay static; the header toggle (src/components/site/theme-toggle.tsx) changes it afterwards.
 */

export type Theme = 'light' | 'dark';

export const THEME_COOKIE = 'theme';

/** Browser chrome colour (meta theme-color) per resolved theme: the page ground. The light one is also the no-JS fallback. */
export const THEME_COLORS = {light: '#F5F6F8', dark: '#0B0C10'} as const;

/**
 * The script's own theme-color meta. It goes first in <head>, so it wins over the static fallback from the root
 * layout's viewport (browsers use the first theme-color that matches). It isn't React's, so changing it never trips
 * hydration, and React 19 skips extra tags in <head>.
 */
const THEME_COLOR_META_ID = 'theme-color';

/**
 * Sets data-theme on <html> and the theme-color meta. Plain ES5 so it runs anywhere; keep it in step with readTheme()
 * and applyTheme() below.
 */
export const THEME_SCRIPT = `(function(){try{var d=/(?:^|; )${THEME_COOKIE}=dark(?:;|$)/.test(document.cookie);document.documentElement.setAttribute("data-theme",d?"dark":"light");var t=document.getElementById("${THEME_COLOR_META_ID}");if(!t){t=document.createElement("meta");t.id="${THEME_COLOR_META_ID}";t.name="theme-color";document.head.prepend(t)}t.content=d?"${THEME_COLORS.dark}":"${THEME_COLORS.light}"}catch(e){}})()`;

/** The stored theme in the browser (light when there's no valid cookie). */
export const readTheme = (): Theme => (document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]*)`))?.[1] === 'dark' ? 'dark' : 'light');

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

/** Puts a theme on <html> and the theme-color meta, the same way THEME_SCRIPT does. */
export const applyTheme = (theme: Theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  setThemeColor(theme === 'dark');
};

/** Saves a theme for a year and applies it. */
export const storeTheme = (theme: Theme) => {
  // biome-ignore lint/suspicious/noDocumentCookie: a plain cookie the inline head script can read before React loads
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
  applyTheme(theme);
};
