/**
 * Pages Google Analytics must never record: the admin, the sign-in page and signed draft previews. They don't mount the
 * tag, but a client-side navigation can still land on one while gtag.js is loaded (or still processing its queue), so
 * the tag's own config script also checks this pattern before every hit (see google-analytics.tsx).
 */
export const UNTRACKED_PATH = /^\/(?:admin|preview|sign-in)(?:\/|$)/;

export const isUntrackedPath = (pathname: string) => UNTRACKED_PATH.test(pathname);
