import type {TourStop} from '../../src/server/content-schema';

/**
 * The Access Hire case study tour. Captures of the live site from 2026-11-02 (the services page from 2026-11-06), in the
 * cgendio-media bucket, cleaned of staff and customer details first. Positions are in each capture's pixels. Note text is
 * the write-up, word for word.
 * The 20261102120000_project_walkthrough migration backfills the same value, so change both.
 */
const FOLDER = 'https://media.cgdiomampo.dev/images/2026/access-hire-tour';

const SIZES = {
  home: {desktop: [1600, 2400], mobile: [390, 2800]},
  category: {desktop: [1600, 2640], mobile: [390, 4208]},
  brand: {desktop: [1600, 2640], mobile: [390, 6480]},
  used: {desktop: [1600, 1047], mobile: [390, 1756]},
  branches: {desktop: [1600, 1942], mobile: [390, 844]},
  credit: {desktop: [1600, 1644], mobile: [390, 2550]},
  services: {desktop: [1600, 1558], mobile: [390, 3924]},
} as const;

const capture = (page: keyof typeof SIZES, device: 'desktop' | 'mobile') => {
  const [width, height] = SIZES[page][device];
  return {url: `${FOLDER}/${page}-${device}.webp`, width, height};
};
const captures = (page: keyof typeof SIZES) => ({desktop: capture(page, 'desktop'), mobile: capture(page, 'mobile')});

const ALTS = {
  home: 'The Access Hire Australia home page: a brand banner, the fleet headline and a grid of equipment categories',
  category: 'The scissor lift category page: filters beside machine cards from several brands',
  brand: 'The Genie brand page: a line-up banner, an intro and Genie machine cards',
  used: 'The used equipment page: a short intro above the site footer',
  branches: 'The branch finder: a map of Australia with a pin for each branch',
  credit: 'The credit application page: what you need to apply, an Apply Now button and the site footer',
  services: 'The services page: cards for equipment servicing, equipment transport, equipment training and site inspections',
} as const;

const USED_BRANCHES_CREDIT = 'Used equipment, a branch finder and a credit application';

export const accessHireTour: TourStop[] = [
  {
    key: 'opening',
    heading: 'Home page',
    note: '',
    emphasis: null,
    selected: 'Brand banner',
    onScreen: '',
    path: '/',
    alt: ALTS.home,
    captures: captures('home'),
    positions: {
      desktop: {y: 0, box: {x: 170, y: 190, w: 1270, h: 390}},
      mobile: {y: 0, labelAt: 'inside', box: {x: 12, y: 124, w: 366, h: 150}},
    },
  },
  {
    key: 'home',
    heading: 'Home page',
    note: 'A Next.js front end with content edited visually in Builder.io, deployed on Vercel, for the equipment categories, brands and services.',
    emphasis: null,
    selected: 'Equipment categories',
    onScreen: '17 equipment categories, with a tab across to brands',
    path: '/',
    alt: ALTS.home,
    captures: captures('home'),
    positions: {
      desktop: {y: 750, box: {x: 118, y: 850, w: 1360, h: 715}},
      mobile: {y: 820, box: {x: 18, y: 868, w: 354, h: 255}},
    },
  },
  {
    key: 'category',
    heading: 'Category page',
    note: 'Equipment categories and brand pages for hire and sale',
    emphasis: null,
    selected: 'Filters',
    onScreen: 'Platform height and machine width filters, then Add to Enquiry and View details on each machine',
    path: '/category/scissor-lift',
    alt: ALTS.category,
    captures: captures('category'),
    positions: {
      desktop: {y: 380, box: {x: 112, y: 490, w: 310, h: 860}},
      mobile: {y: 440, box: {x: 10, y: 480, w: 370, h: 64}},
    },
  },
  {
    key: 'brand',
    heading: 'Brand page',
    note: 'Content edited visually in Builder.io',
    emphasis: null,
    selected: 'Genie machines',
    onScreen:
      "The Genie banner, intro and machines. One of 7 brands on the client's list: Dingli, Genie, JLG, Globe Power, Zoomlion, UN Forklift, JCB",
    path: '/brand/genie',
    alt: ALTS.brand,
    captures: captures('brand'),
    positions: {
      desktop: {y: 320, box: {x: 436, y: 790, w: 1050, h: 560}},
      mobile: {y: 530, box: {x: 12, y: 572, w: 366, h: 200}},
    },
  },
  {
    key: 'used',
    heading: 'Used equipment',
    note: USED_BRANCHES_CREDIT,
    emphasis: 'Used equipment',
    selected: 'Page intro',
    onScreen: 'A short intro to used access equipment for sale',
    path: '/used-equipment',
    alt: ALTS.used,
    captures: captures('used'),
    positions: {
      desktop: {y: 0, box: {x: 112, y: 250, w: 1080, h: 100}},
      mobile: {y: 190, box: {x: 14, y: 222, w: 362, h: 128}},
    },
  },
  {
    key: 'branches',
    heading: 'Branch finder',
    note: USED_BRANCHES_CREDIT,
    emphasis: 'a branch finder',
    selected: 'Branch map',
    onScreen:
      'A map of the 13 branches: Newcastle, Sydney, Darwin, Brisbane, Moranbah, Adelaide, Melbourne, Kalgoorlie, Karratha, Newman, Perth, Port Hedland, Tom Price',
    path: '/contact-us/find-a-branch',
    alt: ALTS.branches,
    captures: captures('branches'),
    positions: {
      desktop: {y: 430, startY: 242, x: 772, zoom: 1.93, box: {x: 890, y: 500, w: 610, h: 440}},
      mobile: {y: 180, box: {x: 14, y: 236, w: 362, h: 214}},
    },
  },
  {
    key: 'credit',
    heading: 'Credit application',
    note: USED_BRANCHES_CREDIT,
    emphasis: 'a credit application',
    selected: "What you'll need",
    onScreen: "What you'll need to apply, and an Apply Now button",
    path: '/credit-application',
    alt: ALTS.credit,
    captures: captures('credit'),
    positions: {
      desktop: {y: 150, labelAt: 'right', box: {x: 112, y: 486, w: 600, h: 192}},
      mobile: {y: 470, labelAt: 'bottom', box: {x: 14, y: 490, w: 362, h: 212}},
    },
  },
  {
    key: 'services',
    heading: 'Services',
    note: 'Servicing, transport, training and site inspection pages',
    emphasis: null,
    selected: 'Service cards',
    onScreen: 'Four services: Equipment Servicing, Equipment Transport, Equipment Training and Site Inspections',
    path: '/what-we-do/services',
    alt: ALTS.services,
    captures: captures('services'),
    positions: {
      desktop: {y: 92, box: {x: 144, y: 432, w: 1312, h: 496}},
      mobile: {y: 800, box: {x: 24, y: 836, w: 342, h: 210}},
    },
  },
];
