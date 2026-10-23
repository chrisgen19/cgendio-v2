import 'server-only';
import rehypeShiki, {type RehypeShikiOptions} from '@shikijs/rehype';
import {cacheLife} from 'next/cache';
import type {ComponentProps, ReactNode} from 'react';
import {type Components, MarkdownAsync} from 'react-markdown';
import rehypeSanitize, {defaultSchema} from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import {CODE_THEME} from '@/lib/code-theme';
import {rehypeCollectToc, rehypeDemoteH1, type TocItem} from '@/lib/markdown-plugins';

const SHIKI_OPTIONS: RehypeShikiOptions = {
  theme: CODE_THEME,
  langs: ['ts', 'tsx', 'js', 'jsx', 'json', 'bash', 'shell', 'css', 'html', 'php', 'sql', 'yaml', 'markdown', 'diff', 'prisma'],
  defaultLanguage: 'text',
  fallbackLanguage: 'text',
  addLanguageClass: true,
  // The language name for the code window's tab
  transformers: [
    {
      pre(node) {
        node.properties.dataLanguage = this.options.lang;
      },
    },
  ],
};

/**
 * GitHub's sanitize schema without its own id prefix: remark-rehype already prefixes footnote ids and their links with
 * "user-content-", and raw HTML (the only other source of ids) is removed, so a second prefix would only break footnotes.
 */
const SANITIZE_SCHEMA = {...defaultSchema, clobberPrefix: ''};

type HeadingProps = ComponentProps<'h2'> & {level: 2 | 3};

/** A heading with a "#" link to itself that shows on hover or keyboard focus. */
function AnchoredHeading({level, id, className, children}: HeadingProps) {
  const Tag = level === 2 ? 'h2' : 'h3';
  // The GFM footnotes label is visually hidden and needs no anchor
  if (!id || className?.includes('sr-only')) {
    return (
      <Tag id={id} className={className}>
        {children}
      </Tag>
    );
  }
  return (
    <Tag
      id={id}
      className={
        level === 2
          ? 'group relative mt-14 mb-4 scroll-mt-24 font-display text-[32px] leading-[1.15] font-bold tracking-[-0.03em] max-md:text-[28px]'
          : 'group relative mt-10 mb-3 scroll-mt-24 font-display text-2xl leading-[1.2] font-bold tracking-[-0.02em]'
      }
    >
      {children}
      <a
        href={`#${id}`}
        className="ml-2 inline-flex min-h-11 min-w-11 items-center justify-center align-middle font-mono text-[0.6em] text-muted no-underline opacity-0 transition-opacity group-hover:opacity-100 hover:text-accent focus-visible:opacity-100 motion-reduce:transition-none"
      >
        <span aria-hidden="true">#</span>
        <span className="sr-only">Link to this section</span>
      </a>
    </Tag>
  );
}

/** Shiki's <pre> inside the canvas's editor window: three dots and a tab with the language. */
function CodeWindow({node, children, className, style, tabIndex}: ComponentProps<'pre'> & {node?: {properties?: Record<string, unknown>}}) {
  const language = node?.properties?.dataLanguage;
  return (
    <figure className="my-8 overflow-hidden rounded-card bg-code-bg shadow-(--shadow-deep)">
      <div className="flex items-center gap-2 px-4 pt-3.5 pb-2.5" aria-hidden="true">
        <i className="block size-[9px] rounded-full bg-code-dots" />
        <i className="block size-[9px] rounded-full bg-code-dots" />
        <i className="block size-[9px] rounded-full bg-code-dots" />
        {typeof language === 'string' && language !== 'text' ? (
          <span className="ml-3 rounded-md bg-code-chrome px-[9px] py-[5px] font-mono text-xs leading-none text-on-dark">{language}</span>
        ) : null}
      </div>
      <pre
        className={`${className ?? ''} m-0 overflow-x-auto px-5 pt-1 pb-5 font-mono text-sm leading-[1.75] max-md:text-[13.5px] max-md:leading-[1.6]`}
        style={style}
        tabIndex={tabIndex}
      >
        {children}
      </pre>
    </figure>
  );
}

const COMPONENTS: Components = {
  h2: ({node: _node, ...props}) => <AnchoredHeading level={2} {...props} />,
  h3: ({node: _node, ...props}) => <AnchoredHeading level={3} {...props} />,
  h4: ({node: _node, ...props}) => <h4 className="mt-8 mb-2 font-display text-xl font-bold tracking-[-0.01em]" {...props} />,
  p: ({node: _node, ...props}) => <p className="my-6" {...props} />,
  a: ({node: _node, href, ...props}) => (
    <a
      href={href}
      rel={href?.startsWith('http') ? 'noreferrer' : undefined}
      className="text-accent underline decoration-1 underline-offset-[3px] hover:text-accent-hover"
      {...props}
    />
  ),
  ul: ({node: _node, className, ...props}) => <ul className={`my-6 list-disc pl-6 ${className ?? ''}`} {...props} />,
  ol: ({node: _node, ...props}) => <ol className="my-6 list-decimal pl-6" {...props} />,
  li: ({node: _node, ...props}) => <li className="my-2 pl-1 marker:text-muted" {...props} />,
  blockquote: ({node: _node, ...props}) => <blockquote className="my-8 border-l-4 border-lime pl-5 text-muted" {...props} />,
  hr: ({node: _node, ...props}) => <hr className="my-12 border-line" {...props} />,
  strong: ({node: _node, ...props}) => <strong className="font-semibold" {...props} />,
  // Block code keeps Shiki's classes; inline code gets a soft chip
  code: ({node: _node, className, ...props}) =>
    className?.includes('language-') ? (
      <code className={className} {...props} />
    ) : (
      <code className="rounded-md bg-ground px-1.5 py-0.5 font-mono text-[0.86em]" {...props} />
    ),
  pre: CodeWindow,
  table: ({node: _node, ...props}) => (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse text-base" {...props} />
    </div>
  ),
  th: ({node: _node, ...props}) => <th className="border-b border-line px-3 py-2 text-left font-semibold" {...props} />,
  td: ({node: _node, ...props}) => <td className="border-b border-line px-3 py-2 align-top" {...props} />,
  img: ({node: _node, alt, src}) => (
    // biome-ignore lint/performance/noImgElement: Markdown images have no known size and can come from any host, so next/image can't size or optimise them
    <img
      src={typeof src === 'string' ? src : undefined}
      alt={alt ?? ''}
      loading="lazy"
      decoding="async"
      className="my-8 h-auto max-w-full rounded-card"
    />
  ),
};

/**
 * Renders post or case study Markdown from the database on the server. Raw HTML is removed (rehype-sanitize) before
 * anything else runs; headings get ids (rehype-slug) and the h2s are returned for the table of contents; code blocks
 * are highlighted by Shiki last, on trusted output.
 *
 * Cached by the Markdown text: Shiki's tokenizer reads the clock (a time limit per line), which Cache Components only
 * allows inside a cache scope, and the same body never needs highlighting twice.
 */
export const renderMarkdown = async (markdown: string): Promise<{content: ReactNode; toc: TocItem[]}> => {
  'use cache';
  cacheLife('max');
  const toc: TocItem[] = [];
  const content = await MarkdownAsync({
    children: markdown,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [[rehypeSanitize, SANITIZE_SCHEMA], rehypeDemoteH1, rehypeSlug, [rehypeCollectToc, {sink: toc}], [rehypeShiki, SHIKI_OPTIONS]],
    components: COMPONENTS,
  });
  return {content: <div className="max-w-[68ch] text-lg leading-[1.7] text-ink max-md:text-[17px]">{content}</div>, toc};
};
