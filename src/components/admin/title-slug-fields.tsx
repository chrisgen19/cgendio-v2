'use client';

import {useState} from 'react';
import {slugify} from '@/lib/slugify';
import {TextField} from './form-fields';

type TitleSlugFieldsProps = {
  defaultTitle?: string;
  defaultSlug?: string;
  errors: Record<string, string[]> | undefined;
};

/** The slug follows the title until it's edited by hand (or the record already has one), then it stays put. */
export function TitleSlugFields({defaultTitle = '', defaultSlug = '', errors}: TitleSlugFieldsProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [slug, setSlug] = useState(defaultSlug);
  const [linked, setLinked] = useState(defaultSlug === '');

  return (
    <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
      <TextField
        name="title"
        label="Title"
        value={title}
        onChange={(event) => {
          setTitle(event.target.value);
          if (linked) setSlug(slugify(event.target.value));
        }}
        errors={errors}
        required
      />
      <TextField
        name="slug"
        label="Slug"
        hint="Used in the page address. Lowercase letters, numbers and hyphens."
        value={slug}
        onChange={(event) => {
          setLinked(false);
          setSlug(event.target.value);
        }}
        errors={errors}
        required
      />
    </div>
  );
}
