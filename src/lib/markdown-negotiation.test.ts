import {describe, expect, it} from 'vitest';
import nextConfig from '../../next.config';

/*
 * The Accept rules on the Markdown rewrites (next.config.ts), matched the way Next matches `has` and `missing` header
 * values: the pattern anchored as ^...$. Ported from the previous site (#81).
 */
type HeaderRule = {type: string; key: string; value?: string};
type Rewrite = {source: string; destination: string; has?: HeaderRule[]; missing?: HeaderRule[]};

if (!nextConfig.rewrites) throw new Error('next.config.ts has no rewrites');
const {beforeFiles} = (await nextConfig.rewrites()) as {beforeFiles: Rewrite[]};
const negotiated = beforeFiles.filter((rule) => rule.has);
const matches = (rule: HeaderRule, accept: string) => new RegExp(`^${rule.value}$`).test(accept);
const servesMarkdown = (rule: Rewrite, accept: string) =>
  (rule.has ?? []).every((has) => matches(has, accept)) && !(rule.missing ?? []).some((missing) => matches(missing, accept));

describe('Markdown URLs', () => {
  it('serves <page>.md for posts and case studies', () => {
    expect(beforeFiles.filter((rule) => !rule.has).map(({source, destination}) => [source, destination])).toEqual([
      ['/writing/:slug([a-z0-9-]+).md', '/md/writing/:slug'],
      ['/projects/:slug([a-z0-9-]+).md', '/md/projects/:slug'],
    ]);
  });
});

describe('Markdown content negotiation', () => {
  it('covers both the post and the case study URLs', () => {
    expect(negotiated.map((rule) => rule.source)).toEqual(['/writing/:slug([a-z0-9-]+)', '/projects/:slug([a-z0-9-]+)']);
  });

  it.each([
    ['text/markdown, text/html;q=0.9, */*;q=0.8', true],
    ['text/markdown', true],
    ['text/html, text/markdown;q=0.5', true],
    ['text/markdown;q=0.01', true],
    ['text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', false],
    ['*/*', false],
    ['text/html, text/markdown;q=0', false],
    ['text/markdown;q=0.0', false],
    ['text/markdown; charset=utf-8; q=0, text/html', false],
  ])('Accept: %s, Markdown: %s', (accept, expected) => {
    for (const rule of negotiated) expect(servesMarkdown(rule, accept)).toBe(expected);
  });
});
