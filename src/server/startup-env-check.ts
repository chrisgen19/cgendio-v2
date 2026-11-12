import 'server-only';
import {writeSync} from 'node:fs';
import type {ZodError, ZodType} from 'zod';
import {analyticsEnvSchema, authEnvSchema, clarityEnvSchema, indexNowEnvSchema, mailEnvSchema, r2EnvSchema, serverEnvSchema} from '@/lib/env';

/*
 * Server secrets, checked once when the server starts (#10 step 3, #103). Every schema in src/lib/env.ts is parsed
 * lazily on first use, deliberately: `next build` prerenders from the database and must not need the auth, R2 or mail
 * secrets. The cost is that a missing secret surfaces as a runtime error on whichever page touches it first, so a
 * deploy looks fine until someone opens /sign-in.
 *
 * instrumentation.ts calls this before the server takes requests, in production only, so a missing secret fails the
 * deploy instead of a page. Next skips register() during the production build (NEXT_PHASE), so the builder stage,
 * which has none of these, is unaffected.
 */

type Env = Record<string, string | undefined>;

/*
 * `VARIABLE: message` per problem, so a deploy log names what to fix rather than printing a Zod dump. Only the first
 * path segment: ADMIN_EMAILS pipes into an array, whose issues are at ADMIN_EMAILS.0, and the variable name is what an
 * operator needs.
 */
const issuesOf = (error: ZodError) =>
  error.issues.map((issue) => {
    const name = issue.path[0];
    return name ? `${String(name)}: ${issue.message}` : issue.message;
  });

const problems = (schema: ZodType, env: Env) => {
  const parsed = schema.safeParse(env);
  return parsed.success ? [] : issuesOf(parsed.error);
};

export type EnvCheck = {errors: string[]; warnings: string[]};

/**
 * Every problem at once, so one failed deploy shows everything that needs fixing instead of one variable per attempt.
 *
 * Fatal: the database, the auth secrets (BETTER_AUTH_SECRET also keys the contact form's IP hash and the draft preview
 * signatures, not just sign-in) and the whole R2 schema. Warnings: anything the site keeps working without.
 *
 * R2_PUBLIC_URL is in the R2 schema and so is fatal here as well, even though the Dockerfile already guards it as a
 * build variable: `r2Env()` parses the whole schema at runtime (src/server/r2.ts:33), so a value that reaches the build
 * but not the running container would pass startup and then fail the first admin upload - the exact failure this check
 * exists to prevent. The build guard stays as the earlier, cheaper one.
 */
export const checkServerSecrets = (env: Env): EnvCheck => {
  const errors = [...problems(serverEnvSchema, env), ...problems(authEnvSchema, env), ...problems(r2EnvSchema, env)];
  const warnings = [...problems(mailEnvSchema, env)];

  // Optional by design, but its absence is otherwise silent and the contact form is the site's main call to action
  if (!env.RESEND_API_KEY) {
    warnings.push('RESEND_API_KEY is not set: contact messages are stored in the admin inbox but no email is sent.');
  }
  // These never throw on purpose (src/lib/env.ts), so a typo in an optional setting can't take the site down.
  // Reporting their resolved state here means a deploy log answers "is analytics actually on?".
  if (!analyticsEnvSchema.safeParse(env).success) {
    warnings.push(`GA_MEASUREMENT_ID is not a G-XXXXXXXXXX id (${JSON.stringify(env.GA_MEASUREMENT_ID)}): analytics is off.`);
  } else if (!env.GA_MEASUREMENT_ID) {
    warnings.push('GA_MEASUREMENT_ID is not set: analytics is off.');
  }
  if (!clarityEnvSchema.safeParse(env).success) {
    warnings.push(`CLARITY_PROJECT_ID must be lowercase letters and digits (${JSON.stringify(env.CLARITY_PROJECT_ID)}): Clarity is off.`);
  } else if (!env.CLARITY_PROJECT_ID) {
    warnings.push('CLARITY_PROJECT_ID is not set: Clarity is off.');
  }
  if (!indexNowEnvSchema.safeParse(env).success) {
    warnings.push('INDEXNOW_KEY must be 8 to 128 letters, digits or hyphens: IndexNow is off and /indexnow-key.txt 404s.');
  } else if (!env.INDEXNOW_KEY) {
    warnings.push('INDEXNOW_KEY is not set: IndexNow is off and /indexnow-key.txt 404s.');
  }

  return {errors, warnings};
};

/**
 * What instrumentation.ts calls: logs the warnings and, if anything is fatal, logs it and exits non-zero.
 *
 * Exiting rather than throwing, because throwing isn't enough. Measured against this Next version's standalone server
 * (#103): a rejection from `register()` is swallowed - the server logged nothing, reported "Ready" and served
 * /api/health with a 200. Only a non-zero exit stops the container, which is what makes the deploy fail instead of a
 * page. It lives here rather than in instrumentation.ts because that file is compiled for the Edge runtime too, where
 * `process.exit` isn't available; this module is server-only and imported after the nodejs check.
 */
export const assertServerSecretsOrExit = (env: Env = process.env) => {
  try {
    assertServerSecrets(env);
  } catch (error) {
    // writeSync, not console.error: Node writes to a pipe asynchronously, and stderr is a pipe under Docker, so
    // process.exit() can cut the message off and leave an operator with a container that exits saying nothing.
    writeSync(2, `${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
};

/** Logs the warnings and throws one error listing every fatal problem. Exported for its test. */
export const assertServerSecrets = (env: Env = process.env) => {
  const {errors, warnings} = checkServerSecrets(env);
  for (const warning of warnings) console.warn(`Environment: ${warning}`);
  if (errors.length === 0) return;
  throw new Error(
    `Missing or invalid environment variables, so the server will not start (see docs/DEPLOY.md):\n${errors.map((error) => `  - ${error}`).join('\n')}`,
  );
};
