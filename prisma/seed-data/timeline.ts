import type {TimelineEntry} from '../../src/server/content-schema';

/** From the CV: the five latest roles, then 2007 to 2018 grouped in one row. */
export const timeline: TimelineEntry[] = [
  {
    when: 'Jun 2025 - Now',
    role: 'Senior Full Stack Developer',
    org: 'Access Group Australia',
    description:
      'Look after 40+ WordPress and Webflow sites across 40 brands, built a headless CMS on Builder.io and Next.js, and lead a team of 6 developers.',
    dot: 'accent',
    isCurrent: true,
    order: 1,
  },
  {
    when: 'Feb - Jun 2025',
    role: 'Senior Full Stack / WordPress Developer',
    org: 'Hybrid Anchor',
    description: 'WordPress sites from Figma to launch, including a membership store on WooCommerce, Stripe and MemberPress.',
    dot: 'ink',
    isCurrent: false,
    order: 2,
  },
  {
    when: 'Mar 2022 - Nov 2024',
    role: 'Senior Full Stack Developer',
    org: 'Interactive Education Concept, Inc.',
    description: 'A custom web app and APIs connecting Shopify and WordPress, plus custom plugins, Shopify themes and DevOps on Azure and AWS.',
    dot: 'ink',
    isCurrent: false,
    order: 3,
  },
  {
    when: 'Jul 2019 - Feb 2022',
    role: 'Senior WordPress / Frontend Developer',
    org: 'MyImprov (US client via Emapta)',
    description: 'React and Next.js frontends, APIs for a web and mobile app, WordPress templates and Shopify themes.',
    dot: 'ink',
    isCurrent: false,
    order: 4,
  },
  {
    when: 'Sep 2018 - May 2019',
    role: 'Senior Full Stack Developer',
    org: 'Outdoor Urban Transit / Follow',
    description: 'WordPress plugins, Laravel web apps and Linux servers on AWS and DigitalOcean.',
    dot: 'ink',
    isCurrent: false,
    order: 5,
  },
  {
    when: '2007 - 2018',
    role: 'PHP and WordPress Developer',
    org: 'BoomLabs, Creagaia, E-trader, Symmetri Designs and earlier',
    description: 'WordPress plugins and themes, CodeIgniter and Laravel systems, a Magento jewelry customizer and Zen Cart stores.',
    dot: 'ink',
    isCurrent: false,
    order: 6,
  },
];
