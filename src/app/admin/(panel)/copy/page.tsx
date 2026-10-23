import type {Metadata} from 'next';
import {PageCopyForm} from '@/components/admin/page-copy-form';
import {PageHeader} from '@/components/admin/page-header';
import {getPageCopyForEdit} from '@/server/admin/data';

export const metadata: Metadata = {title: 'Page copy'};

export default async function PageCopyPage() {
  const copy = await getPageCopyForEdit();
  return (
    <>
      <PageHeader title="Page copy" description="Every heading and line of text on the home page, section by section." />
      <PageCopyForm copy={copy} />
    </>
  );
}
