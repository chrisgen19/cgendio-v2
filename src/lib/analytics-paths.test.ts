import {describe, expect, it} from 'vitest';
import {isUntrackedPath} from './analytics-paths';

describe('isUntrackedPath', () => {
  it.each(['/admin', '/admin/', '/admin/projects/abc', '/preview/post/a-draft', '/sign-in', '/sign-in/'])('%s is untracked', (path) => {
    expect(isUntrackedPath(path)).toBe(true);
  });

  it.each([
    '/',
    '/writing',
    '/writing/a-post',
    '/projects/access-hire',
    '/contact',
    '/administrator',
    '/previews',
    '/sign-inside',
  ])('%s is tracked', (path) => {
    expect(isUntrackedPath(path)).toBe(false);
  });
});
