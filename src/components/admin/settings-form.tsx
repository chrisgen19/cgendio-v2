'use client';

import {useActionState} from 'react';
import {Card, CardContent} from '@/components/ui/card';
import {saveSettings} from '@/server/actions/site';
import type {ActionResult} from '@/server/admin/action-helpers';
import {SubmitButton, SwitchField, TextField} from './form-fields';
import {UploadField} from './upload-field';
import {useActionToast} from './use-action-toast';

type SettingsFormProps = {
  settings: {contactEmail: string; openToProjects: boolean; cvUrl: string | null};
};

export function SettingsForm({settings}: SettingsFormProps) {
  const [result, action] = useActionState<ActionResult | null, FormData>(saveSettings, null);
  useActionToast(result);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <form action={action} className="max-w-2xl">
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
            <SubmitButton>Save settings</SubmitButton>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
