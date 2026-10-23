import type {Metadata} from 'next';
import Link from 'next/link';
import {PageHeader} from '@/components/admin/page-header';
import {SortableList} from '@/components/admin/sortable-list';
import {Button} from '@/components/ui/button';
import {listMilestones} from '@/server/admin/data';

export const metadata: Metadata = {title: 'Milestones'};

export default async function MilestonesPage() {
  const milestones = await listMilestones();
  return (
    <>
      <PageHeader
        title="Milestones"
        description="Shown left to right in this order. Drag or use the arrows to reorder."
        actions={
          <Button asChild>
            <Link href="/admin/milestones/new">New milestone</Link>
          </Button>
        }
      />
      <SortableList
        collection="milestones"
        items={milestones.map((m) => ({
          id: m.id,
          title: m.title,
          editHref: `/admin/milestones/${m.id}`,
          meta: (
            <>
              <span>{m.kind}</span>
              <span>{m.value}</span>
            </>
          ),
        }))}
      />
    </>
  );
}
