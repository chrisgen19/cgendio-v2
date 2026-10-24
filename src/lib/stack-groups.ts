/** A layer of the stack: `key` is its identifier in the code view, `label` its human name. */
export type StackGroup = {
  key: string;
  label: string;
  tools: string[];
};

/** The approved grouping, in display order. Hardcoded for now; new stack rows that aren't listed land in "Other". */
const STACK_GROUPS: ReadonlyArray<{key: string; label: string; tools: readonly string[]}> = [
  {key: 'frontend', label: 'Frontend', tools: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'shadcn/ui']},
  {key: 'backendAndData', label: 'Backend & data', tools: ['Prisma', 'PostgreSQL', 'PHP']},
  {key: 'cmsAndCommerce', label: 'CMS & commerce', tools: ['WordPress', 'WooCommerce', 'Builder.io']},
  {key: 'design', label: 'Design', tools: ['Figma']},
  {key: 'hostingAndInfra', label: 'Hosting & infra', tools: ['Vercel', 'Cloudflare', 'Coolify']},
];

const OTHER = {key: 'other', label: 'Other'} as const;

/**
 * Sorts stack names into their groups. Names keep the order they arrive in (the admin's order), groups keep the order
 * above, empty groups are dropped, and any name the map doesn't know goes into a trailing "Other" group.
 */
export const groupStack = (names: readonly string[]): StackGroup[] => {
  const groups: StackGroup[] = STACK_GROUPS.map(({key, label}) => ({key, label, tools: []}));
  const other: StackGroup = {...OTHER, tools: []};
  for (const name of names) {
    const index = STACK_GROUPS.findIndex((group) => group.tools.includes(name));
    (groups[index] ?? other).tools.push(name);
  }
  return [...groups, other].filter((group) => group.tools.length > 0);
};

/** The number of tools across all groups. */
export const countTools = (groups: readonly StackGroup[]): number => groups.reduce((sum, group) => sum + group.tools.length, 0);
