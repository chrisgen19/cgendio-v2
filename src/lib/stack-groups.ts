export type StackGroupId = 'hosting' | 'backend' | 'cms' | 'frontend' | 'design' | 'other';

export type StackGroup = {
  id: StackGroupId;
  name: string;
  /** What the layer does for a site, in a few words. Null for the catch-all group. */
  role: string | null;
  tools: string[];
};

type GroupDefinition = Omit<StackGroup, 'tools'> & {members: readonly string[]};

/** The layers of a site, bottom to top: the order a site is built and served. Hardcoded until the admin can group tools. */
const GROUPS: readonly GroupDefinition[] = [
  {id: 'hosting', name: 'Hosting & infra', role: 'Where it runs', members: ['Vercel', 'Cloudflare', 'Coolify']},
  {id: 'backend', name: 'Backend & data', role: 'Data and logic', members: ['Prisma', 'PostgreSQL', 'PHP']},
  {id: 'cms', name: 'CMS & commerce', role: 'Content and checkout', members: ['WordPress', 'WooCommerce', 'Builder.io']},
  {id: 'frontend', name: 'Frontend', role: 'What visitors use', members: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'shadcn/ui']},
  {id: 'design', name: 'Design', role: 'How it looks', members: ['Figma']},
];

const OTHER: GroupDefinition = {id: 'other', name: 'Other', role: null, members: []};

const groupIdOf = (name: string): StackGroupId => GROUPS.find((group) => group.members.includes(name))?.id ?? 'other';

/**
 * Sorts stack names into layers, bottom (hosting) to top (design). Tools keep the order they arrive in; names the map
 * doesn't know land in an "Other" layer on top, and empty layers are dropped.
 */
export const groupStack = (names: readonly string[]): StackGroup[] =>
  [...GROUPS, OTHER]
    .map(({members: _members, ...group}) => ({...group, tools: names.filter((name) => groupIdOf(name) === group.id)}))
    .filter((group) => group.tools.length > 0);
