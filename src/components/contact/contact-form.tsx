'use client';

import {useState} from 'react';
import {CONTACT_STEPS, LAST_STEP} from '@/lib/contact-steps';
import {DetailsStep} from './details-step';
import {ErrorSummary} from './error-summary';
import {FormSent} from './form-sent';
import {MessageStep} from './message-step';
import {StepNav} from './step-nav';
import {StepShell} from './step-shell';
import {TopicStep} from './topic-step';
import {useContactForm} from './use-contact-form';
import {useFormSteps} from './use-form-steps';

/**
 * The contact form, one question at a time: topic, message, then who to reply to. All three steps sit inside one
 * <form> and send through the shared contact action (useContactForm). Each answered step collapses to one line with a Change button.
 */
export function ContactForm({headingLevel = 3}: {headingLevel?: 2 | 3}) {
  const {sent, pending, formError, errors, formRef, doneRef, onSubmit} = useContactForm();
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const flow = useFormSteps(formRef, errors, [topic !== '', message.trim() !== '']);
  const {step, direction, headings, localError} = flow;

  if (sent) return <FormSent ref={doneRef} email={email} headingLevel={headingLevel} />;

  const shell = (index: number) => ({
    index,
    current: step,
    title: CONTACT_STEPS[index]?.title ?? '',
    headingRef: (el: HTMLHeadingElement | null) => {
      headings.current[index] = el;
    },
    direction,
    onChange: () => flow.goTo(index),
    headingLevel,
  });
  const trimmed = message.trim();
  const snippet = trimmed.length > 60 ? `${trimmed.slice(0, 60)}...` : trimmed;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-label="Message me" className="relative">
      <div className="mb-8 flex items-center gap-4">
        <p className="m-0 shrink-0 font-mono text-[13px] font-medium text-muted">{`Step ${step + 1} of ${CONTACT_STEPS.length}`}</p>
        <span aria-hidden="true" className="h-1 flex-1 overflow-hidden rounded-pill bg-line">
          <span
            className="block h-full origin-left rounded-pill bg-accent motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-mark"
            style={{transform: `scaleX(${(step + 1) / CONTACT_STEPS.length})`}}
          />
        </span>
      </div>
      <p aria-live="polite" className="sr-only">
        {flow.announce}
      </p>
      {formError ? (
        <p role="alert" className="m-0 mb-6 rounded-field border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {formError}
        </p>
      ) : null}
      <ErrorSummary errors={errors} />
      <ol className="m-0 list-none p-0">
        <StepShell {...shell(0)} summary={topic}>
          <TopicStep headingId="contact-step-0" error={errors?.projectType ?? (step === 0 ? localError : undefined)} onPick={setTopic} />
          <StepNav onNext={flow.next} />
        </StepShell>
        <StepShell {...shell(1)} summary={snippet}>
          <MessageStep error={errors?.message ?? (step === 1 ? localError : undefined)} length={trimmed.length} onType={setMessage} />
          <StepNav onBack={flow.back} onNext={flow.next} />
        </StepShell>
        <StepShell {...shell(LAST_STEP)} summary="" last>
          <DetailsStep errors={errors} onEmail={setEmail} />
          <StepNav onBack={flow.back} pending={pending} />
        </StepShell>
      </ol>
      {/* Honeypot: hidden from people and assistive tech; bots that fill every field get a fake success */}
      <div aria-hidden="true" className="absolute -left-[10000px] size-px overflow-hidden">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input id="contact-website" type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
    </form>
  );
}
