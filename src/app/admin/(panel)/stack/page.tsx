import type {Metadata} from 'next';
import Link from 'next/link';
import {PageHeader} from '@/components/admin/page-header';
import {SortableList} from '@/components/admin/sortable-list';
import {Button} from '@/components/ui/button';
import {listStack} from '@/server/admin/data';

export const metadata: Metadata = {title: 'Stack'};

export default async function StackPage() {
  const stack = await listStack();
  return (
    <>
      <PageHeader
        title="Stack"
        description="The chips under the hero, in this order. Drag or use the arrows to reorder."
        actions={
          <Button asChild>
            <Link href="/admin/stack/new">Add to stack</Link>
          </Button>
        }
      />
      <SortableList collection="stack" items={stack.map((item) => ({id: item.id, title: item.name, editHref: `/admin/stack/${item.id}`}))} />
    </>
  );
}
