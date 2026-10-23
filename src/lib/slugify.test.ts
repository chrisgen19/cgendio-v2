import {describe, expect, it} from 'vitest';
import {slugify} from './slugify';

describe('slugify', () => {
  it('turns a title into lowercase words joined by single hyphens', () => {
    expect(slugify('Off-hire landing page & form')).toBe('off-hire-landing-page-form');
    expect(slugify('Migrating 20+ WordPress sites to Next.js')).toBe('migrating-20-wordpress-sites-to-next-js');
  });

  it('strips accents', () => {
    expect(slugify('Café résumé')).toBe('cafe-resume');
  });

  it('trims leading and trailing separators', () => {
    expect(slugify('  --Hello, world!--  ')).toBe('hello-world');
  });

  it('returns an empty string when nothing is left', () => {
    expect(slugify('!!! ???')).toBe('');
  });

  it('caps the slug at 80 characters without ending on a hyphen', () => {
    // 79 letters then a space: the cut at 80 lands on the hyphen, which must be trimmed
    const slug = slugify(`${'a'.repeat(79)} tail`);
    expect(slug).toBe('a'.repeat(79));
    expect(slugify('word '.repeat(40)).length).toBeLessThanOrEqual(80);
    expect(slugify('word '.repeat(40))).not.toMatch(/-$/);
  });
});
