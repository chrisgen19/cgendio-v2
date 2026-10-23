'use client';

import {type SubmitEvent, startTransition, useActionState} from 'react';
import type {ActionResult} from '@/server/admin/action-helpers';

type SaveAction = (previous: ActionResult | null, formData: FormData) => Promise<ActionResult>;

/**
 * useActionState for the admin forms, submitted from onSubmit instead of <form action>. React resets uncontrolled
 * fields after every <form action> run, including one that returns a validation error, which threw away the edits the
 * admin still had to fix. Submitting from onSubmit keeps them. Pass `pending` to SubmitButton: useFormStatus only
 * tracks <form action> submissions.
 */
export const useAdminForm = (save: SaveAction) => {
  const [result, dispatch, pending] = useActionState<ActionResult | null, FormData>(save, null);
  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };
  return {result, pending, onSubmit};
};
