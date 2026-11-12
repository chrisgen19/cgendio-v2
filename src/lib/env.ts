import {z} from 'zod';

/*
 * Server environment, validated on first use rather than at import, so modules that merely import this file don't
 * fail. Split by concern: `next build` needs only the database (it prerenders from it), so a build doesn't require
 * the auth or R2 secrets.
 */

export const serverEnvSchema = z.object({
  DATABASE_URL: z.url({protocol: /^postgres(ql)?$/, error: 'DATABASE_URL must be a postgres:// or postgresql:// URL'}),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const authEnvSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32, {error: 'BETTER_AUTH_SECRET must be at least 32 characters (openssl rand -base64 32)'}),
  BETTER_AUTH_URL: z.url(),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  /** Comma-separated; compared case-insensitively */
  ADMIN_EMAILS: z
    .string()
    .min(1, {error: 'ADMIN_EMAILS must list at least one email'})
    .transform((value) =>
      value
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    )
    .pipe(z.array(z.email()).min(1)),
});

/** Just the signing secret, for features that have nothing to do with sign-in (the contact form's IP hash). */
export const authSecretEnvSchema = authEnvSchema.pick({BETTER_AUTH_SECRET: true});

export const r2EnvSchema = z.object({
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().min(1),
  R2_PUBLIC_URL: z.url().transform((url) => url.replace(/\/+$/, '')),
});

/** Contact form email. Without a key the message is still stored, and only the notification is skipped. */
export const mailEnvSchema = z.object({
  RESEND_API_KEY: z.preprocess((value) => (value === '' ? undefined : value), z.string().min(1).optional()),
  MAIL_FROM: z.preprocess((value) => (value === '' ? undefined : value), z.string().min(3).default('Chris Diomampo <onboarding@resend.dev>')),
});

/**
 * Google Analytics. The id goes into an inline script, so only the G-XXXXXXXXXX shape is accepted (#81).
 *
 * Unlike the other schemas this one never throws, because `GoogleAnalytics` reads it while rendering every public
 * page: a typo in an optional setting must not be able to take the site down. A malformed id turns analytics off and
 * is logged once per process instead. (The previous site threw here, but it only read the value at build time.)
 */
export const analyticsEnvSchema = z.object({
  GA_MEASUREMENT_ID: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z
      .string()
      .regex(/^G-[A-Z0-9]+$/)
      .optional(),
  ),
});

/**
 * Microsoft Clarity (session recordings and heatmaps). The project id also goes into an inline script, so only lowercase
 * letters and digits are accepted. Like analytics it never throws: a malformed id turns Clarity off with a warning.
 */
export const clarityEnvSchema = z.object({
  CLARITY_PROJECT_ID: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z
      .string()
      .regex(/^[a-z0-9]{6,20}$/)
      .optional(),
  ),
});

/**
 * IndexNow (https://www.indexnow.org): the key search engines fetch from /indexnow-key.txt to check that pings come from
 * the site owner. Public by design. Like analytics it never throws: a malformed key turns IndexNow off with a warning,
 * so a typo can't fail an admin save or the key route (#81).
 */
export const indexNowEnvSchema = z.object({
  INDEXNOW_KEY: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z
      .string()
      .regex(/^[A-Za-z0-9-]{8,128}$/)
      .optional(),
  ),
});

/** The public origin, for absolute URLs (the RSS feed now, canonical URLs and OG images in Phase 7). No trailing slash. */
const siteEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z
      .url()
      .default('http://localhost:3000')
      .transform((url) => url.replace(/\/+$/, '')),
  ),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type AuthEnv = z.infer<typeof authEnvSchema>;
export type AuthSecretEnv = z.infer<typeof authSecretEnvSchema>;
export type R2Env = z.infer<typeof r2EnvSchema>;
export type MailEnv = z.infer<typeof mailEnvSchema>;
export type SiteEnv = z.infer<typeof siteEnvSchema>;
export type AnalyticsEnv = z.infer<typeof analyticsEnvSchema>;
export type IndexNowEnv = z.infer<typeof indexNowEnvSchema>;
export type ClarityEnv = z.infer<typeof clarityEnvSchema>;

const lazy = <T>(parse: () => T) => {
  let cached: T | undefined;
  return () => {
    cached ??= parse();
    return cached;
  };
};

export const serverEnv = lazy((): ServerEnv => serverEnvSchema.parse(process.env));
export const authEnv = lazy((): AuthEnv => authEnvSchema.parse(process.env));
export const authSecretEnv = lazy((): AuthSecretEnv => authSecretEnvSchema.parse(process.env));
export const r2Env = lazy((): R2Env => r2EnvSchema.parse(process.env));
export const mailEnv = lazy((): MailEnv => mailEnvSchema.parse(process.env));
export const siteEnv = lazy((): SiteEnv => siteEnvSchema.parse(process.env));
/** Exported for its test: `analyticsEnv` caches, so the fallback cannot be exercised through the accessor. */
export const parseAnalyticsEnv = (env: Record<string, string | undefined>): AnalyticsEnv => {
  const parsed = analyticsEnvSchema.safeParse(env);
  if (parsed.success) return parsed.data;
  console.warn(`Ignoring GA_MEASUREMENT_ID: ${JSON.stringify(env.GA_MEASUREMENT_ID)} is not a G-XXXXXXXXXX id. Analytics is off.`);
  return {GA_MEASUREMENT_ID: undefined};
};

export const analyticsEnv = lazy((): AnalyticsEnv => parseAnalyticsEnv(process.env));

/** Exported for its test, as parseAnalyticsEnv is. */
export const parseClarityEnv = (env: Record<string, string | undefined>): ClarityEnv => {
  const parsed = clarityEnvSchema.safeParse(env);
  if (parsed.success) return parsed.data;
  console.warn(`Ignoring CLARITY_PROJECT_ID: ${JSON.stringify(env.CLARITY_PROJECT_ID)} is not a Clarity project id. Clarity is off.`);
  return {CLARITY_PROJECT_ID: undefined};
};

export const clarityEnv = lazy((): ClarityEnv => parseClarityEnv(process.env));

/** Exported for its test, as parseAnalyticsEnv is. */
export const parseIndexNowEnv = (env: Record<string, string | undefined>): IndexNowEnv => {
  const parsed = indexNowEnvSchema.safeParse(env);
  if (parsed.success) return parsed.data;
  console.warn('Ignoring INDEXNOW_KEY: it must be 8 to 128 letters, digits or hyphens. IndexNow is off.');
  return {INDEXNOW_KEY: undefined};
};

export const indexNowEnv = lazy((): IndexNowEnv => parseIndexNowEnv(process.env));
