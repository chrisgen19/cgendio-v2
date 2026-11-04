'use client';

import {type RefObject, useEffect, useRef, useState} from 'react';
import type {ContactField} from '@/lib/contact';
import {CONTACT_STEPS, emptyStepError, firstError, stepOf} from '@/lib/contact-steps';

export type Direction = 'fwd' | 'back';

/**
 * Step state for the contact form. Every step stays mounted (only hidden), so the one <form> always holds every field.
 * `next` only stops an empty topic or message step; the server still validates everything. When the server returns
 * field errors, the form goes back to the earliest step with one and focuses that field once it is visible.
 */
export const useFormSteps = (
  formRef: RefObject<HTMLFormElement | null>,
  serverErrors: Partial<Record<ContactField, string>> | undefined,
  filled: [boolean, boolean],
) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<Direction>('fwd');
  const [localError, setLocalError] = useState<string | undefined>();
  const [announce, setAnnounce] = useState('');
  const headings = useRef<(HTMLHeadingElement | null)[]>([]);
  const focusField = useRef<ContactField | null>(null);
  const moved = useRef(false);

  const goTo = (target: number) => {
    setDirection(target < step ? 'back' : 'fwd');
    setLocalError(undefined);
    setStep(target);
    moved.current = true;
  };

  /** `current` overrides `filled` with values just read from the form (see ContactForm's onNext). */
  const next = (current: readonly [boolean, boolean] = filled) => {
    const error = emptyStepError(step, current);
    if (error) setLocalError(error);
    else goTo(step + 1);
  };

  useEffect(() => {
    const first = firstError(serverErrors);
    if (!first) return;
    focusField.current = first.field;
    setDirection('back');
    setStep(first.step);
  }, [serverErrors]);

  useEffect(() => {
    setAnnounce(`Step ${step + 1} of ${CONTACT_STEPS.length}: ${CONTACT_STEPS[step]?.title}`);
    const field = focusField.current;
    focusField.current = null;
    // Only a field on the step now showing can take focus; a field queued for a hidden step falls back to the heading
    if (field && stepOf(field) === step) {
      const control = formRef.current?.elements.namedItem(field);
      if (control instanceof HTMLElement) control.focus();
      // A radio group comes back as a RadioNodeList: focus its first option
      else if (control && 'length' in control && control[0] instanceof HTMLElement) control[0].focus();
      return;
    }
    if (moved.current) headings.current[step]?.focus();
  }, [step, formRef]);

  // A step's error clears as soon as it has a value again
  if (localError && emptyStepError(step, filled) === null) setLocalError(undefined);

  return {step, direction, localError, announce, headings, next, back: () => goTo(step - 1), goTo};
};
