import {betterAuth} from 'better-auth';
import {prismaAdapter} from 'better-auth/adapters/prisma';
import {nextCookies} from 'better-auth/next-js';
import {authEnv} from '@/lib/env';
import {db} from './db';

/**
 * Admin sign-in: GitHub only, for the emails in ADMIN_EMAILS. Anyone else is stopped before an account is created
 * (databaseHooks below), and requireAdmin() re-checks the allowlist on every admin request and server action.
 */
const isAdminEmail = (email: string | null | undefined) => Boolean(email && authEnv().ADMIN_EMAILS.includes(email.toLowerCase()));

const createAuth = () =>
  betterAuth({
    secret: authEnv().BETTER_AUTH_SECRET,
    baseURL: authEnv().BETTER_AUTH_URL,
    database: prismaAdapter(db, {provider: 'postgresql'}),
    socialProviders: {
      github: {
        clientId: authEnv().GITHUB_CLIENT_ID,
        clientSecret: authEnv().GITHUB_CLIENT_SECRET,
      },
    },
    databaseHooks: {
      user: {
        create: {
          // Returning false refuses the sign-up: no user row is ever written for a non-admin account
          before: async (user) => isAdminEmail(user.email),
        },
      },
    },
    // Must be last, so server actions that touch auth can set cookies
    plugins: [nextCookies()],
  });

let instance: ReturnType<typeof createAuth> | undefined;

/**
 * Created on first use, not at import: `next build` loads the admin routes but shouldn't need the auth secrets
 * (the build environment only has DATABASE_URL).
 */
export const getAuth = () => {
  instance ??= createAuth();
  return instance;
};

export {isAdminEmail};
