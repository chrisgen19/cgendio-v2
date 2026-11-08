/**
 * The nav's items for the design lab, split by what they actually do.
 *
 * `section` items jump within the home page and can report "you are here"; `route` items leave for another page and
 * never can. The current header treats both the same, which is why it has nothing to say about position. Each
 * direction is free to express the split differently, but it should express it.
 */
export type NavItem = {
  /** The home page section id, for section items. */
  readonly id?: string;
  readonly href: string;
  readonly label: string;
  readonly kind: 'section' | 'route';
};

export const NAV_ITEMS: readonly NavItem[] = [
  {id: 'work', href: '/#work', label: 'Work', kind: 'section'},
  {id: 'milestones', href: '/#milestones', label: 'Milestones', kind: 'section'},
  {id: 'timeline', href: '/#timeline', label: 'Timeline', kind: 'section'},
  {href: '/writing', label: 'Blog', kind: 'route'},
];

/** Every home section the scrollspy watches, in page order. Wider than NAV_ITEMS so a counter can read "3 of 8". */
export const SECTION_IDS = ['top', 'stack', 'about', 'what-we-build', 'work', 'milestones', 'timeline', 'blog', 'contact'] as const;

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
 * the browser treats it as a same-page target (and `scroll-target-group` can track it), the full `/#work` elsewhere.
 */
export const resolveHref = (item: NavItem, sectionsOnThisPage: boolean) => (sectionsOnThisPage && item.id ? `#${item.id}` : item.href);
