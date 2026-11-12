import {afterEach, describe, expect, it, vi} from 'vitest';
import {authSecretEnvSchema, parseAnalyticsEnv, parseClarityEnv, parseIndexNowEnv} from './env';

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

/* MicrosoftClarity reads this while rendering every public page too, so it follows the same never-throw rule. */
describe('parseClarityEnv', () => {
  afterEach(() => vi.restoreAllMocks());

  it('reads a well-formed id', () => {
    expect(parseClarityEnv({CLARITY_PROJECT_ID: 'zc88qmno9y'}).CLARITY_PROJECT_ID).toBe('zc88qmno9y');
  });

  it('treats unset and empty as no Clarity', () => {
    expect(parseClarityEnv({}).CLARITY_PROJECT_ID).toBeUndefined();
    expect(parseClarityEnv({CLARITY_PROJECT_ID: ''}).CLARITY_PROJECT_ID).toBeUndefined();
  });

  it.each(['ZC88QMNO9Y', 'zc88 qmno9y', 'zc88-qmno9y', '"+alert(1)+"'])('turns Clarity off rather than throwing for %j', (id) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(parseClarityEnv({CLARITY_PROJECT_ID: id}).CLARITY_PROJECT_ID).toBeUndefined();
    expect(warn.mock.calls[0]?.[0]).toContain('CLARITY_PROJECT_ID');
  });
});

/* The IndexNow key is read by admin saves and /indexnow-key.txt, so a malformed one turns IndexNow off instead of throwing. */
describe('parseIndexNowEnv', () => {
  afterEach(() => vi.restoreAllMocks());

  it('reads a well-formed key', () => {
    expect(parseIndexNowEnv({INDEXNOW_KEY: 'a1b2c3d4-e5f6'}).INDEXNOW_KEY).toBe('a1b2c3d4-e5f6');
  });

  it('treats unset and empty as no IndexNow', () => {
    expect(parseIndexNowEnv({}).INDEXNOW_KEY).toBeUndefined();
    expect(parseIndexNowEnv({INDEXNOW_KEY: ''}).INDEXNOW_KEY).toBeUndefined();
  });

  it.each(['short', 'has spaces in it', 'under_score_key', `${'a'.repeat(129)}`])('turns IndexNow off rather than throwing for %j', (key) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(parseIndexNowEnv({INDEXNOW_KEY: key}).INDEXNOW_KEY).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

/* The contact form hashes visitor IPs with this secret, so it must work without the admin's GitHub sign-in settings. */
describe('authSecretEnvSchema', () => {
  const secret = 'x'.repeat(32);

  it('needs nothing but the secret', () => {
    expect(authSecretEnvSchema.parse({BETTER_AUTH_SECRET: secret}).BETTER_AUTH_SECRET).toBe(secret);
  });

  it.each([
    ['unset', {}],
    ['empty', {BETTER_AUTH_SECRET: ''}],
    ['too short', {BETTER_AUTH_SECRET: 'x'.repeat(31)}],
  ])('rejects a secret that is %s', (_label, env) => {
    expect(authSecretEnvSchema.safeParse(env).success).toBe(false);
  });
});
