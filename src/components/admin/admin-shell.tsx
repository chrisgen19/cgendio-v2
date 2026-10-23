'use client';

import {ExternalLink, LogOut} from 'lucide-react';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import type {ReactNode} from 'react';
import {Button} from '@/components/ui/button';
import {authClient} from '@/lib/auth-client';
import {cn} from '@/lib/utils';

const NAV = [
  {href: '/admin', label: 'Dashboard'},
  {href: '/admin/projects', label: 'Projects'},
  {href: '/admin/posts', label: 'Posts'},
  {href: '/admin/milestones', label: 'Milestones'},
  {href: '/admin/timeline', label: 'Timeline'},
  {href: '/admin/stack', label: 'Stack'},
  {href: '/admin/copy', label: 'Page copy'},
  {href: '/admin/settings', label: 'Settings'},
] as const;

type AdminShellProps = {
  user: {name: string; email: string; image: string | null};
  children: ReactNode;
};

/** Plain, tool-like frame: a sidebar on desktop, a scrolling nav row on phones. */
export function AdminShell({user, children}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const signOut = async () => {
    await authClient.signOut();
    router.push('/admin/sign-in');
  };

  return (
    <div className="flex min-h-svh max-md:flex-col">
      <aside className="flex w-60 shrink-0 flex-col gap-6 border-r bg-secondary p-4 max-md:w-full max-md:gap-3 max-md:border-r-0 max-md:border-b">
        <div className="flex items-center justify-between gap-2">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <span className="inline-grid size-8 place-items-center rounded-lg bg-primary font-display text-sm font-extrabold text-lime">cg</span>
            Admin
          </Link>
          <Button variant="ghost" size="icon" asChild>
            <a href="/" target="_blank" rel="noreferrer" aria-label="View site (opens in a new tab)">
              <ExternalLink />
            </a>
          </Button>
        </div>
        <nav aria-label="Admin" className="flex flex-col gap-1 max-md:flex-row max-md:overflow-x-auto">
          {NAV.map((item) => {
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-11 items-center rounded-lg px-3 text-sm whitespace-nowrap hover:bg-accent',
                  active && 'bg-background font-medium shadow-xs',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center justify-between gap-2 text-sm max-md:hidden">
          <span className="min-w-0 truncate text-muted-foreground" title={user.email}>
            {user.name || user.email}
          </span>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut />
            Sign out
          </Button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-8 max-md:p-4">{children}</main>
      <div className="hidden border-t p-4 max-md:flex max-md:justify-end">
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut />
          Sign out
        </Button>
      </div>
    </div>
  );
}
