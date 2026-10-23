'use client';

import {Card, CardContent} from '@/components/ui/card';
import {saveSettings} from '@/server/actions/site';
import {SubmitButton, SwitchField, TextField} from './form-fields';
import {UploadField} from './upload-field';
import {UploadStatusProvider} from './upload-status';
import {useActionToast} from './use-action-toast';
import {useAdminForm} from './use-admin-form';

type SettingsFormProps = {
  settings: {contactEmail: string; openToProjects: boolean; cvUrl: string | null};
};

export function SettingsForm({settings}: SettingsFormProps) {
  const {result, pending, onSubmit} = useAdminForm(saveSettings);
  useActionToast(result);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <UploadStatusProvider>
      <form onSubmit={onSubmit} className="max-w-2xl">
        <Card>
          <CardContent className="flex flex-col gap-5">
            <TextField
              name="contactEmail"
              label="Contact email"
              hint="Shown in the contact panel. It's still the placeholder until you change it."
              defaultValue={settings.contactEmail}
              errors={errors}
              required
            />
            <SwitchField
              name="openToProjects"
              label="Open to projects"
              hint="Shows the green status dot in the header"
              defaultChecked={settings.openToProjects}
            />
            <UploadField
              name="cvUrl"
              label="CV"
              kind="cv"
              defaultValue={settings.cvUrl}
              hint="PDF, up to 10 MB. The Download CV buttons link to it; without one they go to the contact section."
            />
            <div>
              <SubmitButton pending={pending}>Save settings</SubmitButton>
            </div>
          </CardContent>
        </Card>
      </form>
    </UploadStatusProvider>
  );
}
