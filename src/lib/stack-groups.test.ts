import {describe, expect, it} from 'vitest';
import {groupStack, STACK_EXTRAS} from './stack-groups';

describe('STACK_EXTRAS', () => {
  const tools = STACK_EXTRAS.flatMap((group) => group.tools);

  it('lists every tool once', () => {
    expect(new Set(tools).size).toBe(tools.length);
  });

  it('repeats nothing that is already on a plate', () => {
    expect(groupStack(tools).map((group) => group.id)).toEqual(['other']);
  });
});

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
