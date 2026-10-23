import type {Metadata} from 'next';
import {Toaster} from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: {default: 'Admin', template: '%s · Admin · Cgdiomampo.dev'},
  robots: {index: false, follow: false},
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
