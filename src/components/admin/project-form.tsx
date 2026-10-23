'use client';

import {useActionState} from 'react';
import {Card, CardContent} from '@/components/ui/card';
import {saveProject} from '@/server/actions/projects';
import type {ActionResult} from '@/server/admin/action-helpers';
import {SelectField, SubmitButton, SwitchField, TextAreaField, TextField} from './form-fields';
import {MarkdownField} from './markdown-field';
import {TitleSlugFields} from './title-slug-fields';
import {UploadField} from './upload-field';
import {UploadStatusProvider} from './upload-status';
import {useActionToast} from './use-action-toast';

export type ProjectFormValues = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  kindLabel: string;
  group: 'CLIENT' | 'PERSONAL';
  glyph: string;
  theme: 'INK' | 'LIME' | 'TINT' | 'GRAY';
  span: number;
  tags: string[];
  featured: boolean;
  status: 'DRAFT' | 'PUBLISHED';
  coverImageUrl: string | null;
  caseStudy: string | null;
  liveUrl: string | null;
  repoUrl: string | null;
};

const GROUPS = [
  {value: 'CLIENT', label: 'Client work'},
  {value: 'PERSONAL', label: 'Personal'},
] as const;
const THEMES = [
  {value: 'INK', label: 'Ink (dark)'},
  {value: 'LIME', label: 'Lime'},
  {value: 'TINT', label: 'Tint (soft blue)'},
  {value: 'GRAY', label: 'Grey'},
] as const;
const SPANS = [
  {value: '7', label: '7 of 12 (wide)'},
  {value: '6', label: '6 of 12 (half)'},
  {value: '5', label: '5 of 12'},
  {value: '4', label: '4 of 12 (narrow)'},
] as const;

export function ProjectForm({project}: {project: ProjectFormValues | null}) {
  const [result, action] = useActionState<ActionResult | null, FormData>(saveProject, null);
  useActionToast(result);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <UploadStatusProvider>
      <form action={action} className="flex max-w-5xl flex-col gap-6">
        <input type="hidden" name="id" value={project?.id ?? ''} />
        <Card>
          <CardContent className="flex flex-col gap-4">
            <TitleSlugFields defaultTitle={project?.title} defaultSlug={project?.slug} errors={errors} />
            <TextAreaField name="summary" label="Summary" defaultValue={project?.summary} rows={3} errors={errors} required />
            <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
              <TextField
                name="kindLabel"
                label="Kind label"
                hint="e.g. CLIENT · MIGRATION"
                defaultValue={project?.kindLabel}
                errors={errors}
                required
              />
              <TextField name="glyph" label="Glyph" hint="The big text on the card" defaultValue={project?.glyph} errors={errors} required />
              <TextField name="tags" label="Tags" hint="Comma-separated, up to 8" defaultValue={project?.tags.join(', ')} errors={errors} />
            </div>
            <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
              <SelectField name="group" label="Group" options={GROUPS} defaultValue={project?.group ?? 'CLIENT'} errors={errors} />
              <SelectField name="theme" label="Card theme" options={THEMES} defaultValue={project?.theme ?? 'INK'} errors={errors} />
              <SelectField name="span" label="Card width" options={SPANS} defaultValue={String(project?.span ?? 6)} errors={errors} />
            </div>
            <div className="flex flex-wrap gap-8">
              <SwitchField name="status" label="Published" hint="Drafts never appear on the site" defaultChecked={project?.status === 'PUBLISHED'} />
              <SwitchField
                name="featured"
                label="Featured"
                hint="Shown in Selected work on the home page"
                defaultChecked={project?.featured ?? true}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
              <UploadField name="coverImageUrl" label="Cover image" kind="image" defaultValue={project?.coverImageUrl} />
              <TextField name="liveUrl" label="Live site" type="url" defaultValue={project?.liveUrl ?? ''} errors={errors} />
              <TextField name="repoUrl" label="Repository" type="url" defaultValue={project?.repoUrl ?? ''} errors={errors} />
            </div>
            <MarkdownField name="caseStudy" label="Case study" defaultValue={project?.caseStudy} errors={errors} />
          </CardContent>
        </Card>
        <div>
          <SubmitButton>{project ? 'Save project' : 'Create project'}</SubmitButton>
        </div>
      </form>
    </UploadStatusProvider>
  );
}
