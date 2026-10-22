import {getSessionCookie} from 'better-auth/cookies';
import {type NextRequest, NextResponse} from 'next/server';

/**
 * Optimistic only: sends visitors without a session cookie to the sign-in page before rendering anything. The real
 * check (a valid session for an allowlisted email) is requireAdmin() in the admin layout and in every server action.
 */
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) return NextResponse.redirect(new URL('/admin/sign-in', request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/((?!sign-in).*)'],
};
