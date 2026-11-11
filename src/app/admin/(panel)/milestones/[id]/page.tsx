import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {PageHeader} from '@/components/admin/page-header';
import {MilestoneForm} from '@/components/admin/small-forms';
import {getMilestoneForEdit} from '@/server/admin/data';

// Session checks may redirect before this page renders; instant validation is segment-local.
export const instant = false;

export const metadata: Metadata = {title: 'Edit milestone'};

export default async function MilestoneEditPage({params}: PageProps<'/admin/milestones/[id]'>) {
  const {id} = await params;
  const milestone = id === 'new' ? null : await getMilestoneForEdit(id);
  if (id !== 'new' && !milestone) notFound();
  return (
    <>
      <PageHeader title={milestone ? milestone.title : 'New milestone'} description={milestone ? undefined : 'Added at the end of the list.'} />
      <MilestoneForm milestone={milestone} />
    </>
  );
}
