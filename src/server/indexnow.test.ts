import {afterEach, describe, expect, it, vi} from 'vitest';

vi.mock('server-only', () => ({}));
const settings = vi.hoisted(() => ({key: undefined as string | undefined}));
vi.mock('@/lib/env', () => ({
  siteEnv: () => ({NEXT_PUBLIC_SITE_URL: 'https://cgdiomampo.dev'}),
  indexNowEnv: () => ({INDEXNOW_KEY: settings.key}),
}));

const {buildIndexNowPayload, pingIndexNow, postPaths, projectPaths} = await import('./indexnow');

const KEY = '0123456789abcdef';

describe('IndexNow payload', () => {
  it('makes absolute, deduped URLs and points at the key file', () => {
    expect(buildIndexNowPayload(['/writing/a', '/writing/a', '/writing', '/'], 'https://cgdiomampo.dev', KEY)).toEqual({
      host: 'cgdiomampo.dev',
      key: KEY,
      keyLocation: 'https://cgdiomampo.dev/indexnow-key.txt',
      urlList: ['https://cgdiomampo.dev/writing/a', 'https://cgdiomampo.dev/writing', 'https://cgdiomampo.dev/'],
    });
  });

  it('sends nothing for a local site or no paths', () => {
    expect(buildIndexNowPayload(['/'], 'http://localhost:3000', KEY)).toBeNull();
    expect(buildIndexNowPayload(['/'], 'http://127.0.0.1:3000', KEY)).toBeNull();
    expect(buildIndexNowPayload([], 'https://cgdiomampo.dev', KEY)).toBeNull();
  });
});

describe('IndexNow paths', () => {
  it('lists a post, its old URL after a rename, the index and the home page', () => {
    expect(postPaths('new', 'old')).toEqual(['/writing/new', '/writing/old', '/writing', '/']);
    expect(postPaths('same', 'same')).toEqual(['/writing/same', '/writing', '/']);
  });

  it('lists a case study, its old URL after a rename, and the home page', () => {
    expect(projectPaths('new', 'old')).toEqual(['/projects/new', '/projects/old', '/']);
  });
});

describe('IndexNow ping', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    settings.key = undefined;
  });

  it('does nothing without a key', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await pingIndexNow(['/']);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts the payload when a key is set, and swallows network errors', async () => {
    settings.key = KEY;
    const fetchMock = vi.fn().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', fetchMock);
    await expect(pingIndexNow(['/writing/a'])).resolves.toBeUndefined();
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe('https://api.indexnow.org/indexnow');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body).urlList).toEqual(['https://cgdiomampo.dev/writing/a']);
  });
});
