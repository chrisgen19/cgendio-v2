'use client';

import {type ReactNode, type SubmitEvent, startTransition, useActionState, useEffect, useRef} from 'react';
import {Button} from '@/components/ui-site/button';
import {cn} from '@/lib/cn';
import {CONTACT_FIELDS, type ContactField, type ContactResult, PROJECT_TYPES} from '@/lib/contact';
import {submitContact} from '@/server/actions/contact';

const CONTROL =
  'w-full rounded-field border border-line bg-white px-4 text-base text-ink transition-colors duration-150 hover:border-ink aria-invalid:border-danger motion-reduce:transition-none';

type FieldControlProps = {id: string; name: ContactField; 'aria-invalid'?: true; 'aria-describedby'?: string};

function Field({
  name,
  label,
  error,
  children,
}: {
  name: ContactField;
  label: string;
  error?: string;
  children: (props: FieldControlProps) => ReactNode;
}) {
  const id = `contact-${name}`;
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      {children({id, name, ...(error ? {'aria-invalid': true, 'aria-describedby': errorId} : {})})}
      {error ? (
        <p id={errorId} className="m-0 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The /contact form. It submits from onSubmit rather than <form action>, so React doesn't clear what was typed when
 * the server returns field errors; focus then moves to the first invalid field. On success the form is replaced by a
 * confirmation that takes focus.
 */
export function ContactForm() {
  const [result, dispatch, pending] = useActionState<ContactResult | null, FormData>(submitContact, null);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!result) return;
    if (result.ok) {
      doneRef.current?.focus();
      return;
    }
    const first = CONTACT_FIELDS.find((field) => result.fieldErrors?.[field]);
    const control = first ? formRef.current?.elements.namedItem(first) : null;
    if (control instanceof HTMLElement) control.focus();
  }, [result]);

  if (result?.ok) {
    return (
      <output className="flex flex-col gap-3 rounded-card border border-line bg-white p-8 shadow-card max-md:p-6">
        <h2 ref={doneRef} tabIndex={-1} className="m-0 font-display text-[32px] leading-[1.1] font-bold tracking-[-0.03em]">
          Thanks, we&apos;ve got your message.
        </h2>
        <p className="m-0 text-lg leading-[1.55] text-muted">We&apos;ll read it and get back to you.</p>
      </output>
    );
  }

  const errors = result && !result.ok ? result.fieldErrors : undefined;
  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="relative flex flex-col gap-5 rounded-card border border-line bg-white p-8 shadow-card max-md:p-6"
    >
      {result && !result.ok && result.error ? (
        <p role="alert" className="m-0 rounded-field border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {result.error}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
        <Field name="name" label="Name" error={errors?.name}>
          {(props) => <input type="text" autoComplete="name" required maxLength={120} className={cn(CONTROL, 'h-13')} {...props} />}
        </Field>
        <Field name="email" label="Email" error={errors?.email}>
          {(props) => <input type="email" autoComplete="email" required maxLength={200} className={cn(CONTROL, 'h-13')} {...props} />}
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
        <Field name="company" label="Company (optional)" error={errors?.company}>
          {(props) => <input type="text" autoComplete="organization" maxLength={120} className={cn(CONTROL, 'h-13')} {...props} />}
        </Field>
        <Field name="projectType" label="What's it about?" error={errors?.projectType}>
          {(props) => (
            <span className="relative block">
              <select required defaultValue="" className={cn(CONTROL, 'h-13 cursor-pointer appearance-none pr-11')} {...props}>
                <option value="" disabled>
                  Choose one
                </option>
                {PROJECT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          )}
        </Field>
      </div>
      <Field name="message" label="Message" error={errors?.message}>
        {(props) => <textarea required rows={7} maxLength={5000} className={cn(CONTROL, 'min-h-40 resize-y py-3 leading-[1.55]')} {...props} />}
      </Field>
      {/* Honeypot: hidden from people and assistive tech; bots that fill every field get a fake success */}
      <div aria-hidden="true" className="absolute -left-[10000px] size-px overflow-hidden">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input id="contact-website" type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div>
        <Button type="submit" disabled={pending} className="disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0">
          {pending ? 'Sending…' : 'Send message'}
        </Button>
      </div>
    </form>
  );
}
