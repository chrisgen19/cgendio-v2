'use client';

import {useState} from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {FieldShell} from './form-fields';

type MarkdownFieldProps = {
  name: string;
  label: string;
  defaultValue?: string | null;
  errors: Record<string, string[]> | undefined;
  hint?: string;
};

/** Markdown source on the left, a live preview on the right (stacked on phones). Raw HTML is never rendered. */
export function MarkdownField({name, label, defaultValue, errors, hint}: MarkdownFieldProps) {
  const [value, setValue] = useState(defaultValue ?? '');

  return (
    <FieldShell
      name={name}
      label={label}
      hint={hint ?? 'Markdown: **bold**, _italic_, ## headings, - lists, [links](https://…), tables.'}
      errors={errors}
    >
      {(aria) => (
        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <textarea
            name={name}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            rows={18}
            className="min-h-72 w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...aria}
          />
          <section aria-label={`${label} preview`} className="min-h-72 overflow-auto rounded-lg border bg-secondary p-4">
            {value.trim() ? (
              <div className="prose-admin">
                <Markdown remarkPlugins={[remarkGfm]}>{value}</Markdown>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">The preview appears here.</p>
            )}
          </section>
        </div>
      )}
    </FieldShell>
  );
}
