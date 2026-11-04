import type {ReactNode} from 'react';
import type {ContactField} from '@/lib/contact';

export const CONTROL =
  'w-full scroll-mt-28 rounded-field border border-line bg-ground px-4 text-base text-ink transition-colors duration-150 hover:border-ink focus:bg-white aria-invalid:border-danger motion-reduce:transition-none';

export type ControlProps = {id: string; name: ContactField; 'aria-invalid'?: true; 'aria-describedby'?: string};

type FieldProps = {
  name: ContactField;
  label: string;
  error?: string;
  /** Id of a hint that stays linked to the control, like the message's character count */
  hintId?: string;
  hint?: ReactNode;
  children: (props: ControlProps) => ReactNode;
};

/** A labelled control. On error the control gets aria-invalid and is described by the error text. */
export function Field({name, label, error, hintId, hint, children}: FieldProps) {
  const id = `contact-${name}`;
  const errorId = `${id}-error`;
  const describedBy = [hintId, error ? errorId : undefined].filter(Boolean).join(' ') || undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      {children({id, name, ...(error ? {'aria-invalid': true} : {}), ...(describedBy ? {'aria-describedby': describedBy} : {})})}
      {hint}
      {error ? (
        <p id={errorId} className="m-0 flex items-start gap-2 text-sm font-medium text-danger">
          <ErrorIcon />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** A small warning glyph so errors never rely on colour alone */
export function ErrorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      className="mt-0.5 shrink-0"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.5v.01" strokeLinecap="round" />
    </svg>
  );
}
