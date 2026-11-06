import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: {default: 'Admin', template: '%s · Admin · Cgdiomampo.dev'},
  robots: {index: false, follow: false},
};

/**
 * Sign-in sits at /sign-in (the previous site's URL), outside /admin and its layout, so it needs the shadcn theme
 * (.admin-theme) itself. No Toaster: the sign-in card shows its errors inline.
 */
export default function SignInLayout({children}: LayoutProps<'/sign-in'>) {
  return <div className="admin-theme min-h-svh font-body">{children}</div>;
}
