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

/**
 * Draft copy for the What we build section (Christian reviews every string before it ships; moving it into the admin's
 * page-copy keys comes later). `[[...]]` marks the words that get the lime highlighter. Who, where and availability
 * live in the About section right above, so this one only says what we build.
 */
export const BUILD_COPY = {
  eyebrow: 'What we build',
  heading: 'Two kinds of site, [[both done properly]].',
};

/** WordPress on the left (top on phones), Next.js on the right (bottom). */
export const BUILD_SIDES: BuildSideCopy[] = [
  {
    id: 'wp',
    label: 'WordPress',
    labelSub: '& WooCommerce',
    line: 'Custom themes, plugins and WooCommerce stores, quick to load and easy for your team to edit.',
    proof: 'Right now we look after 40+ WordPress and Webflow sites across 40 brands.',
  },
  {
    id: 'next',
    label: 'Next.js',
    labelSub: '& React',
    line: 'Headless sites and React apps in TypeScript, built for speed and Core Web Vitals.',
    proof: "We built a headless CMS on Builder.io and Next.js, and the site you're on.",
  },
];
