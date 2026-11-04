'use client';

import {cn} from '@/lib/cn';
import {CONTROL, Field} from './form-field';

const MIN = 20;

type MessageStepProps = {
  error?: string;
  length: number;
  onType: (value: string) => void;
};

/** Step 2: the message, with a live character count as a hint (never an error before sending). */
export function MessageStep({error, length, onType}: MessageStepProps) {
  const hintId = 'contact-message-hint';
  const left = Math.max(0, MIN - length);
  return (
    <Field
      name="message"
      label="Your message"
      error={error}
      hintId={hintId}
      hint={
        <p id={hintId} className="m-0 font-mono text-[13px] text-muted">
          {length === 0 ? `At least ${MIN} characters` : left > 0 ? `${left} more characters to go` : `${length} characters`}
        </p>
      }
    >
      {(props) => (
        <textarea
          rows={6}
          maxLength={5000}
          required
          onChange={(event) => onType(event.currentTarget.value)}
          className={cn(CONTROL, 'min-h-40 resize-y py-3 leading-[1.55]')}
          {...props}
        />
      )}
    </Field>
  );
}
