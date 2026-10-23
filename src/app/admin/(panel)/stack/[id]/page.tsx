import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {PageHeader} from '@/components/admin/page-header';
import {StackForm} from '@/components/admin/small-forms';
import {getStackItemForEdit} from '@/server/admin/data';

export const metadata: Metadata = {title: 'Edit stack item'};

export default async function StackEditPage({params}: PageProps<'/admin/stack/[id]'>) {
  const {id} = await params;
  const item = id === 'new' ? null : await getStackItemForEdit(id);
  if (id !== 'new' && !item) notFound();
  return (
    <>
      <PageHeader title={item ? item.name : 'Add to stack'} description={item ? undefined : 'Added at the end of the strip.'} />
      <StackForm item={item} />
    </>
  );
}
