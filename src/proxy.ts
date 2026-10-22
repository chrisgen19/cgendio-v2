import {getSessionCookie} from 'better-auth/cookies';
import {type NextRequest, NextResponse} from 'next/server';
import {isPreviewType, verifyPreview} from '@/lib/preview-signature';

/**
 * Runs before rendering, so these answer with a real status code:
 * - /admin: an optimistic check only. Visitors without a session cookie go to the sign-in page; the real check (a
 *   valid session for an allowlisted email) is requireAdmin() in the admin layout and in every server action.
 * - /preview: a 404 for any link whose signature is wrong or expired. The page checks again before showing anything.
 */
export function proxy(request: NextRequest) {
  const {pathname, searchParams} = request.nextUrl;

  if (pathname.startsWith('/preview/')) {
    const [, , type, slug] = pathname.split('/');
    const valid =
      isPreviewType(type) && slug && verifyPreview(type, decodeURIComponent(slug), searchParams.get('expires'), searchParams.get('signature'));
    return valid ? NextResponse.next() : new NextResponse('Not found', {status: 404, headers: {'X-Robots-Tag': 'noindex, nofollow'}});
  }

  if (!getSessionCookie(request)) return NextResponse.redirect(new URL('/admin/sign-in', request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/((?!sign-in).*)', '/preview/:path*'],
};
