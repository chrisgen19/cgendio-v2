'use client';

import {Card, CardContent} from '@/components/ui/card';
import {saveSettings} from '@/server/actions/site';
import {SubmitButton, SwitchField, TextField} from './form-fields';
import {UploadField} from './upload-field';
import {UploadStatusProvider} from './upload-status';
import {useActionToast} from './use-action-toast';
import {useAdminForm} from './use-admin-form';

type SettingsFormProps = {
  settings: {contactEmail: string; openToProjects: boolean; cvUrl: string | null; photoUrl: string | null; linkedinUrl: string | null};
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
            <TextField
              name="linkedinUrl"
              label="LinkedIn profile"
              type="url"
              hint="The footer's LinkedIn link; hidden while this is empty."
              defaultValue={settings.linkedinUrl ?? ''}
              errors={errors}
            />
            <UploadField
              name="photoUrl"
              label="About photo"
              kind="image"
              defaultValue={settings.photoUrl}
              hint="JPEG, PNG, WebP or AVIF, up to 5 MB. Portrait (4:5) works best; without one the About section shows a placeholder."
            />
            <UploadField
              name="cvUrl"
              label="CV"
              kind="cv"
              defaultValue={settings.cvUrl}
              hint="PDF, up to 10 MB. The Download CV buttons link to it; without one they're hidden."
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
