import type {Metadata, Viewport} from 'next';
import {THEME_COLORS} from '@/lib/theme';

export const metadata: Metadata = {
  title: {default: 'Admin', template: '%s · Admin · Cgdiomampo.dev'},
  robots: {index: false, follow: false},
};

/*
 * Opts back out of the root layout's `viewportFit: 'cover'` (#112). Cover exists for the public site's full-bleed
 * hero; the admin has no full-bleed surface and its chrome sits close to the edges (the mobile nav bar's p-4, the
 * sticky save button's bottom-4), so without insets a notched phone would put the status bar and home indicator
 * over them. `auto` is the browser default: the viewport stops at the safe area and nothing here needs insets.
 */
export const viewport: Viewport = {
  viewportFit: 'auto',
  themeColor: THEME_COLORS.light,
};

/**
 * Sign-in sits at /sign-in (the previous site's URL), outside /admin and its layout, so it needs the shadcn theme
 * (.admin-theme) itself. No Toaster: the sign-in card shows its errors inline.
 */
export default function SignInLayout({children}: LayoutProps<'/sign-in'>) {
  return <div className="admin-theme min-h-svh font-body">{children}</div>;
}
