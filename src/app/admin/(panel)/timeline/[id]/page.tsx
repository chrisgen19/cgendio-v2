import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {PageHeader} from '@/components/admin/page-header';
import {TimelineForm} from '@/components/admin/small-forms';
import {getTimelineEntryForEdit} from '@/server/admin/data';

export const metadata: Metadata = {title: 'Edit timeline entry'};

export default async function TimelineEditPage({params}: PageProps<'/admin/timeline/[id]'>) {
  const {id} = await params;
  const entry = id === 'new' ? null : await getTimelineEntryForEdit(id);
  if (id !== 'new' && !entry) notFound();
  return (
    <>
      <PageHeader title={entry ? entry.role : 'New timeline entry'} description={entry ? undefined : 'Added at the end of the list.'} />
      <TimelineForm entry={entry} />
    </>
  );
}
