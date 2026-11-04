'use client';

import {PROJECT_TYPES} from '@/lib/contact';
import {ErrorIcon} from './form-field';

type TopicStepProps = {
  headingId: string;
  error?: string;
  onPick: (value: string) => void;
};

/** Step 1: four real radios styled as large chips, grouped under the step heading. */
export function TopicStep({headingId, error, onPick}: TopicStepProps) {
  const errorId = 'contact-projectType-error';
  return (
    <fieldset aria-labelledby={headingId} aria-describedby={error ? errorId : undefined} className="m-0 min-w-0 border-0 p-0">
      <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
        {PROJECT_TYPES.map((type) => (
          <label
            key={type.value}
            className="group flex min-h-16 cursor-pointer items-center gap-3.5 rounded-card border border-line bg-ground px-5 py-3 text-[16px] font-semibold text-ink transition-[border-color,background-color] duration-200 hover:border-ink has-checked:border-accent has-checked:bg-tint has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent motion-reduce:transition-none"
          >
            <input
              type="radio"
              name="projectType"
              value={type.value}
              required
              aria-invalid={error ? true : undefined}
              onChange={() => onPick(type.label)}
              className="peer sr-only scroll-mt-28"
            />
            <span
              aria-hidden="true"
              className="grid size-5 shrink-0 place-items-center rounded-pill border-2 border-muted transition-colors duration-200 peer-checked:border-accent motion-reduce:transition-none"
            >
              <span className="size-2.5 scale-0 rounded-pill bg-accent transition-transform duration-200 group-has-checked:scale-100 motion-reduce:transition-none" />
            </span>
            {type.label}
          </label>
        ))}
      </div>
      {error ? (
        <p id={errorId} className="m-0 mt-3 flex items-start gap-2 text-sm font-medium text-danger">
          <ErrorIcon />
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
