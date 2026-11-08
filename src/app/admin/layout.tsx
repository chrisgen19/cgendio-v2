import type {Metadata, Viewport} from 'next';
import {Toaster} from '@/components/ui/sonner';
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

/** Everything under /admin: the shadcn theme (scoped by .admin-theme) and toasts. The sign-in check is in (panel). */
export default function AdminRootLayout({children}: LayoutProps<'/admin'>) {
  return (
    <div className="admin-theme min-h-svh font-body">
      {children}
      {/* The admin is light only, whatever the public site's theme */}
      <Toaster position="bottom-right" theme="light" />
    </div>
  );
}
