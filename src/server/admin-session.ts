import 'server-only';
import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {cache} from 'react';
import {getAuth, isAdminEmail} from './auth';

/**
 * The admin session for this request, or null. Re-checks the email against ADMIN_EMAILS every time, so removing an
 * address from the allowlist locks that account out even if it still has a valid session.
 */
export const getAdminSession = cache(async () => {
  // headers() first: it's request data, so a build-time prerender stops here instead of creating the auth instance
  const requestHeaders = await headers();
  const session = await getAuth().api.getSession({headers: requestHeaders});
  if (!session || !isAdminEmail(session.user.email)) return null;
  return session;
});

/**
 * Call first in the admin layout and in every admin server action. Server actions are public POST endpoints, so the
 * layout's check doesn't protect them; each one runs this itself. Redirects to the sign-in page when there's no
 * admin session, so nothing after it runs.
 */
export const requireAdmin = async () => {
  const session = await getAdminSession();
  if (!session) redirect('/admin/sign-in');
  return session;
};
