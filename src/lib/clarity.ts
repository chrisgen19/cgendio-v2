import {INTERNAL_PATTERN} from './analytics';
import {UNTRACKED_PATH} from './analytics-paths';

/** Dispatched on window once `window.clarity` exists, for code that ran first (ClarityPageTags, at hydration). */
export const CLARITY_READY = 'clarity-ready';

/**
 * The inline script that loads Microsoft Clarity: Clarity's own install snippet, then a `consentv2` call that denies
 * both storage types, so Clarity runs cookieless (a new id per page view) for every visitor and needs no banner. The
 * call is queued until the tag arrives. The project's Cookies setting is also off in the Clarity dashboard; the explicit
 * signal keeps it cookieless if that switch is ever turned back on, and is what Clarity expects for EEA, UK and CH visits.
 *
 * It loads nothing on an untracked page (admin, sign-in, previews) or in the owner's browser (the internal-traffic
 * cookie GA uses too): Clarity has no internal-traffic filter, so the owner's own visits are skipped at the source.
 * The loader checks the path only once, so TrackingBoundary makes every link between an untracked page and a public one a
 * full page load: Clarity can't be held stopped once running (see crossesTrackingBoundary).
 *
 * It ends by dispatching CLARITY_READY, so page tags set at hydration (before this lazy script runs) aren't lost.
 */
export const clarityScript = (projectId: string) =>
  `(function(){if(new RegExp(${JSON.stringify(UNTRACKED_PATH.source)}).test(location.pathname)||new RegExp(${JSON.stringify(INTERNAL_PATTERN)}).test(document.cookie))return;` +
  '(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;' +
  `y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script",${JSON.stringify(projectId)});` +
  `window.clarity('consentv2',{ad_Storage:'denied',analytics_Storage:'denied'});window.dispatchEvent(new Event(${JSON.stringify(CLARITY_READY)}))})();`;

/** Clarity custom tags for a public page, from its path: filters for recordings and heatmaps. Slugs are public URLs. */
export const clarityPageTags = (pathname: string): Record<string, string> => {
  const [section, slug] = pathname.split('/').filter(Boolean);
  if (!section) return {page_type: 'home'};
  if (section === 'projects' && slug) return {page_type: 'case_study', project: slug};
  if (section === 'writing') return slug ? {page_type: 'post', post: slug} : {page_type: 'blog'};
  if (section === 'contact' && !slug) return {page_type: 'contact'};
  return {page_type: 'other'};
};
