import {runInNewContext} from 'node:vm';
import {describe, expect, it} from 'vitest';
import {INTERNAL_COOKIE} from './analytics';
import {CLARITY_READY, clarityPageTags, clarityScript} from './clarity';

const ID = 'zc88qmno9y';

/** Runs the loader against a fake browser: what it queued for clarity.js and which script tag it inserted, if any. */
const run = ({pathname = '/', cookie = ''}: {pathname?: string; cookie?: string} = {}) => {
  const inserted: Array<{src?: string; async?: number}> = [];
  const firstScript = {parentNode: {insertBefore: (tag: {src?: string}) => inserted.push(tag)}};
  const document = {cookie, createElement: () => ({}), getElementsByTagName: () => [firstScript]};
  const dispatched: string[] = [];
  const window: Record<string, unknown> = {dispatchEvent: (event: {type: string}) => dispatched.push(event.type)};
  const Event = class {
    constructor(readonly type: string) {}
  };
  runInNewContext(clarityScript(ID), {window, document, location: {pathname}, Event});
  const queue = (window.clarity as {q?: IArguments[]} | undefined)?.q ?? [];
  return {inserted, queued: queue.map((entry) => Array.from(entry)), dispatched};
};

describe('clarityScript', () => {
  it("loads the project's tag on a public page", () => {
    expect(run().inserted).toEqual([{async: 1, src: `https://www.clarity.ms/tag/${ID}`}]);
  });

  it('denies both storage types, so Clarity runs without cookies', () => {
    expect(run().queued).toEqual([['consentv2', {ad_Storage: 'denied', analytics_Storage: 'denied'}]]);
  });

  it.each(['/admin', '/admin/posts', '/sign-in', '/preview/post/x'])('loads nothing on %s', (pathname) => {
    expect(run({pathname})).toEqual({inserted: [], queued: [], dispatched: []});
  });

  it("loads nothing in the owner's browser", () => {
    expect(run({cookie: `theme=dark; ${INTERNAL_COOKIE}=1`})).toEqual({inserted: [], queued: [], dispatched: []});
  });

  it('announces itself once window.clarity exists, so page tags set at hydration can follow', () => {
    expect(run().dispatched).toEqual([CLARITY_READY]);
  });

  it('does not match a cookie whose name only ends the same way', () => {
    expect(run({cookie: `x${INTERNAL_COOKIE}=1`}).inserted).toHaveLength(1);
  });
});

describe('clarityPageTags', () => {
  it.each([
    ['/', {page_type: 'home'}],
    ['/projects/access-hire', {page_type: 'case_study', project: 'access-hire'}],
    ['/writing', {page_type: 'blog'}],
    ['/writing/', {page_type: 'blog'}],
    ['/writing/redirect-maps-wordpress-to-nextjs', {page_type: 'post', post: 'redirect-maps-wordpress-to-nextjs'}],
    ['/contact', {page_type: 'contact'}],
    ['/projects', {page_type: 'other'}],
    ['/design-lab/fresh-fruit', {page_type: 'other'}],
  ])('%s is tagged %j', (pathname, tags) => {
    expect(clarityPageTags(pathname)).toEqual(tags);
  });

  it.each([
    ['?tag=wordpress', {page_type: 'blog', blog_tag: 'wordpress'}],
    ['?tag=nextjs&page=2', {page_type: 'blog', blog_tag: 'nextjs'}],
    ['?page=2', {page_type: 'blog'}],
    ['', {page_type: 'blog'}],
  ])('/writing%s is tagged %j', (search, tags) => {
    expect(clarityPageTags('/writing', search)).toEqual(tags);
  });

  it('ignores a query outside the blog index', () => {
    expect(clarityPageTags('/writing/a-post', 'tag=wordpress')).toEqual({page_type: 'post', post: 'a-post'});
    expect(clarityPageTags('/', 'tag=wordpress')).toEqual({page_type: 'home'});
  });
});
