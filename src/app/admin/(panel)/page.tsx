import type {Metadata} from 'next';
import Link from 'next/link';
import {PageHeader} from '@/components/admin/page-header';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {getDashboard} from '@/server/admin/data';

export const metadata: Metadata = {title: 'Dashboard'};

const COLLECTIONS = [
  {key: 'projects', label: 'Projects', href: '/admin/projects'},
  {key: 'posts', label: 'Posts', href: '/admin/posts'},
  {key: 'milestones', label: 'Milestones', href: '/admin/milestones'},
  {key: 'timeline', label: 'Timeline entries', href: '/admin/timeline'},
  {key: 'stack', label: 'Stack items', href: '/admin/stack'},
] as const;

const when = new Intl.DateTimeFormat('en-AU', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila'});

export default async function AdminDashboard() {
  const {counts, edits} = await getDashboard();
  return (
    <>
      <PageHeader title="Dashboard" description="Saving anything here updates the live site within seconds." />
      <div className="mb-8 grid grid-cols-5 gap-4 max-lg:grid-cols-3 max-md:grid-cols-2">
        {COLLECTIONS.map((c) => (
          <Link key={c.key} href={c.href} className="rounded-lg focus-visible:ring-3 focus-visible:ring-ring/50">
            <Card className="h-full transition-colors hover:bg-muted">
              <CardHeader>
                <CardTitle className="text-3xl tabular-nums">{counts[c.key]}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{c.label}</CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <h2 className="mb-3 text-lg font-semibold">Recent edits</h2>
      {edits.length === 0 ? (
        <p className="text-sm text-muted-foreground">No edits yet.</p>
      ) : (
        <ol className="flex flex-col divide-y rounded-lg border">
          {edits.map((edit) => (
            <li key={`${edit.kind}-${edit.id}`} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
              <Link href={edit.href} className="font-medium hover:underline">
                {edit.label}
              </Link>
              <span className="text-muted-foreground">
                {edit.kind} · {when.format(new Date(edit.at))}
              </span>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
