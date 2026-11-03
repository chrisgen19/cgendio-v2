import {renderToStaticMarkup} from 'react-dom/server';
import {MarkdownAsync} from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import {describe, expect, it} from 'vitest';
import {rehypeDemoteH1, rehypeWriteUpChapters, SANITIZE_SCHEMA, type WriteUpChapter} from './markdown-plugins';

/** The write-up pipeline up to the chapters (Shiki only colours code, so it is left out), rendered without components. */
const render = async (markdown: string) => {
  const chapters: WriteUpChapter[] = [];
  const element = await MarkdownAsync({
    children: markdown,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [[rehypeSanitize, SANITIZE_SCHEMA], rehypeDemoteH1, rehypeSlug, [rehypeWriteUpChapters, {sink: chapters}]],
  });
  const html = renderToStaticMarkup(element);
  return {html, chapters, count: html.split('data-write-up="chapter"').length - 1};
};

describe('rehypeWriteUpChapters', () => {
  it('makes a chapter per h2 with an h3 heading, and collects the labels for the index', async () => {
    const {html, chapters, count} = await render('Lead text.\n\n## Built\n\nA shop.\n\n## Since then\n\nMoved.');
    expect(count).toBe(3);
    expect(chapters).toEqual([
      {id: 'write-up-built', label: 'Built'},
      {id: 'write-up-since-then', label: 'Since then'},
    ]);
    expect(html).toContain('<section id="write-up-built" data-write-up="chapter" aria-labelledby="write-up-built-title">');
    expect(html).toContain('<h3 id="write-up-built-title" data-write-up="heading">Built</h3>');
    expect(html).not.toContain('<h2');
  });

  it('counts a demoted # heading and an underlined heading as chapters', async () => {
    const {chapters} = await render('# Title\n\nText.\n\nSubtitle\n--------\n\nMore.');
    expect(chapters.map(({label}) => label)).toEqual(['Title', 'Subtitle']);
  });

  // Codex P2 and CodeRabbit: reference definitions and footnotes in another chapter must still resolve
  it('resolves reference links and footnotes defined in another chapter', async () => {
    const {html} = await render('## Built\n\nSee [the site][client] and a note.[^1]\n\n## Links\n\n[client]: https://example.com\n\n[^1]: The note.');
    expect(html).toContain('<a href="https://example.com">the site</a>');
    expect(html).not.toContain('[client]');
    expect(html).toContain('href="#user-content-fn-1"');
    expect(html).toMatch(/<\/section><div data-write-up="notes"><section data-footnotes="true"/);
  });

  // Codex P2 and CodeRabbit: inline Markdown in a heading renders, and the index label is plain text
  it('renders inline Markdown in headings and keeps the index label plain', async () => {
    const {html, chapters} = await render('## **Built** with *care*\n\nText.\n\n## See [the site](https://example.com)\n\nMore.');
    expect(html).toContain('data-write-up="heading"><strong>Built</strong> with <em>care</em></h3>');
    expect(html).toContain('data-write-up="heading">See <a href="https://example.com">the site</a></h3>');
    expect(chapters.map(({label}) => label)).toEqual(['Built with care', 'See the site']);
  });

  // Codex P2 and CodeRabbit: a fence-like line that cannot close its block keeps the code (and its ## lines) intact
  it.each([
    ['``` inside ````', '````md\n```\n## not a heading\n```\n````'],
    ['~~~ inside ```', '```md\n~~~\n## not a heading\n~~~\n```'],
    ['``` inside ~~~', '~~~md\n```\n## not a heading\n```\n~~~'],
  ])('keeps a ## line inside code when there is %s', async (_label, fence) => {
    const {html, chapters} = await render(`## Code\n\n${fence}\n\nAfter.`);
    expect(chapters.map(({label}) => label)).toEqual(['Code']);
    expect(html).toContain('## not a heading');
    expect(html).toContain('<p>After.</p>');
  });

  it('marks a body that is only a bullet list of inline items as a checklist', async () => {
    const {html} = await render('## What it included\n\n- Home and office boxes\n- Uses `pnpm` and **Prisma**\n');
    expect(html).toContain('<ul data-write-up="checklist">');
    expect(html).toContain('<li data-write-up="item">Uses <code>pnpm</code> and <strong>Prisma</strong></li>');
  });

  // CodeRabbit: strikethrough, entities and escapes in list items render as Markdown, not as their source
  it('renders strikethrough, entities and escapes in checklist items', async () => {
    const {html} = await render('## Scope\n\n- ~~Deprecated~~\n- A &amp; B\n- \\# Note\n');
    expect(html).toContain('<li data-write-up="item"><del>Deprecated</del></li>');
    expect(html).toContain('<li data-write-up="item">A &amp; B</li>');
    expect(html).toContain('<li data-write-up="item"># Note</li>');
  });

  it('keeps a loose list as a checklist without its paragraphs', async () => {
    const {html} = await render('## Scope\n\n- One\n\n- Two\n');
    expect(html).toContain('<li data-write-up="item">One</li>');
  });

  // CodeRabbit: an indented bullet keeps its nesting, so the list stays Markdown
  it.each([
    ['a nested list', '- Parent\n  - Child\n'],
    ['a task list', '- [x] Done\n- [ ] Open\n'],
    ['text beside the list', 'Intro.\n\n- One\n'],
    ['an ordered list', '1. One\n2. Two\n'],
  ])('leaves %s to the statement body', async (_label, body) => {
    const {html} = await render(`## Scope\n\n${body}`);
    expect(html).not.toContain('data-write-up="checklist"');
    expect(html).toContain('data-write-up="statement"');
  });

  it('keeps a nested list nested', async () => {
    const {html} = await render('## Scope\n\n- Parent\n  - Child\n');
    expect(html).toMatch(/<li>Parent\s*<ul>\s*<li>Child<\/li>/);
  });
});
