/** Home page sections as /#anchors so they also work from the inner pages; the blog links to its index. */
export const NAV_LINKS = [
  {href: '/#work', label: 'Work'},
  {href: '/#milestones', label: 'Milestones'},
  {href: '/#timeline', label: 'Timeline'},
  {href: '/blog', label: 'Blog'},
] as const;

export const MOBILE_NAV_LINKS = [...NAV_LINKS, {href: '/contact', label: 'Contact'}] as const;
