import type {TourStop} from '../../src/server/content-schema';

/**
 * The Merthyr Village case study tour. Captures of the live site from 2026-11-02, in the cgendio-media bucket, cropped first
 * to remove listings with mobile numbers, a practitioner's name and the deli owners' names. Positions are in each capture's
 * pixels. Note text is the write-up, word for word. The 20261102140000_project_merthyr_village_tour migration backfills the
 * same value, so change both.
 */
const FOLDER = 'https://media.cgdiomampo.dev/images/2026/merthyr-village-tour';

const SIZES = {
  home: {desktop: [1440, 5203], mobile: [390, 6083]},
  stores: {desktop: [1440, 2400], mobile: [390, 2945]},
  deli: {desktop: [1440, 955], mobile: [390, 1465]},
  news: {desktop: [1440, 1495], mobile: [390, 2414]},
} as const;

const capture = (page: keyof typeof SIZES, device: 'desktop' | 'mobile') => {
  const [width, height] = SIZES[page][device];
  return {url: `${FOLDER}/${page}-${device}.webp`, width, height};
};
const captures = (page: keyof typeof SIZES) => ({desktop: capture(page, 'desktop'), mobile: capture(page, 'mobile')});

const ALTS = {
  home: 'The Merthyr Village home page: a hero photo, What’s On, centre details and a grid of store categories',
  stores: 'The stores page: category tiles, a search and A to Z filter, then a listing for each store',
  deli: 'The New Farm Deli & Cafe page: a photo of the cafe, its contact details and its trading hours',
  news: 'The What’s happening page: filters above cards for the latest competitions, news and events',
} as const;

export const merthyrVillageTour: TourStop[] = [
  {
    key: 'opening',
    heading: 'Home page',
    note: '',
    emphasis: null,
    selected: 'Hero',
    onScreen: '',
    path: '/',
    alt: ALTS.home,
    captures: captures('home'),
    positions: {
      desktop: {y: 0, box: {x: 470, y: 245, w: 500, h: 290}},
      mobile: {y: 110, box: {x: 20, y: 165, w: 350, h: 170}},
    },
  },
  {
    key: 'home',
    heading: 'Home page',
    note: 'A WordPress and WooCommerce site with a page for every tenant, plus news and events the centre updates itself.',
    emphasis: null,
    selected: 'Store categories',
    onScreen: 'Nine store categories, from Supermarket & Liquor to Professional',
    path: '/',
    alt: ALTS.home,
    captures: captures('home'),
    positions: {
      desktop: {y: 1700, box: {x: 150, y: 1882, w: 1140, h: 780}},
      mobile: {y: 1760, box: {x: 15, y: 1810, w: 360, h: 173}},
    },
  },
  {
    key: 'stores',
    heading: 'Store directory',
    note: 'Store directory with a page for every tenant',
    emphasis: null,
    selected: 'Store list',
    onScreen: 'A search, an A to Z and a category filter, then a listing for each store with its hours and phone',
    path: '/stores/',
    alt: ALTS.stores,
    captures: captures('stores'),
    positions: {
      desktop: {y: 1180, box: {x: 150, y: 1414, w: 1140, h: 471}},
      mobile: {y: 1400, box: {x: 15, y: 1450, w: 360, h: 242}},
    },
  },
  {
    key: 'tenant',
    heading: 'Tenant page',
    note: 'On-page and technical SEO with Yoast SEO',
    emphasis: null,
    selected: 'Store details',
    onScreen: "The deli's contact details and trading hours. The Yoast SEO tags are in the page source, not on screen",
    path: '/store/new-farm-deli-cafe/',
    alt: ALTS.deli,
    captures: captures('deli'),
    positions: {
      desktop: {y: 0, box: {x: 540, y: 535, w: 370, h: 240}},
      mobile: {y: 790, box: {x: 15, y: 830, w: 360, h: 230}},
    },
  },
  {
    key: 'news',
    heading: "What's on",
    note: 'News and events the centre edits itself',
    emphasis: null,
    selected: 'News cards',
    onScreen: 'Competition, event, news and offer filters above the latest posts',
    path: '/whats-happening/',
    alt: ALTS.news,
    captures: captures('news'),
    positions: {
      desktop: {y: 100, box: {x: 150, y: 388, w: 1140, h: 460}},
      mobile: {y: 290, box: {x: 15, y: 336, w: 360, h: 260}},
    },
  },
];
