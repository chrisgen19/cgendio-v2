import {describe, expect, it} from 'vitest';
import {ogCardPath, pageMetadata} from './metadata';

describe('pageMetadata', () => {
  it('advertises the Markdown version only when asked', () => {
    const types = (markdown?: boolean) =>
      pageMetadata({title: 'A post', description: 'About it.', path: '/writing/a-post', markdown}).alternates?.types;
    expect(types(true)).toMatchObject({'text/markdown': '/writing/a-post.md'});
    expect(types()).not.toHaveProperty('text/markdown');
    // The feed link stays either way: a route's alternates replace the root layout's
    expect(types(true)).toHaveProperty('application/rss+xml');
    expect(types()).toHaveProperty('application/rss+xml');
  });
});

describe('ogCardPath', () => {
  it('is the generated card under the page', () => {
    expect(ogCardPath('/projects/access-hire')).toBe('/projects/access-hire/opengraph-image/card');
  });
});
