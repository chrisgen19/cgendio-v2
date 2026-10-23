import type {Metadata} from 'next';
import {PageHeader} from '@/components/admin/page-header';
import {SettingsForm} from '@/components/admin/settings-form';
import {getSettingsForEdit} from '@/server/admin/data';

export const metadata: Metadata = {title: 'Settings'};

export default async function SettingsPage() {
  const settings = await getSettingsForEdit();
  return (
    <>
      <PageHeader title="Settings" description="Contact details, availability and the CV." />
      <SettingsForm settings={settings} />
    </>
  );
}
