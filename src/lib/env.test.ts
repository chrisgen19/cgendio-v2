import {afterEach, describe, expect, it, vi} from 'vitest';
import {parseAnalyticsEnv} from './env';

/*
 * GoogleAnalytics reads this while rendering every public page, so a malformed id has to disable the tag rather than
 * throw. Raised on #91: a typo in an optional analytics setting could otherwise 500 the whole public site, or fail
 * the production build, long after the value was set.
 */
describe('parseAnalyticsEnv', () => {
  afterEach(() => vi.restoreAllMocks());

  const quiet = () => vi.spyOn(console, 'warn').mockImplementation(() => {});

  it('reads a well-formed id', () => {
    expect(parseAnalyticsEnv({GA_MEASUREMENT_ID: 'G-MTK3BJBM3Y'}).GA_MEASUREMENT_ID).toBe('G-MTK3BJBM3Y');
  });

  it('treats unset and empty as no analytics', () => {
    expect(parseAnalyticsEnv({}).GA_MEASUREMENT_ID).toBeUndefined();
    expect(parseAnalyticsEnv({GA_MEASUREMENT_ID: ''}).GA_MEASUREMENT_ID).toBeUndefined();
  });

  it.each([
    'G-mtk3bjbm3y',
    'MTK3BJBM3Y',
    'G_MTK3BJBM3Y',
    'G-MTK3 BJBM3Y',
    'G-',
    "G-X');alert(1);//",
  ])('turns analytics off rather than throwing for %j', (id) => {
    quiet();
    expect(() => parseAnalyticsEnv({GA_MEASUREMENT_ID: id})).not.toThrow();
    expect(parseAnalyticsEnv({GA_MEASUREMENT_ID: id}).GA_MEASUREMENT_ID).toBeUndefined();
  });

  it('says so once, so the typo is not silent', () => {
    const warn = quiet();
    parseAnalyticsEnv({GA_MEASUREMENT_ID: 'nope'});
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain('GA_MEASUREMENT_ID');
  });
});
