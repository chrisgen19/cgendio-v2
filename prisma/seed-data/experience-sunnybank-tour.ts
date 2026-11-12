import type {TourStop} from '../../src/server/content-schema';

/**
 * The Experience Sunnybank case study tour. Captures of the live site from 2026-11-02, in the cgendio-media bucket. They were
 * cleaned first: cropped above the Instagram feeds, the centre management contacts and the home page's What's On photo, with a
 * restaurant's mobile number and the Visit & Shop page's placeholder text painted out. Positions are in each capture's pixels.
 * Note text is the write-up, word for word. The 20261102150000_project_experience_sunnybank_tour migration backfills the same
 * value, so change both.
 */
const FOLDER = 'https://media.cgdiomampo.dev/images/2026/experience-sunnybank-tour';

const SIZES = {
  home: {desktop: [1440, 2770], mobile: [390, 2720]},
  restaurants: {desktop: [1440, 3930], mobile: [390, 6235]},
  shop: {desktop: [1440, 1740], mobile: [390, 2340]},
  restaurant: {desktop: [1440, 1495], mobile: [390, 2160]},
  news: {desktop: [1440, 1800], mobile: [390, 1890]},
} as const;

const capture = (page: keyof typeof SIZES, device: 'desktop' | 'mobile') => {
  const [width, height] = SIZES[page][device];
  return {url: `${FOLDER}/${page}-${device}.webp`, width, height};
};
const captures = (page: keyof typeof SIZES) => ({desktop: capture(page, 'desktop'), mobile: capture(page, 'mobile')});

const ALTS = {
  home: 'The Experience Sunnybank home page: a search over a food photo, then featured restaurants and dishes',
  restaurants: 'The restaurants page: filters for region, food, type and location above a grid of 60 restaurants',
  shop: 'The Visit & Shop page: an intro, drinks and dining features, then a row of specialty stores',
  restaurant: 'The Sayram restaurant page: food photos, opening hours, a centre map and a description',
  news: 'The What’s On page: a food tours feature, then filters above cards for news, events and offers',
} as const;

const DIRECTORIES = 'Directories for dining, shopping and services';

export const experienceSunnybankTour: TourStop[] = [
  {
    key: 'opening',
    heading: 'Home page',
    note: '',
    emphasis: null,
    selected: 'Search',
    onScreen: '',
    path: '/',
    alt: ALTS.home,
    captures: captures('home'),
    positions: {
      desktop: {y: 0, box: {x: 390, y: 285, w: 660, h: 250}},
      mobile: {y: 215, box: {x: 16, y: 265, w: 358, h: 230}},
    },
  },
  {
    key: 'home',
    heading: 'Home page',
    note: 'Directories for dining, shopping and services, plus a blog and news section the team updates in WordPress.',
    emphasis: null,
    selected: 'Featured restaurants',
    onScreen: 'Featured restaurants with their centre and a link to each one, above featured dishes',
    path: '/',
    alt: ALTS.home,
    captures: captures('home'),
    positions: {
      desktop: {y: 1000, box: {x: 64, y: 1195, w: 1312, h: 385}},
      mobile: {y: 1180, box: {x: 16, y: 1225, w: 358, h: 250}},
    },
  },
  {
    key: 'restaurants',
    heading: 'Restaurants',
    note: DIRECTORIES,
    emphasis: 'dining',
    selected: 'Restaurant grid',
    onScreen: '60 restaurants, with filters for region, food, establishment type and location',
    path: '/restaurants/',
    alt: ALTS.restaurants,
    captures: captures('restaurants'),
    positions: {
      desktop: {y: 400, box: {x: 64, y: 610, w: 1312, h: 780}},
      mobile: {y: 540, box: {x: 16, y: 585, w: 358, h: 295}},
    },
  },
  {
    key: 'shop',
    heading: 'Specialty stores',
    note: DIRECTORIES,
    emphasis: 'shopping',
    selected: 'Store row',
    onScreen: 'Specialty stores at each centre, with a link across to the full list',
    path: '/visit-shop/',
    alt: ALTS.shop,
    captures: captures('shop'),
    positions: {
      desktop: {y: 1150, box: {x: 64, y: 1490, w: 1316, h: 125}},
      mobile: {y: 1840, box: {x: 16, y: 1885, w: 305, h: 260}},
    },
  },
  {
    key: 'restaurant',
    heading: 'Restaurant page',
    note: 'Search-led content with Yoast SEO',
    emphasis: null,
    selected: 'Description',
    onScreen: 'A written description for search. The Yoast SEO tags are in the page source, not on screen',
    path: '/restaurants/sayram/',
    alt: ALTS.restaurant,
    captures: captures('restaurant'),
    positions: {
      desktop: {y: 420, box: {x: 170, y: 1225, w: 1100, h: 200}},
      mobile: {y: 1670, box: {x: 16, y: 1714, w: 358, h: 170}},
    },
  },
  {
    key: 'news',
    heading: "What's On",
    note: 'Blog and news section',
    emphasis: null,
    selected: 'News cards',
    onScreen: 'Latest news, events and offers, with a filter and pages to browse older posts',
    path: '/whats-on/',
    alt: ALTS.news,
    captures: captures('news'),
    positions: {
      desktop: {y: 450, box: {x: 175, y: 628, w: 1090, h: 720}},
      mobile: {y: 860, box: {x: 16, y: 906, w: 358, h: 264}},
    },
  },
];
