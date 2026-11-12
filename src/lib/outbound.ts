import type {ProjectDetail} from '@/server/content-schema';
import {tourHref} from './tour';

/**
 * Links to a client's live site go through /out on this site, which robots.txt disallows: crawlers never follow the
 * redirect, so the page's HTML never names the client's domain and it doesn't show up in their backlink reports.
 */
export const OUTBOUND_PATH = '/out';

/** The /out link for a project's live site, or for one tour stop's page on it. */
export const outboundHref = (slug: string, stopKey?: string) => {
  const base = `${OUTBOUND_PATH}/${encodeURIComponent(slug)}`;
  return stopKey ? `${base}?stop=${encodeURIComponent(stopKey)}` : base;
};

/**
 * The client address an /out link sends a visitor to: the live site, or a tour stop's page on it (checked by tourHref,
 * so it can't leave the site's domain). Null only when there's no live site. An unknown stop, such as one deleted since
 * the page loaded (keys are random), falls back to the live site. The link carries a stop key, never an address, so
 * /out can't be used to redirect anywhere else.
 */
export const outboundTarget = (project: Pick<ProjectDetail, 'liveUrl' | 'tourStops'>, stopKey: string | null) => {
  if (!project.liveUrl) return null;
  const stop = stopKey === null ? undefined : project.tourStops.find(({key}) => key === stopKey);
  return (stop && tourHref(stop.path, project.liveUrl)) || project.liveUrl;
};

/** GA4 event sent when a visitor follows a live-site link: the clicks per project, since GA can't see them as outbound anymore. */
export const LIVE_SITE_EVENT = 'live_site_click';

/** The `data-track` attributes for a live-site link (see TrackClicks): `project` and `link_type` (`live` or `tour`) in GA. */
export const liveSiteTracking = (slug: string, linkType: 'live' | 'tour') => ({
  'data-track': LIVE_SITE_EVENT,
  'data-track-project': slug,
  'data-track-link-type': linkType,
});
