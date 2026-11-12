import type {TourStop} from '../../src/server/content-schema';

/**
 * The Fresh Fruit and Veg Shop case study tour. Captures of the live site from 2026-11-02, in the cgendio-media bucket, cropped
 * first to remove named customer testimonials. The site now leads with office deliveries and has no public shop pages, so the
 * tour shows what is live. Positions are in each capture's pixels. Note text is the write-up, word for word, except the home
 * and boxes stops, which are reworded to match the live site. The
 * 20261102160000_project_fresh_fruit_tour migration backfills the same value, so change both.
 */
const FOLDER = 'https://media.cgdiomampo.dev/images/2026/fresh-fruit-tour';

const SIZES = {
  home: {desktop: [1440, 3350], mobile: [390, 4150]},
  office: {desktop: [1440, 5040], mobile: [390, 8690]},
} as const;

const capture = (page: keyof typeof SIZES, device: 'desktop' | 'mobile') => {
  const [width, height] = SIZES[page][device];
  return {url: `${FOLDER}/${page}-${device}.webp`, width, height};
};
const captures = (page: keyof typeof SIZES) => ({desktop: capture(page, 'desktop'), mobile: capture(page, 'mobile')});

const ALTS = {
  home: 'The Fresh Fruit and Veg Shop home page: a person carrying a crate of produce, then why to have fruit delivered to a workplace',
  office: 'The office deliveries page: three steps, then a list of fruit boxes and milk with prices, and a form to get a quote',
} as const;

const OFFICE_PATH = '/office-deliveries/';

export const freshFruitTour: TourStop[] = [
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
      desktop: {y: 0, box: {x: 120, y: 255, w: 620, h: 345}},
      mobile: {y: 130, box: {x: 15, y: 175, w: 360, h: 240}},
    },
  },
  {
    key: 'home',
    heading: 'Home page',
    note: 'A WooCommerce site for office fruit deliveries, with boxes and prices on one page and a form to get a quote.',
    emphasis: null,
    selected: 'Workplace benefits',
    onScreen: 'Why to have fruit delivered to a workplace: no delivery charge and no contract',
    path: '/',
    alt: ALTS.home,
    captures: captures('home'),
    positions: {
      desktop: {y: 1750, box: {x: 120, y: 1948, w: 1200, h: 614}},
      mobile: {y: 3015, box: {x: 16, y: 3060, w: 358, h: 165}},
    },
  },
  {
    key: 'boxes',
    heading: 'Office boxes',
    note: 'Office delivery boxes',
    emphasis: null,
    selected: 'Box list',
    onScreen: 'Essentials and seasonal boxes with their prices, above a form to get a quote',
    path: OFFICE_PATH,
    alt: ALTS.office,
    captures: captures('office'),
    positions: {
      desktop: {y: 3200, box: {x: 130, y: 3420, w: 1180, h: 210}},
      mobile: {y: 4530, box: {x: 40, y: 4570, w: 310, h: 245}},
    },
  },
  {
    key: 'widgets',
    heading: 'Page sections',
    note: 'Custom Elementor widgets on an Astra child theme',
    emphasis: null,
    selected: 'Three steps',
    onScreen: 'A three-step section. Elementor and the Astra child theme are in the page source, not on screen',
    path: OFFICE_PATH,
    alt: ALTS.office,
    captures: captures('office'),
    positions: {
      desktop: {y: 1500, box: {x: 130, y: 1813, w: 1180, h: 267}},
      mobile: {y: 2010, box: {x: 30, y: 2055, w: 330, h: 225}},
    },
  },
];
