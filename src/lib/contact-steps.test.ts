import {describe, expect, it} from 'vitest';
import {CONTACT_FIELDS} from './contact';
import {CONTACT_STEPS, emptyStepError, errorSummary, firstError, stepOf} from './contact-steps';

describe('contact steps', () => {
  it('put every form field on exactly one step', () => {
    const fields = CONTACT_STEPS.flatMap((step) => step.fields);
    expect([...fields].sort()).toEqual([...CONTACT_FIELDS].sort());
    expect(stepOf('projectType')).toBe(0);
    expect(stepOf('message')).toBe(1);
    expect(stepOf('company')).toBe(2);
  });

  it('stop Next on an empty topic or message step', () => {
    expect(emptyStepError(0, [false, false])).toBe("Choose what it's about to carry on.");
    expect(emptyStepError(1, [true, false])).toBe('Write your message first.');
    expect(emptyStepError(0, [true, false])).toBeNull();
    expect(emptyStepError(1, [true, true])).toBeNull();
    // The last step sends: the server validates it
    expect(emptyStepError(2, [false, false])).toBeNull();
  });

  it('send a failed submit back to the earliest step with an error', () => {
    expect(firstError(undefined)).toBeNull();
    expect(firstError({})).toBeNull();
    expect(firstError({email: 'Enter a valid email address.', message: 'Too short'})).toEqual({field: 'message', step: 1});
    expect(firstError({email: 'x', name: 'y'})).toEqual({field: 'name', step: 2});
    expect(firstError({projectType: 'x', name: 'y'})).toEqual({field: 'projectType', step: 0});
  });

  it('name each step that still needs a fix, in order', () => {
    expect(errorSummary(undefined)).toBeNull();
    expect(errorSummary({})).toBeNull();
    expect(errorSummary({email: 'x'})).toBe('Before this can send, check your details.');
    expect(errorSummary({name: 'x', projectType: 'y', message: 'z'})).toBe(
      'Before this can send, check what it is about, then your message, then your details.',
    );
  });
});
