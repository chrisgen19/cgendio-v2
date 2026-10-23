import {describe, expect, it} from 'vitest';
import {postFormSchema, projectFormSchema, settingsFormSchema} from './form-schemas';

/* Admin forms post FormData, so every value arrives as a string (or is missing, for an unchecked switch). */

const projectForm = {
  title: '  Off-hire landing page  ',
  slug: 'off-hire-landing-page',
  summary: 'A summary',
  kindLabel: 'Client work',
  group: 'CLIENT',
  glyph: 'Oh',
  theme: 'LIME',
  span: '7',
  tags: 'Next.js, , Tailwind ,',
  coverImageUrl: '',
  caseStudy: '   ',
  liveUrl: 'https://example.com',
  repoUrl: '',
  client: '',
  role: 'Lead developer',
};

describe('projectFormSchema', () => {
  it('coerces form strings into the row shape', () => {
    expect(projectFormSchema.parse({...projectForm, featured: 'on', status: 'on'})).toEqual({
      title: 'Off-hire landing page',
      slug: 'off-hire-landing-page',
      summary: 'A summary',
      kindLabel: 'Client work',
      group: 'CLIENT',
      glyph: 'Oh',
      theme: 'LIME',
      span: 7,
      tags: ['Next.js', 'Tailwind'],
      featured: true,
      status: 'PUBLISHED',
      coverImageUrl: null,
      caseStudy: null,
      liveUrl: 'https://example.com',
      repoUrl: null,
      client: null,
      role: 'Lead developer',
    });
  });

  it('treats a missing switch as off and draft', () => {
    const parsed = projectFormSchema.parse(projectForm);
    expect(parsed.featured).toBe(false);
    expect(parsed.status).toBe('DRAFT');
  });

  it('reports required fields by name', () => {
    const result = projectFormSchema.safeParse({...projectForm, title: '   '});
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({path: ['title'], message: 'Title is required'});
  });

  it('rejects a bad slug, span or link', () => {
    expect(projectFormSchema.safeParse({...projectForm, slug: 'Bad Slug'}).success).toBe(false);
    expect(projectFormSchema.safeParse({...projectForm, span: '3'}).success).toBe(false);
    expect(projectFormSchema.safeParse({...projectForm, liveUrl: 'javascript:alert(1)'}).success).toBe(false);
    expect(projectFormSchema.safeParse({...projectForm, liveUrl: 'mailto:me@example.com'}).success).toBe(false);
  });

  it('allows at most 8 tags', () => {
    expect(projectFormSchema.safeParse({...projectForm, tags: 'a,b,c,d,e,f,g,h'}).success).toBe(true);
    expect(projectFormSchema.safeParse({...projectForm, tags: 'a,b,c,d,e,f,g,h,i'}).success).toBe(false);
  });
});

describe('postFormSchema', () => {
  const postForm = {title: 'A post', slug: 'a-post', excerpt: 'Excerpt', tag: 'MIGRATION', body: '# Hello', coverImageUrl: ''};

  it('leaves the publish date empty until the post is published', () => {
    expect(postFormSchema.parse({...postForm, publishedAt: ''}).publishedAt).toBeNull();
    expect(postFormSchema.parse({...postForm, publishedAt: '2026-10-01'}).publishedAt).toBe('2026-10-01');
    expect(postFormSchema.safeParse({...postForm, publishedAt: '1 Oct 2026'}).success).toBe(false);
  });
});

describe('settingsFormSchema', () => {
  it('needs a contact email and only accepts web URLs for the CV', () => {
    expect(settingsFormSchema.safeParse({contactEmail: '', cvUrl: ''}).success).toBe(false);
    expect(settingsFormSchema.parse({contactEmail: 'me@example.com', cvUrl: '', linkedinUrl: ''})).toEqual({
      contactEmail: 'me@example.com',
      openToProjects: false,
      cvUrl: null,
      linkedinUrl: null,
    });
    expect(settingsFormSchema.safeParse({contactEmail: 'me@example.com', cvUrl: 'ftp://example.com/cv.pdf'}).success).toBe(false);
  });
});
