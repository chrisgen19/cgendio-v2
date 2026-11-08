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
      decision: null,
      contribution: null,
      outcome: null,
      tourStops: [],
    });
  });

  it('keeps an empty tour when the form posts none', () => {
    expect(projectFormSchema.parse(projectForm).tourStops).toEqual([]);
  });

  it('treats whitespace-only reasoning as empty', () => {
    expect(projectFormSchema.parse({...projectForm, decision: '   '}).decision).toBeNull();
  });

  it('caps reasoning at 2000 characters', () => {
    expect(projectFormSchema.safeParse({...projectForm, outcome: 'a'.repeat(2000)}).success).toBe(true);
    const result = projectFormSchema.safeParse({...projectForm, outcome: 'a'.repeat(2001)});
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.outcome).toBeDefined();
  });

  describe('a stop with a full address', () => {
    const view = {y: 0, box: {x: 0, y: 0, w: 10, h: 10}};
    const capture = {url: 'https://cdn.example.com/a.webp', width: 10, height: 10};
    const tourWith = (path: string) =>
      JSON.stringify([
        {
          key: 'a',
          heading: 'Login',
          note: 'A note',
          emphasis: null,
          selected: 'Form',
          onScreen: 'A form',
          path,
          alt: 'A form',
          captures: {desktop: capture, mobile: capture},
          positions: JSON.stringify({desktop: view, mobile: view}),
        },
      ]);
    const OFF_SITE = 'Stop 1: a full address must be on the live site or one of its subdomains';

    it('saves on a subdomain of the live site', () => {
      expect(projectFormSchema.safeParse({...projectForm, tourStops: tourWith('https://courses.example.com/')}).success).toBe(true);
    });

    it.each(['https://evil.example/', 'https://notexample.com/'])('refuses %s', (path) => {
      const result = projectFormSchema.safeParse({...projectForm, tourStops: tourWith(path)});
      expect(result.error?.flatten().fieldErrors.tourStops).toEqual([OFF_SITE]);
    });

    it('refuses one when the project has no live site', () => {
      const result = projectFormSchema.safeParse({...projectForm, liveUrl: '', tourStops: tourWith('https://courses.example.com/')});
      expect(result.error?.flatten().fieldErrors.tourStops).toEqual([OFF_SITE]);
    });
  });

  it('reports a bad tour on the tourStops field with its message', () => {
    const result = projectFormSchema.safeParse({...projectForm, tourStops: 'nope'});
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.tourStops).toEqual(['The tour could not be read. Reload the page and try again.']);
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
  const postForm = {title: 'A post', slug: 'a-post', excerpt: 'Excerpt', tag: 'Migration', body: '# Hello', coverImageUrl: ''};

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
