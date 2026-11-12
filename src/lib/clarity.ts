import {INTERNAL_PATTERN} from './analytics';
import {UNTRACKED_PATH} from './analytics-paths';

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
 */
export const clarityScript = (projectId: string) =>
  `(function(){if(new RegExp(${JSON.stringify(UNTRACKED_PATH.source)}).test(location.pathname)||new RegExp(${JSON.stringify(INTERNAL_PATTERN)}).test(document.cookie))return;` +
  '(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;' +
  `y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script",${JSON.stringify(projectId)});` +
  "window.clarity('consentv2',{ad_Storage:'denied',analytics_Storage:'denied'})})();";
