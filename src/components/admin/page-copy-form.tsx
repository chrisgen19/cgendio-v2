'use client';

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {savePageCopy} from '@/server/actions/site';
import {SubmitButton, TextAreaField, TextField} from './form-fields';
import {useActionToast} from './use-action-toast';
import {useAdminForm} from './use-admin-form';

type Field = {key: string; label: string; long?: boolean};

const HIGHLIGHT_HINT = 'Wrap the highlighted words in [[double brackets]].';

const SECTIONS: ReadonlyArray<{title: string; fields: Field[]}> = [
  {title: 'Stack strip', fields: [{key: 'stack.eyebrow', label: 'Eyebrow'}]},
  {
    title: 'About',
    fields: [
      {key: 'about.eyebrow', label: 'Eyebrow'},
      {key: 'about.heading', label: 'Heading'},
      {key: 'about.intro', label: 'Intro', long: true},
      {key: 'about.name', label: 'Name (panel title and photo description)'},
      {key: 'about.frameLabel', label: 'Frame label above the photo'},
      {key: 'about.role.label', label: 'Role row: label'},
      {key: 'about.role.value', label: 'Role row: value (also the job title in search results)'},
      {key: 'about.role.note', label: 'Role row: note'},
      {key: 'about.role.pin', label: 'Role row: pin on the photo'},
      {key: 'about.based.label', label: 'Based in row: label'},
      {key: 'about.based.value', label: 'Based in row: value'},
      {key: 'about.based.note', label: 'Based in row: note'},
      {key: 'about.timezone.label', label: 'Timezone row: label'},
      {key: 'about.timezone.value', label: 'Timezone row: value'},
      {key: 'about.timezone.note', label: 'Timezone row: note'},
      {key: 'about.timezone.pin', label: 'Timezone row: pin on the photo'},
      {key: 'about.experience.label', label: 'Experience row: label'},
      {key: 'about.experience.value', label: 'Experience row: value'},
      {key: 'about.experience.note', label: 'Experience row: note'},
      {key: 'about.experience.pin', label: 'Experience row: pin on the photo'},
      {key: 'about.sites.label', label: 'Sites row: label'},
      {key: 'about.sites.value', label: 'Sites row: value'},
      {key: 'about.sites.note', label: 'Sites row: note'},
      {key: 'about.sites.pin', label: 'Sites row: pin on the photo'},
      {key: 'about.status.label', label: 'Status row: label'},
      {key: 'about.status.open', label: 'Status row: open to projects'},
      {key: 'about.status.closed', label: 'Status row: not taking work'},
      {key: 'about.contactLabel', label: 'Contact button'},
      {key: 'about.cvLabel', label: 'CV button'},
    ],
  },
  {
    title: 'What we build',
    fields: [
      {key: 'build.eyebrow', label: 'Eyebrow'},
      {key: 'build.heading', label: 'Heading'},
      {key: 'build.wp.label', label: 'WordPress side: label'},
      {key: 'build.wp.labelSub', label: 'WordPress side: second line'},
      {key: 'build.wp.line', label: 'WordPress side: text', long: true},
      {key: 'build.wp.proof', label: 'WordPress side: proof', long: true},
      {key: 'build.next.label', label: 'Next.js side: label'},
      {key: 'build.next.labelSub', label: 'Next.js side: second line'},
      {key: 'build.next.line', label: 'Next.js side: text', long: true},
      {key: 'build.next.proof', label: 'Next.js side: proof', long: true},
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
  const {result, pending, onSubmit} = useAdminForm(savePageCopy);
  useActionToast(result);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-6">
      {SECTIONS.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {section.fields.map((field) => {
              const hint = field.key.endsWith('heading') ? HIGHLIGHT_HINT : undefined;
              return field.long ? (
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
        <SubmitButton pending={pending}>Save page copy</SubmitButton>
      </div>
    </form>
  );
}
