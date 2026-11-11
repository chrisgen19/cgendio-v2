'use client';

import {type FormEvent, type SubmitEvent, startTransition, useActionState, useEffect, useMemo, useRef, useState} from 'react';
import {track} from '@/lib/analytics';
import {CONTACT_FIELDS, type ContactField, type ContactResult} from '@/lib/contact';
import {submitContact} from '@/server/actions/contact';

/**
 * The contact form's submit logic, shared by every form layout. It submits from onSubmit rather than <form action>, so
 * React doesn't clear what was typed when the server returns field errors; focus then moves to the first invalid field
 * (by `name`). On success, focus moves to the element holding `doneRef`.
 *
 * `errors` drops a field's error as soon as the visitor edits that field (attach `onEdit` as the form's onChange);
 * `serverErrors` is the untouched set from the last send, stable until the next one.
 *
 * A successful send records a GA4 `generate_lead` with the topic's value (never what was typed). Not when the honeypot
 * was filled: the server answers bots with the same fake success, so the form checks the field itself.
 */
export const useContactForm = <Done extends HTMLElement = HTMLHeadingElement>() => {
  const [result, dispatch, pending] = useActionState<ContactResult | null, FormData>(submitContact, null);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<Done>(null);
  const lead = useRef<{topic: string; bot: boolean} | null>(null);
  const [edited, setEdited] = useState<ReadonlySet<string>>(new Set());
  const [lastResult, setLastResult] = useState(result);
  const serverErrors = result && !result.ok ? result.fieldErrors : undefined;

  // A new result starts with nothing edited
  if (lastResult !== result) {
    setLastResult(result);
    setEdited(new Set());
  }

  const errors = useMemo(() => {
    if (!serverErrors || edited.size === 0) return serverErrors;
    return Object.fromEntries(Object.entries(serverErrors).filter(([field]) => !edited.has(field))) as Partial<Record<ContactField, string>>;
  }, [serverErrors, edited]);

  const onEdit = (event: FormEvent<HTMLFormElement>) => {
    const {name} = event.target as HTMLInputElement;
    if (name && serverErrors?.[name as ContactField] && !edited.has(name)) setEdited(new Set(edited).add(name));
  };

  useEffect(() => {
    if (!result) return;
    if (result.ok) {
      if (lead.current && !lead.current.bot) track('generate_lead', {form_topic: lead.current.topic});
      lead.current = null;
      doneRef.current?.focus();
      return;
    }
    const first = CONTACT_FIELDS.find((field) => result.fieldErrors?.[field]);
    const control = first ? formRef.current?.elements.namedItem(first) : null;
    if (control instanceof HTMLElement) control.focus();
    // A radio group comes back as a RadioNodeList: focus its first option
    else if (control && 'length' in control && control[0] instanceof HTMLElement) control[0].focus();
  }, [result]);

  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    lead.current = {topic: String(formData.get('projectType') ?? ''), bot: String(formData.get('website') ?? '') !== ''};
    startTransition(() => dispatch(formData));
  };

  return {
    sent: result?.ok === true,
    pending,
    formError: result && !result.ok ? result.error : undefined,
    errors,
    serverErrors,
    onEdit,
    formRef,
    doneRef,
    onSubmit,
  };
};
