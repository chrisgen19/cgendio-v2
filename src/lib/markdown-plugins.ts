/*
 * Small rehype plugins for the post and case study Markdown (src/components/prose/markdown.tsx). They only need a few
 * fields of the hast tree, so they use a local node type instead of depending on @types/hast directly.
 */

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

export type TocItem = {id: string; text: string};

const walk = (node: HastNode, visit: (node: HastNode) => void) => {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
};

const textOf = (node: HastNode): string => (node.type === 'text' ? (node.value ?? '') : (node.children ?? []).map(textOf).join(''));

const hasClass = (node: HastNode, name: string) => {
  const className = node.properties?.className;
  return Array.isArray(className) && className.includes(name);
};

/** The page title is the only h1, so any `# Heading` in the Markdown body becomes an h2. */
export const rehypeDemoteH1 = () => (tree: HastNode) => {
  walk(tree, (node) => {
    if (node.type === 'element' && node.tagName === 'h1') node.tagName = 'h2';
  });
};

/**
 * Collects the h2s (id from rehype-slug, plain text) into `sink` for the table of contents. Runs after rehype-slug so
 * the ids match the rendered headings; skips visually hidden headings such as the GFM footnotes label.
 */
export const rehypeCollectToc =
  ({sink}: {sink: TocItem[]}) =>
  (tree: HastNode) => {
    walk(tree, (node) => {
      if (node.type !== 'element' || node.tagName !== 'h2' || hasClass(node, 'sr-only')) return;
      const id = node.properties?.id;
      const text = textOf(node).trim();
      if (typeof id === 'string' && text) sink.push({id, text});
    });
  };
