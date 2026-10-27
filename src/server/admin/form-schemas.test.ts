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
  tags: 'Next.js, , Tailwind ,',
  coverImageUrl: '',
  caseStudy: '   ',
  liveUrl: 'https://example.com',
  repoUrl: '',
  client: '',
  role: 'Lead developer',
  brandColor: '',
  brandTint: '',
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
      tags: ['Next.js', 'Tailwind'],
      featured: true,
      status: 'PUBLISHED',
      coverImageUrl: null,
      caseStudy: null,
      liveUrl: 'https://example.com',
      repoUrl: null,
      client: null,
      role: 'Lead developer',
      brandColor: null,
      brandTint: null,
    });
  });

  it('lowercases brand colours and rejects anything but #rrggbb', () => {
    expect(projectFormSchema.parse({...projectForm, brandColor: ' #E31836 ', brandTint: '#6B6460'})).toMatchObject({
      brandColor: '#e31836',
      brandTint: '#6b6460',
    });
    const result = projectFormSchema.safeParse({...projectForm, brandColor: '#fff'});
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Use a hex colour like #e31836');
  });

  it('treats missing brand colours as none', () => {
    const {brandColor: _brandColor, brandTint: _brandTint, ...rest} = projectForm;
    expect(projectFormSchema.parse(rest)).toMatchObject({brandColor: null, brandTint: null});
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

  it('rejects a bad slug or link', () => {
    expect(projectFormSchema.safeParse({...projectForm, slug: 'Bad Slug'}).success).toBe(false);
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
      photoUrl: null,
      linkedinUrl: null,
    });
    expect(settingsFormSchema.safeParse({contactEmail: 'me@example.com', cvUrl: 'ftp://example.com/cv.pdf'}).success).toBe(false);
  });
});
