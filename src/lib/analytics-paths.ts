/**
 * Pages Google Analytics must never record: the admin, the sign-in page and signed draft previews. They don't mount the
 * tag, but a client-side navigation can still land on one while gtag.js is loaded (or still processing its queue), so
 * the tag's own config script also checks this pattern before every hit (see gaOptOutScript).
 */
export const UNTRACKED_PATH = /^\/(?:admin|preview|sign-in)(?:\/|$)/;

export const isUntrackedPath = (pathname: string) => UNTRACKED_PATH.test(pathname);

/**
 * Inline script that turns GA's documented opt-out flag, window['ga-disable-<id>'], into an accessor: gtag.js reads it
 * before every hit, so it reports true while an untracked page is showing. It never weakens an opt-out made elsewhere:
 * a `true` already set (a consent script, an extension) is kept, a later assignment of `true` still opts the visit out,
 * and a flag another script already controls with its own getter is left alone. If the flag can't be redefined at
 * all, the error is swallowed so the rest of the GA config still runs.
 */
export const gaOptOutScript = (measurementId: string) =>
  `(function(){var k=${JSON.stringify(`ga-disable-${measurementId}`)},r=new RegExp(${JSON.stringify(UNTRACKED_PATH.source)}),d=Object.getOwnPropertyDescriptor(window,k);` +
  `if(d&&(d.get||d.set))return;var o=!!d&&d.value===true;` +
  'try{Object.defineProperty(window,k,{configurable:true,get:function(){return o||r.test(location.pathname)},set:function(v){o=v===true}})}catch(e){}})();';
