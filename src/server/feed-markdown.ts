import 'server-only';
import {cacheLife} from 'next/cache';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import {unified} from 'unified';
import {rehypeDemoteH1, SANITIZE_SCHEMA} from '@/lib/markdown-plugins';

/**
 * A post body as plain HTML, for the RSS feed's content:encoded.
 *
 * Deliberately not src/components/prose/markdown.tsx: that renders React with Tailwind class names, the code-window
 * chrome and Shiki's inline colours, none of which survive a feed reader's own stylesheet and all of which would
 * multiply the size of every item. Next also refuses react-dom/server in the App Router, so there is no way to turn
 * that renderer into a string. This keeps the same sanitising and the same h1 demotion, and leaves the markup
 * semantic: remark-rehype drops raw HTML before rehype-sanitize runs, as on the page.
 *
 * Cached by the Markdown text, like the page renderer: the same body never needs converting twice.
 */
export const renderFeedHtml = async (markdown: string): Promise<string> => {
  'use cache';
  cacheLife('max');
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize, SANITIZE_SCHEMA)
    .use(rehypeDemoteH1)
    .use(rehypeStringify)
    .process(markdown);
  return String(file);
};
