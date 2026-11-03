import type {TourStop} from '../../src/server/content-schema';

/**
 * The Premium Mobile Car Valeting Glasgow case study tour. Captures of the live site from 2026-11-03, in the cgendio-media
 * bucket: home cropped above the customer testimonials, the other pages above the footer, the owner's name and the phone
 * numbers painted out, and his face and the number plates blurred. The booking form shows a postcode check with a date and
 * time picked; nothing was booked. Positions are in each capture's pixels. Note text is the write-up, word for word. The
 * 20261103120000_project_premium_mobile_car_valeting_tour migration backfills the same value, so change both.
 */
const FOLDER = 'https://pub-2804367faf354b5c8072c41278bae114.r2.dev/images/2026/premium-mobile-car-valeting-tour';

const SIZES = {
  home: {desktop: [1440, 5567], mobile: [390, 10517]},
  services: {desktop: [1440, 4140], mobile: [390, 8406]},
  service: {desktop: [1440, 3837], mobile: [390, 5638]},
} as const;

const capture = (page: keyof typeof SIZES, device: 'desktop' | 'mobile') => {
  const [width, height] = SIZES[page][device];
  return {url: `${FOLDER}/${page}-${device}.webp`, width, height};
};
const captures = (page: keyof typeof SIZES) => ({desktop: capture(page, 'desktop'), mobile: capture(page, 'mobile')});

const ALTS = {
  home: 'The Premium Mobile Car Valeting home page: a valeter at work, then three steps to book, and a grid of valets with prices',
  services: 'The services page: every valet in a grid, each with its price and a button to book it',
  service: 'The Full Works Car Valet page: photos of a valeted car beside its price and a booking form with a postcode, date and time',
} as const;

export const premiumMobileCarValetingTour: TourStop[] = [
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
      desktop: {y: 0, box: {x: 145, y: 270, w: 590, h: 515}},
      mobile: {y: 230, box: {x: 45, y: 280, w: 300, h: 300}},
    },
  },
  {
    key: 'booking-flow',
    heading: 'Home page',
    note: 'Online booking and scheduling on WooCommerce, with PayPal payments, and services and prices the owner edits in WordPress.',
    emphasis: null,
    selected: 'How it works',
    onScreen: 'Three steps: pick a valet and slot, a valeter arrives, you drive a clean car',
    path: '/',
    alt: ALTS.home,
    captures: captures('home'),
    positions: {
      desktop: {y: 915, box: {x: 150, y: 1115, w: 1140, h: 674}},
      mobile: {y: 1049, box: {x: 46, y: 1094, w: 298, h: 212}},
    },
  },
  {
    key: 'prices',
    heading: 'Services and prices',
    note: 'Services and prices edited in WordPress',
    emphasis: null,
    selected: 'Price list',
    onScreen: 'Nine services with their prices, each with a button to book it',
    path: '/services/',
    alt: ALTS.services,
    captures: captures('services'),
    positions: {
      desktop: {y: 1035, box: {x: 150, y: 1235, w: 1140, h: 380}},
      mobile: {y: 1495, box: {x: 60, y: 1540, w: 290, h: 235}},
    },
  },
  {
    key: 'booking',
    heading: 'Booking',
    note: 'Booking and scheduling through WooCommerce',
    emphasis: null,
    selected: 'Booking form',
    onScreen: 'A postcode check, then a date and a time slot, above Buy Now',
    path: '/valet-service/the-full-works-car-valet/',
    alt: ALTS.service,
    captures: captures('service'),
    positions: {
      desktop: {y: 723, box: {x: 734, y: 923, w: 632, h: 464}},
      mobile: {y: 1387, box: {x: 34, y: 1432, w: 322, h: 225}},
    },
  },
];
