import {describe, expect, it} from 'vitest';
import {llmsTxt, markdownResponse, postToMarkdown, projectToMarkdown} from './markdown-export';

const ctx = {author: 'Chris Diomampo', url: 'https://cgdiomampo.dev/writing/a-post'};

describe('postToMarkdown', () => {
  it('puts the title, excerpt and facts above the body, with one trailing newline', () => {
    const markdown = postToMarkdown(
      {
        title: 'A post',
        excerpt: 'What it covers.',
        date: '2026-10-05',
        updatedAt: '2026-10-07T09:30:00.000Z',
        tag: 'WordPress',
        body: '## First\n\nText.\n\n',
      },
      ctx,
    );
    expect(markdown).toBe(
      `${[
        '# A post',
        '> What it covers.',
        [
          '- Author: Chris Diomampo',
          '- Published: 2026-10-05',
          '- Updated: 2026-10-07',
          '- Tag: WordPress',
          '- Canonical: https://cgdiomampo.dev/writing/a-post',
        ].join('\n'),
        '## First\n\nText.',
      ].join('\n\n')}\n`,
    );
  });
});

describe('projectToMarkdown', () => {
  const project = {
    title: 'Access Hire Australia',
    summary: 'Hire and sales site.',
    kindLabel: 'Client site',
    client: 'Access Hire',
    role: 'Lead developer',
    tags: ['Next.js', 'Builder.io'],
    liveUrl: 'https://example.com',
    repoUrl: null,
    decision: 'Why headless.',
    contribution: null,
    outcome: '  Faster pages.  ',
    caseStudy: '## Background\n\nThe write-up.',
  };

  it('lists the set facts, the reasoning under the page headings, then the write-up', () => {
    const markdown = projectToMarkdown(project, {...ctx, url: 'https://cgdiomampo.dev/projects/access-hire'});
    expect(markdown).toContain('- Client: Access Hire\n- Role: Lead developer\n- Stack: Next.js, Builder.io\n- Live site: https://example.com');
    expect(markdown).not.toContain('Source:');
    expect(markdown).not.toContain('## My part');
    expect(markdown.indexOf('## The decision\n\nWhy headless.')).toBeLessThan(markdown.indexOf('## The result\n\nFaster pages.'));
    expect(markdown.endsWith('## Background\n\nThe write-up.\n')).toBe(true);
  });

  it('skips a missing write-up', () => {
    expect(projectToMarkdown({...project, caseStudy: null}, ctx).endsWith('Faster pages.\n')).toBe(true);
  });
});

describe('llmsTxt', () => {
  const input = {
    name: 'Chris Diomampo',
    summary: 'A summary.',
    facts: [
      {label: 'Based in', value: 'Pasig City, Philippines'},
      {label: 'On the web', value: '15+ years'},
    ],
    site: 'https://cgdiomampo.dev',
    email: 'me@example.com',
    posts: [{title: 'A post', excerpt: 'Excerpt.', url: 'https://cgdiomampo.dev/writing/a-post.md'}],
    projects: [{title: 'A project', summary: 'Summary.', url: 'https://cgdiomampo.dev/projects/a-project.md'}],
    links: [{label: 'GitHub', url: 'https://github.com/x', note: 'code'}],
  };

  it('follows the llmstxt.org layout: title, summary, facts, then link sections', () => {
    expect(llmsTxt(input)).toBe(
      `${[
        '# Chris Diomampo',
        '> A summary.',
        '- Based in: Pasig City, Philippines\n- On the web: 15+ years',
        'Site: https://cgdiomampo.dev/. Contact: me@example.com.',
        '## Writing',
        '- [A post](https://cgdiomampo.dev/writing/a-post.md): Excerpt.',
        '## Projects',
        '- [A project](https://cgdiomampo.dev/projects/a-project.md): Summary.',
        '## Optional',
        '- [GitHub](https://github.com/x): code',
      ].join('\n\n')}\n`,
    );
  });

  it('says so when a section is empty', () => {
    const text = llmsTxt({...input, posts: [], projects: []});
    expect(text).toContain('## Writing\n\nNothing published yet.');
    expect(text).toContain('## Projects\n\nNothing listed yet.');
  });
});

describe('markdownResponse', () => {
  it('points search engines at the HTML page and varies on Accept', async () => {
    const response = markdownResponse('# Hi\n', 'https://cgdiomampo.dev/writing/a-post');
    expect(response.headers.get('content-type')).toBe('text/markdown; charset=utf-8');
    expect(response.headers.get('link')).toBe('<https://cgdiomampo.dev/writing/a-post>; rel="canonical"');
    expect(response.headers.get('vary')).toBe('Accept');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(await response.text()).toBe('# Hi\n');
  });
});
