import type {Metadata} from 'next';
import {InboxList} from '@/components/admin/inbox-list';
import {PageHeader} from '@/components/admin/page-header';
import {listContactMessages} from '@/server/admin/data';

export const metadata: Metadata = {title: 'Inbox'};

export default async function InboxPage() {
  const messages = await listContactMessages();
  return (
    <>
      <PageHeader title="Inbox" description="Messages from the contact form." />
      <InboxList messages={messages} />
    </>
  );
}
