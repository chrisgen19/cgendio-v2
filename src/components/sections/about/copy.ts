import type {PageCopy} from '@/server/content';

/** A fact that has a comment pin on the canvas; the pin and its panel row share the key and light up together. */
export type AboutPinKey = 'role' | 'timezone' | 'experience' | 'sites';

export type AboutRow = {
  label: string;
  value: string;
  note: string;
  /** Set when the canvas carries a pin for this row; `pin` is the pin's short visible label. */
  pinKey?: AboutPinKey;
  pin?: string;
};

export type AboutCopy = ReturnType<typeof aboutCopy>;

/** Not copy: only shows until a photo is uploaded in admin Settings. */
export const PHOTO_PLACEHOLDER = '[YOUR PHOTO]';

/** A panel row from its `about.<row>.*` page-copy keys. */
const row = (copy: PageCopy, key: 'based' | AboutPinKey): AboutRow => {
  const base = {label: copy[`about.${key}.label`], value: copy[`about.${key}.value`], note: copy[`about.${key}.note`]};
  return key === 'based' ? base : {...base, pinKey: key, pin: copy[`about.${key}.pin`]};
};

/**
 * The Inspect canvas About's copy, from the admin's page copy. `[[...]]` in the heading marks the highlighted words.
 * The rows are in panel order; the canvas pins the ones with a `pinKey`.
 */
export const aboutCopy = (copy: PageCopy) => ({
  heading: copy['about.heading'],
  intro: copy['about.intro'],
  /** The selected frame's name on the canvas */
  frameLabel: copy['about.frameLabel'],
  contactLabel: copy['about.contactLabel'],
  cvLabel: copy['about.cvLabel'],
  statusLabel: copy['about.status.label'],
  statusOpen: copy['about.status.open'],
  statusClosed: copy['about.status.closed'],
  rows: (['role', 'based', 'timezone', 'experience', 'sites'] as const).map((key) => row(copy, key)),
});
