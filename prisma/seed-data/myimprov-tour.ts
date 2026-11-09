import type {TourStop} from '../../src/server/content-schema';

/**
 * The MyImprov case study tour. Captures of the live site from 2026-11-02, in the cgendio-media bucket, cropped to remove
 * customer testimonials first. Positions are in each capture's pixels. Note text is the write-up, word for word.
 * The 20261102130000_project_myimprov_tour migration backfills the same value, so change both.
 */
const FOLDER = 'https://media.cgdiomampo.dev/images/2026/myimprov-tour';

const SIZES = {
  home: {desktop: [1440, 2055], mobile: [390, 2815]},
  california: {desktop: [1440, 4390], mobile: [390, 6795]},
  texas: {desktop: [1440, 4375], mobile: [390, 6985]},
  lms: {desktop: [1440, 900], mobile: [390, 844]},
  faqs: {desktop: [1440, 2552], mobile: [390, 3471]},
} as const;

const capture = (page: keyof typeof SIZES, device: 'desktop' | 'mobile') => {
  const [width, height] = SIZES[page][device];
  return {url: `${FOLDER}/${page}-${device}.webp`, width, height};
};
const captures = (page: keyof typeof SIZES) => ({desktop: capture(page, 'desktop'), mobile: capture(page, 'mobile')});

const ALTS = {
  home: 'The MyImprov home page: a course finder by state, above cards for each type of course',
  california: 'The California traffic school page: three steps to enrol, then the course details for California',
  texas: 'The Texas defensive driving page: three steps to enrol, then the course details for Texas and an Enroll Now panel',
  lms: 'The student login for the course platform, with username and password fields',
  faqs: 'The FAQs page: general questions, then links to the FAQs for each state',
} as const;

const TEXAS_PATH = '/defensive-driving/texas/tx-online-course/';

export const myimprovTour: TourStop[] = [
  {
    key: 'opening',
    heading: 'Home page',
    note: '',
    emphasis: null,
    selected: 'Course finder',
    onScreen: '',
    path: '/',
    alt: ALTS.home,
    captures: captures('home'),
    positions: {
      desktop: {y: 0, box: {x: 716, y: 470, w: 520, h: 510}},
      mobile: {y: 480, box: {x: 20, y: 525, w: 350, h: 195}},
    },
  },
  {
    key: 'home',
    heading: 'Home page',
    note: 'WordPress pages for course information and marketing',
    emphasis: null,
    selected: 'Course cards',
    onScreen: "Cards for insurance discount, defensive driving, traffic school and driver's ed courses",
    path: '/',
    alt: ALTS.home,
    captures: captures('home'),
    positions: {
      desktop: {y: 1150, box: {x: 129, y: 1380, w: 1182, h: 401}},
      mobile: {y: 1240, box: {x: 24, y: 1275, w: 342, h: 230}},
    },
  },
  {
    key: 'california',
    heading: 'California',
    note: 'Course rules and content that change by state',
    emphasis: null,
    selected: 'California approval',
    onScreen: 'CA DMV licensed, accepted by California courts, with automatic DMV and court reporting',
    path: '/traffic-school/california/',
    alt: ALTS.california,
    captures: captures('california'),
    positions: {
      desktop: {y: 2690, box: {x: 300, y: 2815, w: 230, h: 290}},
      mobile: {y: 3470, box: {x: 16, y: 3518, w: 358, h: 215}},
    },
  },
  {
    key: 'texas',
    heading: 'Texas',
    note: 'Joining the three into one journey, from sign-up to certificate, with course rules that change by state.',
    emphasis: 'course rules that change by state',
    selected: 'Texas approval',
    onScreen: 'The same page for another state: approved by the Texas TDLR, with completion reported to TDLR',
    path: TEXAS_PATH,
    alt: ALTS.texas,
    captures: captures('texas'),
    positions: {
      desktop: {y: 2650, box: {x: 300, y: 2780, w: 230, h: 330}},
      mobile: {y: 3480, box: {x: 16, y: 3522, w: 358, h: 230}},
    },
  },
  {
    key: 'enrol',
    heading: 'Enrolment',
    note: 'Shopify for enrolment and payment',
    emphasis: null,
    selected: 'Enroll Now',
    onScreen: 'A price and an Enroll Now button that goes on to the checkout',
    path: TEXAS_PATH,
    alt: ALTS.texas,
    captures: captures('texas'),
    positions: {
      desktop: {y: 3200, box: {x: 230, y: 3467, w: 980, h: 223}},
      mobile: {y: 5200, box: {x: 16, y: 5252, w: 358, h: 246}},
    },
  },
  {
    key: 'lms',
    heading: 'Student login',
    note: "Custom Laravel LMS that tracks each student's progress",
    emphasis: null,
    selected: 'Login form',
    onScreen: 'The way into the course platform, on its own subdomain',
    path: 'https://courses.myimprov.com/',
    alt: ALTS.lms,
    captures: captures('lms'),
    positions: {
      desktop: {y: 0, labelAt: 'bottom', box: {x: 965, y: 300, w: 375, h: 290}},
      mobile: {y: 0, labelAt: 'bottom', box: {x: 20, y: 60, w: 350, h: 243}},
    },
  },
  {
    key: 'certificates',
    heading: 'Certificates',
    note: 'Certificates issued when a course is finished',
    emphasis: null,
    selected: 'Certificate question',
    onScreen: 'An FAQ on how fast a certificate arrives, above FAQs for each state',
    path: '/faqs/',
    alt: ALTS.faqs,
    captures: captures('faqs'),
    positions: {
      desktop: {y: 850, box: {x: 237, y: 1111, w: 966, h: 76}},
      mobile: {y: 1180, box: {x: 48, y: 1265, w: 294, h: 93}},
    },
  },
];
