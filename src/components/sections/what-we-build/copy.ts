import type {PageCopy} from '@/server/content';

/** The two kinds of site the What we build stage splits the portrait between. */
export type BuildSideId = 'wp' | 'next';

export type BuildSideCopy = {
  id: BuildSideId;
  /** The giant label, then its smaller second line. */
  label: string;
  labelSub: string;
  line: string;
  proof: string;
};

const side = (copy: PageCopy, id: BuildSideId): BuildSideCopy => ({
  id,
  label: copy[`build.${id}.label`],
  labelSub: copy[`build.${id}.labelSub`],
  line: copy[`build.${id}.line`],
  proof: copy[`build.${id}.proof`],
});

/**
 * The What we build copy, from the admin's page copy. `[[...]]` in the heading marks the highlighted words. Who, where
 * and availability live in the About section right above, so this one only says what we build. The sides are
 * WordPress on the left (top on phones), then Next.js on the right (bottom).
 */
export const buildCopy = (copy: PageCopy) => ({
  eyebrow: copy['build.eyebrow'],
  heading: copy['build.heading'],
  sides: [side(copy, 'wp'), side(copy, 'next')],
});
