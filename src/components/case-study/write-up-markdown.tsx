import 'server-only';
import rehypeShiki from '@shikijs/rehype';
import {Check} from 'lucide-react';
import {cacheLife} from 'next/cache';
import type {ElementType, ReactNode} from 'react';
import {type Components, MarkdownAsync} from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import {AnchoredHeading, COMPONENTS, SHIKI_OPTIONS} from '@/components/prose/markdown';
import {rehypeDemoteH1, rehypeWriteUpChapters, SANITIZE_SCHEMA, type WriteUpChapter} from '@/lib/markdown-plugins';

/** One field of the sheet: a section with its label (h3), then its statement or checklist. Shared with the decision in write-up.tsx. */
export const FIELD = 'write-up-field flex scroll-mt-24 flex-col gap-4 border-t border-line py-8 first:border-t-0 first:pt-0';
export const FIELD_LABEL = 'write-up-field-label m-0 font-body text-[15px] leading-tight font-semibold text-muted';

// The one-sentence paragraphs read as statements: display type, kept to about 30 characters a line
export const STATEMENT =
  'max-w-[30ch] font-display text-[clamp(26px,2.7vw,42px)] leading-[1.12] font-semibold tracking-[-0.025em] text-pretty text-ink [&_p]:m-0 [&_p+p]:mt-5 [&_ul]:font-body [&_ul]:text-lg [&_ul]:font-normal [&_ul]:tracking-normal';

type Node = {type: string; tagName?: string; properties?: Record<string, unknown>; children?: Node[]};

/**
 * After rehypeWriteUpChapters: marks the first chapter as the open one (the sheet opens on it before any script runs) and
 * reports whether any chapter has no heading, since a field without a label can't become a tab.
 */
const rehypeSheetFields =
  ({sink}: {sink: {headless: boolean}}) =>
  (tree: Node) => {
    const sections = (tree.children ?? []).filter((node) => node.type === 'element' && node.tagName === 'section');
    sink.headless = sections.some((section) => !section.properties?.id);
    const first = sections[0];
    if (first) first.properties = {...first.properties, dataActive: ''};
  };

/** What rehypeWriteUpChapters marked this element as (`data-write-up`), if anything. */
const kind = (props: object) => (props as Record<string, unknown>)['data-write-up'];

/** The prose renderer's own component for a tag, for elements the plugin left unmarked. */
const base = (tag: 'ul' | 'li', props: object) => {
  const Base = (COMPONENTS[tag] ?? tag) as ElementType;
  return <Base {...props} />;
};

/** The prose components, plus the fields, statements, checklist and footnotes that rehypeWriteUpChapters marks. */
const WRITE_UP_COMPONENTS: Components = {
  ...COMPONENTS,
  section: ({node: _node, ...props}) => <section {...props} className={kind(props) === 'chapter' ? FIELD : props.className} />,
  h3: ({node: _node, ...props}) => (kind(props) === 'heading' ? <h3 {...props} className={FIELD_LABEL} /> : <AnchoredHeading level={3} {...props} />),
  div: ({node: _node, ...props}) => {
    if (kind(props) === 'statement') return <div {...props} className={STATEMENT} />;
    if (kind(props) === 'notes') return <div {...props} className="mt-6 max-w-[68ch] border-t border-line pt-6 text-base leading-[1.6] text-muted" />;
    return <div {...props} />;
  },
  ul: ({node: _node, ...props}) =>
    kind(props) === 'checklist' ? <ul {...props} className="write-up-checklist m-0 grid list-none gap-x-8 p-0 md:grid-cols-2" /> : base('ul', props),
  // Opening the checklist's tab ticks its items off one by one (globals.css)
  li: ({node: _node, children, ...props}) =>
    kind(props) === 'item' ? (
      <li {...props} className="flex min-h-14 items-center gap-3.5 border-b border-line py-3 text-[17px] leading-snug max-md:text-base">
        <span aria-hidden="true" className="write-up-tick grid size-7 shrink-0 place-items-center rounded-full bg-lime text-on-lime">
          <Check className="size-4" strokeWidth={3} />
        </span>
        <span className="write-up-item-text">{children}</span>
      </li>
    ) : (
      base('li', {...props, children})
    ),
};

/**
 * Renders a case study's write-up as the sheet's fields: the Markdown is parsed once (so references, footnotes and code
 * fences resolve across chapters, as in the editor's preview) and split at its h2s by rehypeWriteUpChapters. Returns the
 * fields, the headed ones (for the tabs) and whether any field has no label. Cached by the Markdown text, like renderMarkdown.
 */
export const renderWriteUp = async (markdown: string): Promise<{content: ReactNode; chapters: WriteUpChapter[]; headless: boolean}> => {
  'use cache';
  cacheLife('max');
  const chapters: WriteUpChapter[] = [];
  const flags = {headless: false};
  const content = await MarkdownAsync({
    children: markdown,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [rehypeSanitize, SANITIZE_SCHEMA],
      rehypeDemoteH1,
      rehypeSlug,
      [rehypeWriteUpChapters, {sink: chapters}],
      [rehypeSheetFields, {sink: flags}],
      [rehypeShiki, SHIKI_OPTIONS],
    ],
    components: WRITE_UP_COMPONENTS,
  });
  return {content, chapters, headless: flags.headless};
};
