import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {SITE_NAME} from '@/lib/metadata';

/*
 * The share cards are PNGs, so an e2e test can check that one renders but not what it says. This guards the one thing
 * the image test cannot see: the wordmark drawn on every card. It used to be the hard-coded domain, which left the
 * cards advertising "cgdiomampo.dev" while their alt text said the brand name (#81 Phase A, raised on #90).
 */
const source = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

describe('the share card wordmark', () => {
  it('comes from SITE_NAME rather than a hard-coded brand', () => {
    const card = source('./og-card.tsx');
    expect(card).toContain('{SITE_NAME}');
    expect(card).not.toMatch(/cgdiomampo\.dev/i);
  });

  it('is the brand the rest of the site uses', () => {
    expect(SITE_NAME).toBe('Chris Diomampo');
  });
});
