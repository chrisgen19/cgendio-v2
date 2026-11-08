/**
 * The nav's items, split by what they actually do.
 *
 * `section` items jump within the home page and can report "you are here"; `route` items leave for another page and
 * never can. The header draws that difference rather than hiding it: a section gets a graduation on the rail, a route
 * sits past the rail's end with an arrow.
 */
export type NavItem = {
  /** The home page section id, for section items. */
  readonly id?: string;
  readonly href: string;
  readonly label: string;
  readonly kind: 'section' | 'route';
};

/** Home page sections as /#anchors so they also work from the inner pages; the blog links to its index. */
export const NAV_ITEMS: readonly NavItem[] = [
  {id: 'work', href: '/#work', label: 'Work', kind: 'section'},
  {id: 'milestones', href: '/#milestones', label: 'Milestones', kind: 'section'},
  {id: 'timeline', href: '/#timeline', label: 'Timeline', kind: 'section'},
  {href: '/writing', label: 'Blog', kind: 'route'},
];

/**
 * Every home section the scrollspy watches, in page order — wider than NAV_ITEMS, because the rail measures the whole
 * page and not just the parts that are linked. Each id must exist on the home page.
 */
export const SECTION_IDS = ['top', 'stack', 'about', 'what-we-build', 'work', 'milestones', 'timeline', 'blog', 'contact'] as const;

/** What the readout calls each section. Shorter than the headings, which are sentences. */
export const SECTION_LABELS: Record<string, string> = {
  top: 'Intro',
  stack: 'Stack',
  about: 'About',
  'what-we-build': 'What I build',
  work: 'Work',
  milestones: 'Milestones',
  timeline: 'Timeline',
  blog: 'Writing',
  contact: 'Contact',
};

/**
 * A nav href as it should be used on the page currently open: a bare `#work` while the sections are on this page, so
 * the browser treats it as a same-page target, the full `/#work` anywhere else.
 */
export const resolveHref = (item: NavItem, sectionsOnThisPage: boolean) => (sectionsOnThisPage && item.id ? `#${item.id}` : item.href);
