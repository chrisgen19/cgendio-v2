import {describe, expect, it, vi} from 'vitest';

vi.mock('server-only', () => ({}));

const {assertServerSecrets, checkServerSecrets} = await import('./startup-env-check');

/*
 * The startup check (#103). It reuses the schemas in src/lib/env.ts, so these cases cover what is fatal and what is
 * only a warning, not the schemas' own rules (src/lib/env.test.ts has those).
 */

const COMPLETE = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/cgendio',
  NODE_ENV: 'production',
  BETTER_AUTH_SECRET: 'a'.repeat(32),
  BETTER_AUTH_URL: 'https://cgdiomampo.dev',
  GITHUB_CLIENT_ID: 'client-id',
  GITHUB_CLIENT_SECRET: 'client-secret',
  ADMIN_EMAILS: 'chris@example.com',
  R2_ACCOUNT_ID: 'account',
  R2_ACCESS_KEY_ID: 'key',
  R2_SECRET_ACCESS_KEY: 'secret',
  R2_BUCKET: 'cgendio-media',
  R2_PUBLIC_URL: 'https://media.cgdiomampo.dev',
  RESEND_API_KEY: 're_live_key',
  MAIL_FROM: 'Chris Diomampo <chris@cgdiomampo.dev>',
  GA_MEASUREMENT_ID: 'G-ABC1234567',
  CLARITY_PROJECT_ID: 'zc88qmno9y',
  INDEXNOW_KEY: 'abcdef0123456789',
};

/** Every error mentioning this variable, so a case can assert on one variable without matching whole messages. */
const errorsFor = (variable: string, env: Record<string, string | undefined>) =>
  checkServerSecrets(env).errors.filter((error) => error.startsWith(`${variable}:`));

describe('checkServerSecrets', () => {
  it('passes a complete production environment with nothing to report', () => {
    expect(checkServerSecrets(COMPLETE)).toEqual({errors: [], warnings: []});
  });

  it.each([
    'DATABASE_URL',
    'BETTER_AUTH_SECRET',
    'BETTER_AUTH_URL',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'ADMIN_EMAILS',
  ])('fails when %s is missing', (variable) => {
    expect(errorsFor(variable, {...COMPLETE, [variable]: undefined})).toHaveLength(1);
  });

  it.each(['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET', 'R2_PUBLIC_URL'])('fails when %s is missing', (variable) => {
    expect(errorsFor(variable, {...COMPLETE, [variable]: undefined})).toHaveLength(1);
  });

  /*
   * The Dockerfile guards R2_PUBLIC_URL as a build variable, but r2Env() parses the whole schema at runtime
   * (src/server/r2.ts:33), so a value that reaches the build and not the container would pass startup and fail the
   * first admin upload instead. Raised by CodeRabbit on #105.
   */
  it('fails an empty R2_PUBLIC_URL, which would only surface on the first upload', () => {
    expect(errorsFor('R2_PUBLIC_URL', {...COMPLETE, R2_PUBLIC_URL: ''})).toHaveLength(1);
  });

  it('reports every missing variable at once, not just the first', () => {
    const {errors} = checkServerSecrets({...COMPLETE, BETTER_AUTH_SECRET: undefined, GITHUB_CLIENT_ID: undefined, R2_BUCKET: undefined});
    expect(errors).toHaveLength(3);
    expect(errors.join('\n')).toContain('BETTER_AUTH_SECRET');
    expect(errors.join('\n')).toContain('GITHUB_CLIENT_ID');
    expect(errors.join('\n')).toContain('R2_BUCKET');
  });

  it('fails a BETTER_AUTH_SECRET that is too short to be a real secret', () => {
    expect(errorsFor('BETTER_AUTH_SECRET', {...COMPLETE, BETTER_AUTH_SECRET: 'short'})[0]).toContain('32 characters');
  });

  it('fails an ADMIN_EMAILS that is not an email list', () => {
    expect(errorsFor('ADMIN_EMAILS', {...COMPLETE, ADMIN_EMAILS: 'not-an-email'})).toHaveLength(1);
  });

  it('names the variable in each message', () => {
    expect(errorsFor('DATABASE_URL', {...COMPLETE, DATABASE_URL: 'mysql://localhost/db'})[0]).toMatch(/^DATABASE_URL: /);
  });
});

describe('what only warns', () => {
  // The message is still stored in the admin inbox, so this must not stop a deploy
  it('warns, but does not fail, when RESEND_API_KEY is unset', () => {
    const {errors, warnings} = checkServerSecrets({...COMPLETE, RESEND_API_KEY: undefined});
    expect(errors).toEqual([]);
    expect(warnings.join('\n')).toContain('RESEND_API_KEY');
  });

  // These schemas never throw on purpose, so a typo in an optional setting can't take the site down
  it.each([
    ['GA_MEASUREMENT_ID', 'not-a-ga-id'],
    ['CLARITY_PROJECT_ID', 'NOT-AN-ID'],
    ['INDEXNOW_KEY', '!!'],
  ])('warns, but does not fail, on a malformed %s', (variable, value) => {
    const {errors, warnings} = checkServerSecrets({...COMPLETE, [variable]: value});
    expect(errors).toEqual([]);
    expect(warnings.join('\n')).toContain(variable);
  });

  it.each(['GA_MEASUREMENT_ID', 'CLARITY_PROJECT_ID', 'INDEXNOW_KEY'])('warns that %s is off when it is unset', (variable) => {
    expect(checkServerSecrets({...COMPLETE, [variable]: undefined}).warnings.join('\n')).toContain(`${variable} is not set`);
  });
});

describe('assertServerSecrets', () => {
  it('returns quietly on a complete environment', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() => assertServerSecrets(COMPLETE)).not.toThrow();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('throws one error listing every problem, and points at the deploy guide', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      expect(() => assertServerSecrets({...COMPLETE, BETTER_AUTH_SECRET: undefined, R2_ACCOUNT_ID: undefined})).toThrow(
        /BETTER_AUTH_SECRET[\s\S]*R2_ACCOUNT_ID/,
      );
      expect(() => assertServerSecrets({...COMPLETE, BETTER_AUTH_SECRET: undefined})).toThrow(/docs\/DEPLOY\.md/);
    } finally {
      warn.mockRestore();
    }
  });

  it('logs each warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    assertServerSecrets({...COMPLETE, RESEND_API_KEY: undefined});
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('RESEND_API_KEY'));
    warn.mockRestore();
  });
});
