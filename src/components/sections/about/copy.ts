/** A fact that has a comment pin on the canvas; the pin and its panel row share the key and light up together. */
export type AboutPinKey = 'role' | 'timezone' | 'experience' | 'sites';

export type AboutRow = {
  label: string;
  value: string;
  note?: string;
  /** Set when the canvas carries a pin for this row; `pin` is the pin's short visible label. */
  pinKey?: AboutPinKey;
  pin?: string;
};

const ROWS: AboutRow[] = [
  {
    label: 'Role',
    value: 'Senior full-stack developer',
    note: 'Leads a team of 6 at Access Group Australia',
    pinKey: 'role',
    pin: 'Team of 6',
  },
  {label: 'Based in', value: 'Pasig City, Philippines', note: 'Metro Manila'},
  {label: 'Timezone', value: 'UTC+8 (Asia/Manila)', note: 'Working hours overlap Australia and APAC', pinKey: 'timezone', pin: 'UTC+8'},
  {label: 'On the web', value: '15+ years', note: 'Building sites since 2007', pinKey: 'experience', pin: '15+ years'},
  {label: 'Looks after', value: '40+ sites', note: 'WordPress and Webflow, across 40 brands', pinKey: 'sites', pin: '40+ sites'},
  {label: 'Builds', value: 'WordPress, WooCommerce, Shopify, Webflow and Next.js'},
];

/**
 * Draft copy for the "Inspect canvas" About. Christian reviews every string before it ships; the winning variant's copy
 * moves into the admin's page-copy keys later. `[[...]]` marks the highlighted words, as in the admin copy.
 */
export const ABOUT_COPY = {
  heading: "Hi, I'm [[Christian.]]",
  intro:
    "I'm a senior full-stack developer in Pasig City, Philippines. Through Cgdiomampo.dev, we take brands from research and Figma to fast WordPress and Next.js sites, then keep them running.",
  /** The selected frame's name on the canvas */
  frameLabel: 'Christian / Pasig City',
  photoPlaceholder: '[YOUR PHOTO]',
  contactLabel: 'Get in touch',
  statusLabel: 'Status',
  statusOpen: 'Open to projects and roles',
  statusClosed: 'Not taking new work right now',
  rows: ROWS,
};
