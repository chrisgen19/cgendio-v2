import type {ContactField} from '@/lib/contact';
import {errorSummary} from '@/lib/contact-steps';
import {ErrorIcon} from './form-field';

type ErrorSummaryProps = {errors?: Partial<Record<ContactField, string>>};

/** After a failed send, names the steps that still need a fix, so errors on hidden steps are not a surprise. */
export function ErrorSummary({errors}: ErrorSummaryProps) {
  const summary = errorSummary(errors);
  if (!summary) return null;
  return (
    <p className="m-0 mb-7 flex items-start gap-2.5 rounded-field border border-danger/30 bg-danger/5 px-4 py-3 text-sm leading-normal text-danger">
      <ErrorIcon />
      <span>{summary}</span>
    </p>
  );
}
