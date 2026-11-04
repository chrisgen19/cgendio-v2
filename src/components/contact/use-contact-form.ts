'use client';

import {type SubmitEvent, startTransition, useActionState, useEffect, useRef} from 'react';
import {CONTACT_FIELDS, type ContactResult} from '@/lib/contact';
import {submitContact} from '@/server/actions/contact';

/**
 * The contact form's submit logic, shared by every form layout. It submits from onSubmit rather than <form action>, so
 * React doesn't clear what was typed when the server returns field errors; focus then moves to the first invalid field
 * (by `name`). On success, focus moves to the element holding `doneRef`.
 */
export const useContactForm = <Done extends HTMLElement = HTMLHeadingElement>() => {
  const [result, dispatch, pending] = useActionState<ContactResult | null, FormData>(submitContact, null);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<Done>(null);

  useEffect(() => {
    if (!result) return;
    if (result.ok) {
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
    startTransition(() => dispatch(formData));
  };

  return {
    sent: result?.ok === true,
    pending,
    formError: result && !result.ok ? result.error : undefined,
    errors: result && !result.ok ? result.fieldErrors : undefined,
    formRef,
    doneRef,
    onSubmit,
  };
};
