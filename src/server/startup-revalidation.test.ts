import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({revalidateTag: vi.fn()}));
vi.mock('@/server/content', () => ({CACHE_TAGS: {posts: 'posts', copy: 'copy'}}));

const {revalidateTag} = await import('next/cache');
const {POST} = await import('@/app/api/internal/revalidate-content/route');
const {consumeStartupToken, issueStartupToken, revalidateContentOnStart, STARTUP_REVALIDATE_HEADER} = await import('./startup-revalidation');

const call = (token?: string) =>
  POST(new Request('http://localhost/api/internal/revalidate-content', {method: 'POST', headers: token ? {[STARTUP_REVALIDATE_HEADER]: token} : {}}));

beforeEach(() => {
  vi.mocked(revalidateTag).mockClear();
});

describe('consumeStartupToken', () => {
  it('accepts the issued token once, and nothing else', () => {
    const token = issueStartupToken();
    expect(consumeStartupToken(null)).toBe(false);
    expect(consumeStartupToken('wrong')).toBe(false);
    expect(consumeStartupToken(token)).toBe(true);
    expect(consumeStartupToken(token)).toBe(false);
  });
});

describe('POST /api/internal/revalidate-content', () => {
  it('marks every content tag stale for the startup token, then turns into a 404', async () => {
    const token = issueStartupToken();
    expect((await call(token)).status).toBe(204);
    expect(revalidateTag).toHaveBeenCalledWith('posts', 'max');
    expect(revalidateTag).toHaveBeenCalledWith('copy', 'max');

    expect((await call(token)).status).toBe(404);
    expect(revalidateTag).toHaveBeenCalledTimes(2);
  });

  it('is a 404 without the token', async () => {
    issueStartupToken();
    expect((await call()).status).toBe(404);
    expect((await call('guess')).status).toBe(404);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});

describe('revalidateContentOnStart', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('retries an attempt that failed or timed out, with a timeout on every attempt', async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new DOMException('The operation was aborted due to timeout', 'TimeoutError'))
      .mockResolvedValueOnce(new Response(null, {status: 204}));
    vi.stubGlobal('fetch', fetchMock);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const done = revalidateContentOnStart();
    await vi.runAllTimersAsync();
    await done;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    for (const [, init] of fetchMock.mock.calls) expect(init?.signal).toBeInstanceOf(AbortSignal);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
