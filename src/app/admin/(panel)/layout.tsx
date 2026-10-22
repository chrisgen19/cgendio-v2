import {Suspense} from 'react';
import {AdminShell} from '@/components/admin/admin-shell';
import {requireAdmin} from '@/server/admin-session';

/** Every admin page except sign-in. The session is read per request, so the gate sits inside Suspense. */
export default function PanelLayout({children}: LayoutProps<'/admin'>) {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted-foreground">Loading…</p>}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

async function AdminGate({children}: {children: React.ReactNode}) {
  const session = await requireAdmin();
  return <AdminShell user={{name: session.user.name, email: session.user.email, image: session.user.image ?? null}}>{children}</AdminShell>;
}
