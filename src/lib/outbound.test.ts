import {describe, expect, it} from 'vitest';
import type {TourStop} from '@/server/content-schema';
import {liveSiteTracking, outboundHref, outboundTarget} from './outbound';

const stop = (key: string, path: string) => ({key, path}) as TourStop;

const project = {
  liveUrl: 'https://www.client.example/',
  tourStops: [
    stop('home', '/'),
    stop('shop', '/shop?sort=new'),
    stop('portal', 'https://portal.client.example/login'),
    stop('away', 'https://evil.example/'),
  ],
};

describe('outboundHref', () => {
  it('links to the project, or to one stop by its key', () => {
    expect(outboundHref('access-hire')).toBe('/out/access-hire');
    expect(outboundHref('access-hire', 'shop')).toBe('/out/access-hire?stop=shop');
  });

  it('encodes the slug and key', () => {
    expect(outboundHref('a b', 'x&y=z')).toBe('/out/a%20b?stop=x%26y%3Dz');
  });
});

describe('outboundTarget', () => {
  it('sends a plain /out link to the live site', () => {
    expect(outboundTarget(project, null)).toBe('https://www.client.example/');
  });

  it("sends a stop to its page on the live site, or a subdomain's own address", () => {
    expect(outboundTarget(project, 'home')).toBe('https://www.client.example/');
    expect(outboundTarget(project, 'shop')).toBe('https://www.client.example/shop?sort=new');
    expect(outboundTarget(project, 'portal')).toBe('https://portal.client.example/login');
  });

  it('never leaves the live site, and has nowhere to go without one or for an unknown stop', () => {
    expect(outboundTarget(project, 'away')).toBeNull();
    expect(outboundTarget(project, 'missing')).toBeNull();
    expect(outboundTarget(project, '')).toBeNull();
    expect(outboundTarget({...project, liveUrl: null}, null)).toBeNull();
    expect(outboundTarget({...project, liveUrl: null}, 'home')).toBeNull();
  });
});

describe('liveSiteTracking', () => {
  it('names the GA event, the project and the kind of link', () => {
    expect(liveSiteTracking('myimprov', 'tour')).toEqual({
      'data-track': 'live_site_click',
      'data-track-project': 'myimprov',
      'data-track-link-type': 'tour',
    });
  });
});
