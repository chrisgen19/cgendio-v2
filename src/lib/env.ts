import {z} from 'zod';

/*
 * Server environment, validated on first use rather than at import, so modules that merely import this file don't
 * fail. Split by concern: `next build` needs only the database (it prerenders from it), so a build doesn't require
 * the auth or R2 secrets. Phase 9 extends this with mail and analytics.
 */

const serverEnvSchema = z.object({
  DATABASE_URL: z.url({protocol: /^postgres(ql)?$/, error: 'DATABASE_URL must be a postgres:// or postgresql:// URL'}),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const authEnvSchema = z.object({
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

const r2EnvSchema = z.object({
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().min(1),
  R2_PUBLIC_URL: z.url().transform((url) => url.replace(/\/+$/, '')),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type AuthEnv = z.infer<typeof authEnvSchema>;
export type R2Env = z.infer<typeof r2EnvSchema>;

const lazy = <T>(parse: () => T) => {
  let cached: T | undefined;
  return () => {
    cached ??= parse();
    return cached;
  };
};

export const serverEnv = lazy((): ServerEnv => serverEnvSchema.parse(process.env));
export const authEnv = lazy((): AuthEnv => authEnvSchema.parse(process.env));
export const r2Env = lazy((): R2Env => r2EnvSchema.parse(process.env));
