export type WriteUpSection = {
  /** The `##` heading text, or null for any text before the first heading. */
  heading: string | null;
  /** The section's Markdown without its heading line, trimmed. */
  markdown: string;
  /** The bullet texts when the section is nothing but a plain list (no inline Markdown), so a design can lay them out itself. */
  items: string[] | null;
};

const BULLET = /^[-*+]\s+(.*)$/;
// Inline Markdown a plain string would show raw: emphasis, code, links, images, HTML
const INLINE_MARKDOWN = /[*_`[\]<>!]/;

const plainItems = (markdown: string): string[] | null => {
  const lines = markdown.split('\n').filter((line) => line.trim() !== '');
  if (lines.length === 0) return null;
  const items: string[] = [];
  for (const line of lines) {
    const match = BULLET.exec(line.trim());
    if (!match?.[1] || INLINE_MARKDOWN.test(match[1])) return null;
    items.push(match[1].trim());
  }
  return items;
};

/**
 * Splits a case study's Markdown at its `##` headings, outside fenced code. Words are never changed: a section's
 * Markdown is returned as written, and `items` is only set for plain bullet lists that read the same as text.
 */
export const splitWriteUp = (markdown: string): WriteUpSection[] => {
  const sections: {heading: string | null; lines: string[]}[] = [{heading: null, lines: []}];
  let fenced = false;
  for (const line of markdown.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    const heading = fenced ? null : /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading?.[1]) sections.push({heading: heading[1], lines: []});
    else sections.at(-1)?.lines.push(line);
  }
  return sections.flatMap(({heading, lines}) => {
    const body = lines.join('\n').trim();
    if (heading === null && body === '') return [];
    return [{heading, markdown: body, items: plainItems(body)}];
  });
};
