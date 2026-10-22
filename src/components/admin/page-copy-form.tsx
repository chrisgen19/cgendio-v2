'use client';

import {useActionState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {savePageCopy} from '@/server/actions/site';
import type {ActionResult} from '@/server/admin/action-helpers';
import {SubmitButton, TextAreaField, TextField} from './form-fields';
import {useActionToast} from './use-action-toast';

type Field = {key: string; label: string; long?: boolean};

const HIGHLIGHT_HINT = 'Wrap the highlighted words in [[double brackets]].';

const SECTIONS: ReadonlyArray<{title: string; fields: Field[]}> = [
  {title: 'Stack strip', fields: [{key: 'stack.eyebrow', label: 'Eyebrow'}]},
  {
    title: 'About',
    fields: [
      {key: 'about.eyebrow', label: 'Eyebrow'},
      {key: 'about.statement', label: 'Statement', long: true},
      {key: 'about.name', label: 'Photo badge: name'},
      {key: 'about.role', label: 'Photo badge: role'},
      {key: 'about.fact1.title', label: 'Fact 1 title'},
      {key: 'about.fact1.body', label: 'Fact 1 text'},
      {key: 'about.fact2.title', label: 'Fact 2 title'},
      {key: 'about.fact2.body', label: 'Fact 2 text'},
      {key: 'about.fact3.title', label: 'Fact 3 title'},
      {key: 'about.fact3.body', label: 'Fact 3 text'},
    ],
  },
  {
    title: 'Work',
    fields: [
      {key: 'work.eyebrow', label: 'Eyebrow (the project count is added after it)'},
      {key: 'work.heading', label: 'Heading'},
    ],
  },
  {
    title: 'Milestones',
    fields: [
      {key: 'milestones.eyebrow', label: 'Eyebrow'},
      {key: 'milestones.heading', label: 'Heading'},
      {key: 'milestones.lede', label: 'Intro', long: true},
    ],
  },
  {
    title: 'Timeline',
    fields: [
      {key: 'timeline.eyebrow', label: 'Eyebrow'},
      {key: 'timeline.heading', label: 'Heading'},
      {key: 'timeline.lede', label: 'Intro', long: true},
      {key: 'timeline.cvLabel', label: 'CV button'},
    ],
  },
  {
    title: 'Blog',
    fields: [
      {key: 'blog.eyebrow', label: 'Eyebrow'},
      {key: 'blog.heading', label: 'Heading'},
      {key: 'blog.lede', label: 'Intro', long: true},
      {key: 'blog.allLabel', label: 'All articles button'},
    ],
  },
  {
    title: 'Contact',
    fields: [
      {key: 'contact.eyebrow', label: 'Eyebrow'},
      {key: 'contact.heading', label: 'Heading'},
      {key: 'contact.lede', label: 'Intro', long: true},
      {key: 'contact.primaryLabel', label: 'Main button'},
      {key: 'contact.cvLabel', label: 'CV button'},
      {key: 'contact.location', label: 'Line after the email'},
    ],
  },
];

export function PageCopyForm({copy}: {copy: Record<string, string>}) {
  const [result, action] = useActionState<ActionResult | null, FormData>(savePageCopy, null);
  useActionToast(result);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <form action={action} className="flex max-w-3xl flex-col gap-6">
      {SECTIONS.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {section.fields.map((field) => {
              const hint = field.key.endsWith('heading') || field.key === 'about.statement' ? HIGHLIGHT_HINT : undefined;
              return field.long || field.key === 'about.statement' ? (
                <TextAreaField
                  key={field.key}
                  name={field.key}
                  label={field.label}
                  hint={hint}
                  defaultValue={copy[field.key]}
                  rows={3}
                  errors={errors}
                  required
                />
              ) : (
                <TextField key={field.key} name={field.key} label={field.label} hint={hint} defaultValue={copy[field.key]} errors={errors} required />
              );
            })}
          </CardContent>
        </Card>
      ))}
      <div className="sticky bottom-4">
        <SubmitButton>Save page copy</SubmitButton>
      </div>
    </form>
  );
}
