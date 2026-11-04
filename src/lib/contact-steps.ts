import type {ContactField} from './contact';

/** The contact form's three steps, in order. Each step's fields stay in the one <form>, so every send carries them all. */
export const CONTACT_STEPS = [
  {title: "What's it about?", fields: ['projectType'], noun: 'what it is about'},
  {title: 'Tell me about it', fields: ['message'], noun: 'your message'},
  {title: 'Who should I reply to?', fields: ['name', 'email', 'company'], noun: 'your details'},
] as const satisfies readonly {title: string; fields: readonly ContactField[]; noun: string}[];

export const LAST_STEP = CONTACT_STEPS.length - 1;

/** Shown when Next is pressed on an empty step. Only steps 1 and 2 are checked before the server sees them. */
const EMPTY_STEP_ERRORS = ["Choose what it's about to carry on.", 'Write your message first.'] as const;

type FieldErrors = Partial<Record<ContactField, string>>;

/** The step that holds a field. */
export const stepOf = (field: ContactField) => CONTACT_STEPS.findIndex((step) => (step.fields as readonly ContactField[]).includes(field));

/**
 * Whether Next may leave `step`, given which of the first two steps have a value. Returns the error to show instead,
 * or null to move on. The server still validates every field; this only stops an empty step.
 */
export const emptyStepError = (step: number, filled: readonly [boolean, boolean]): string | null => {
  if (step !== 0 && step !== 1) return null;
  return filled[step] ? null : EMPTY_STEP_ERRORS[step];
};

/** The first field (in step order) the server rejected, and its step, so the form can go back to it. */
export const firstError = (errors: FieldErrors | undefined): {field: ContactField; step: number} | null => {
  if (!errors) return null;
  for (const [step, {fields}] of CONTACT_STEPS.entries()) {
    const field = (fields as readonly ContactField[]).find((name) => errors[name]);
    if (field) return {field, step};
  }
  return null;
};

/** One sentence naming every step that still needs a fix after a failed send, or null when none do. */
export const errorSummary = (errors: FieldErrors | undefined): string | null => {
  if (!errors) return null;
  const nouns = CONTACT_STEPS.filter(({fields}) => (fields as readonly ContactField[]).some((name) => errors[name])).map(({noun}) => noun);
  return nouns.length ? `Before this can send, check ${nouns.join(', then ')}.` : null;
};
