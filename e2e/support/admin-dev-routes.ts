const indexes = [
  '/admin',
  '/admin/inbox',
  '/admin/projects',
  '/admin/posts',
  '/admin/milestones',
  '/admin/timeline',
  '/admin/stack',
  '/admin/copy',
  '/admin/settings',
];
const editors = ['projects', 'posts', 'milestones', 'timeline', 'stack'];

// [seeded] is resolved against actual records from test:e2e:prepare, never a fabricated ID.
export const ADMIN_DEV_ROUTES = [...indexes, ...editors.flatMap((collection) => [`/admin/${collection}/new`, `/admin/${collection}/[seeded]`])];
