/*
 * Small rehype plugins for the post and case study Markdown (src/components/prose/markdown.tsx and
 * src/components/case-study/write-up-markdown.tsx). They only need a few fields of the hast tree, so they use a local
 * node type instead of depending on @types/hast directly.
 */
import {defaultSchema} from 'rehype-sanitize';

/**
 * GitHub's sanitize schema without its own id prefix: remark-rehype already prefixes footnote ids and their links with
 * "user-content-", and raw HTML (the only other source of ids) is removed, so a second prefix would only break footnotes.
 */
export const SANITIZE_SCHEMA = {...defaultSchema, clobberPrefix: ''};

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

export type WriteUpChapter = {id: string; label: string};

// Inline content a checklist item may hold. Anything else (a nested list, a task checkbox, a code block) keeps the list as Markdown.
const PHRASING = new Set(['a', 'b', 'br', 'code', 'del', 'em', 'i', 'img', 'kbd', 's', 'span', 'strong', 'sub', 'sup']);

const isBlank = (node: HastNode) => node.type === 'text' && !node.value?.trim();
const filled = (nodes: HastNode[] = []) => nodes.filter((node) => !isBlank(node));
const isPhrasing = (node: HastNode) => node.type === 'text' || (node.type === 'element' && PHRASING.has(node.tagName ?? ''));
const element = (tagName: string, properties: Record<string, unknown>, children: HastNode[]): HastNode => ({
  type: 'element',
  tagName,
  properties,
  children,
});

/** A list item's inline content: its own children, or those of its only paragraph (a loose list). Null when it holds blocks. */
const inlineContent = (item: HastNode): HastNode[] | null => {
  const children = filled(item.children);
  const only = children.length === 1 ? children[0] : undefined;
  const inline = only?.type === 'element' && only.tagName === 'p' ? filled(only.children) : children;
  return inline.every(isPhrasing) ? inline : null;
};

/** Marks a body that is nothing but one bullet list of inline items as a checklist. Returns false and changes nothing otherwise. */
const markChecklist = (body: HastNode[]) => {
  const [list, ...rest] = filled(body);
  if (!list || rest.length > 0 || list.type !== 'element' || list.tagName !== 'ul' || hasClass(list, 'contains-task-list')) return false;
  const items = filled(list.children);
  const contents = items.map((item) => (item.tagName === 'li' ? inlineContent(item) : null));
  if (items.length === 0 || contents.some((content) => content === null)) return false;
  list.properties = {...list.properties, dataWriteUp: 'checklist'};
  list.children = items.map((item, index) => ({...item, properties: {...item.properties, dataWriteUp: 'item'}, children: contents[index] ?? []}));
  return true;
};

type Group = {heading: HastNode | null; body: HastNode[]};

const toChapter = ({heading, body}: Group, sink: WriteUpChapter[]): HastNode => {
  const slug = heading?.properties?.id;
  const id = typeof slug === 'string' && slug ? `write-up-${slug}` : undefined;
  const children: HastNode[] = [];
  if (heading) {
    const label = textOf(heading).trim();
    if (id && label) sink.push({id, label});
    children.push(element('h3', {id: id ? `${id}-title` : undefined, dataWriteUp: 'heading'}, heading.children ?? []));
  }
  if (filled(body).length > 0) children.push(markChecklist(body) ? (filled(body)[0] as HastNode) : element('div', {dataWriteUp: 'statement'}, body));
  return element('section', {id, dataWriteUp: 'chapter', ariaLabelledBy: id && heading ? `${id}-title` : undefined}, children);
};

/**
 * Groups a parsed write-up into chapters, one per top-level h2 (after rehype-slug, so `# Title` and underlined headings
 * count too), plus any text before the first. Each becomes `section[data-write-up=chapter]` with its heading demoted
 * to an h3 and its body marked as a statement or, when it is only a list of inline items, a checklist. Chapters with a
 * heading go into `sink` for the jump index. The GFM footnotes stay one block after the chapters.
 *
 * Working on the parsed tree means the Markdown is read once, as the editor's preview reads it: reference links,
 * footnotes, code fences and inline Markdown in headings and list items all resolve across chapters.
 */
export const rehypeWriteUpChapters =
  ({sink}: {sink: WriteUpChapter[]}) =>
  (tree: HastNode) => {
    const groups: Group[] = [];
    const notes: HastNode[] = [];
    for (const node of tree.children ?? []) {
      if (node.type === 'element' && node.tagName === 'section' && node.properties?.dataFootnotes) notes.push(node);
      else if (node.type === 'element' && node.tagName === 'h2') groups.push({heading: node, body: []});
      else if (groups.length > 0) groups.at(-1)?.body.push(node);
      else if (!isBlank(node)) groups.push({heading: null, body: [node]});
    }
    const chapters = groups.map((group) => toChapter(group, sink));
    tree.children = notes.length > 0 ? [...chapters, element('div', {dataWriteUp: 'notes'}, notes)] : chapters;
  };
