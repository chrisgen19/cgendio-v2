import type {Metadata} from 'next';
import Link from 'next/link';
import {PageHeader} from '@/components/admin/page-header';
import {SortableList} from '@/components/admin/sortable-list';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {listTimeline} from '@/server/admin/data';

export const metadata: Metadata = {title: 'Timeline'};

export default async function TimelinePage() {
  const entries = await listTimeline();
  return (
    <>
      <PageHeader
        title="Timeline"
        description="Shown top to bottom in this order, newest first. Drag or use the arrows to reorder."
        actions={
          <Button asChild>
            <Link href="/admin/timeline/new">New entry</Link>
          </Button>
        }
      />
      <SortableList
        collection="timeline"
        items={entries.map((entry) => ({
          id: entry.id,
          title: entry.role,
          editHref: `/admin/timeline/${entry.id}`,
          meta: (
            <>
              {entry.isCurrent ? <Badge>NOW</Badge> : null}
              <span>{entry.when}</span>
              <span>{entry.org}</span>
            </>
          ),
        }))}
      />
    </>
  );
}
