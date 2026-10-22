import {z} from 'zod';

const serverEnvSchema = z.object({
  DATABASE_URL: z.url({protocol: /^postgres(ql)?$/, error: 'DATABASE_URL must be a postgres:// or postgresql:// URL'}),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

/**
 * Server environment, validated on first use rather than at import, so modules that merely import this file don't
 * fail. Phase 9 extends it with the auth, mail and storage variables.
 */
export const serverEnv = (): ServerEnv => {
  cached ??= serverEnvSchema.parse(process.env);
  return cached;
};
