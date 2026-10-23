'use client';

import {Card, CardContent} from '@/components/ui/card';
import {saveMilestone, saveStackItem, saveTimelineEntry} from '@/server/actions/small-collections';
import {SelectField, SubmitButton, SwitchField, TextAreaField, TextField} from './form-fields';
import {useActionToast} from './use-action-toast';
import {useAdminForm} from './use-admin-form';

/* Forms for the three simple ordered collections. */

type Milestone = {id: string; kind: string; value: string; title: string; description: string};

export function MilestoneForm({milestone}: {milestone: Milestone | null}) {
  const {result, pending, onSubmit} = useAdminForm(saveMilestone);
  useActionToast(result);
  const errors = result && !result.ok ? result.fieldErrors : undefined;
  return (
    <form onSubmit={onSubmit} className="max-w-2xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <input type="hidden" name="id" value={milestone?.id ?? ''} />
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <TextField name="kind" label="Kind" hint="e.g. MILESTONE, PROMOTION" defaultValue={milestone?.kind} errors={errors} required />
            <TextField name="value" label="Big value" hint="e.g. 2026, 20+, Nov ’25" defaultValue={milestone?.value} errors={errors} required />
          </div>
          <TextField name="title" label="Title" defaultValue={milestone?.title} errors={errors} required />
          <TextAreaField name="description" label="Description" rows={3} defaultValue={milestone?.description} errors={errors} required />
          <div>
            <SubmitButton pending={pending}>{milestone ? 'Save milestone' : 'Add milestone'}</SubmitButton>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

type TimelineEntry = {id: string; when: string; role: string; org: string; description: string; dot: string; isCurrent: boolean};

const DOTS = [
  {value: 'LIME', label: 'Lime'},
  {value: 'ACCENT', label: 'Accent (blue)'},
  {value: 'INK', label: 'Ink'},
  {value: 'PLACEHOLDER', label: 'Grey (placeholder)'},
] as const;

export function TimelineForm({entry}: {entry: TimelineEntry | null}) {
  const {result, pending, onSubmit} = useAdminForm(saveTimelineEntry);
  useActionToast(result);
  const errors = result && !result.ok ? result.fieldErrors : undefined;
  return (
    <form onSubmit={onSubmit} className="max-w-2xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <input type="hidden" name="id" value={entry?.id ?? ''} />
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <TextField name="when" label="When" hint="e.g. 2026 — Present" defaultValue={entry?.when} errors={errors} required />
            <SelectField name="dot" label="Dot colour" options={DOTS} defaultValue={entry?.dot ?? 'ACCENT'} errors={errors} />
          </div>
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <TextField name="role" label="Role" defaultValue={entry?.role} errors={errors} required />
            <TextField name="org" label="Organisation" defaultValue={entry?.org} errors={errors} required />
          </div>
          <TextAreaField name="description" label="Description" rows={3} defaultValue={entry?.description} errors={errors} required />
          <SwitchField name="isCurrent" label="Current role" hint="Shows the lime NOW badge" defaultChecked={entry?.isCurrent} />
          <div>
            <SubmitButton pending={pending}>{entry ? 'Save entry' : 'Add entry'}</SubmitButton>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

export function StackForm({item}: {item: {id: string; name: string} | null}) {
  const {result, pending, onSubmit} = useAdminForm(saveStackItem);
  useActionToast(result);
  const errors = result && !result.ok ? result.fieldErrors : undefined;
  return (
    <form onSubmit={onSubmit} className="max-w-md">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <input type="hidden" name="id" value={item?.id ?? ''} />
          <TextField name="name" label="Name" hint="e.g. Next.js" defaultValue={item?.name} errors={errors} required />
          <div>
            <SubmitButton pending={pending}>{item ? 'Save' : 'Add to stack'}</SubmitButton>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
