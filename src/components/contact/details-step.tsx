'use client';

import {cn} from '@/lib/cn';
import type {ContactField} from '@/lib/contact';
import {CONTROL, Field} from './form-field';

type DetailsStepProps = {
  errors?: Partial<Record<ContactField, string>>;
  onEmail: (value: string) => void;
};

/** Step 3: who to reply to. Autofill-friendly, and asked only once. */
export function DetailsStep({errors, onEmail}: DetailsStepProps) {
  return (
    <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
      <Field name="name" label="Your name" error={errors?.name}>
        {(props) => <input type="text" autoComplete="name" required maxLength={120} className={cn(CONTROL, 'h-13')} {...props} />}
      </Field>
      <Field name="email" label="Email for my reply" error={errors?.email}>
        {(props) => (
          <input
            type="email"
            autoComplete="email"
            required
            maxLength={200}
            onChange={(event) => onEmail(event.currentTarget.value)}
            className={cn(CONTROL, 'h-13')}
            {...props}
          />
        )}
      </Field>
      <div className="col-span-full">
        <Field name="company" label="Company (optional)" error={errors?.company}>
          {(props) => <input type="text" autoComplete="organization" maxLength={120} className={cn(CONTROL, 'h-13')} {...props} />}
        </Field>
      </div>
    </div>
  );
}
