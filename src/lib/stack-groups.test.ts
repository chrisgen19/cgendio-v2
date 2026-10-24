import {describe, expect, it} from 'vitest';
import {groupStack} from './stack-groups';

describe('groupStack', () => {
  it('orders the layers bottom to top and keeps the tools in their given order', () => {
    const groups = groupStack(['React', 'Next.js', 'Figma', 'Coolify', 'Vercel', 'PHP']);
    expect(groups.map((g) => g.id)).toEqual(['hosting', 'backend', 'frontend', 'design']);
    expect(groups[0]?.tools).toEqual(['Coolify', 'Vercel']);
    expect(groups[2]?.tools).toEqual(['React', 'Next.js']);
  });

  it('puts unknown tools in an Other layer on top instead of dropping them', () => {
    const groups = groupStack(['Vercel', 'Docker', 'Astro']);
    expect(groups.at(-1)).toEqual({id: 'other', name: 'Other', role: null, tools: ['Docker', 'Astro']});
  });

  it('returns no layers for an empty stack', () => {
    expect(groupStack([])).toEqual([]);
  });
});
