'use client';

import type {Ref} from 'react';

type FormSentProps = {
  ref: Ref<HTMLHeadingElement>;
  email: string;
  headingLevel: 2 | 3;
};

/** Replaces the form once the message is in. The heading takes focus so screen readers hear it. */
export function FormSent({ref, email, headingLevel}: FormSentProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <output data-dir="fwd" className="contact-step flex flex-col gap-4">
      <span aria-hidden="true" className="grid size-12 place-items-center rounded-pill bg-accent text-on-accent">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      </span>
      <Heading
        ref={ref}
        tabIndex={-1}
        className="m-0 font-display text-[clamp(28px,3vw,40px)] leading-[1.05] font-bold tracking-[-0.03em] focus:outline-none"
      >
        Thanks, I&apos;ve got your message.
      </Heading>
      <p className="m-0 max-w-[46ch] text-lg leading-[1.55] text-muted">
        I&apos;ll read it myself and get back to you{email.trim() ? ` at ${email.trim()}` : ''}.
      </p>
    </output>
  );
}
