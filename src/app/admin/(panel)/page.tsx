import type {Metadata} from 'next';

export const metadata: Metadata = {title: 'Dashboard'};

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Counts and recent edits arrive with the content admin.</p>
    </div>
  );
}
