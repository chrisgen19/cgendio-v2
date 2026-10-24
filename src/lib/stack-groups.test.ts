import {describe, expect, it} from 'vitest';
import {countTools, groupStack} from './stack-groups';

describe('groupStack', () => {
  it('sorts names into the approved groups in group order, keeping the incoming order inside each group', () => {
    const groups = groupStack(['Coolify', 'React', 'Next.js', 'Figma', 'PHP']);
    expect(groups).toEqual([
      {key: 'frontend', label: 'Frontend', tools: ['React', 'Next.js']},
      {key: 'backendAndData', label: 'Backend & data', tools: ['PHP']},
      {key: 'design', label: 'Design', tools: ['Figma']},
      {key: 'hostingAndInfra', label: 'Hosting & infra', tools: ['Coolify']},
    ]);
  });

  it('puts unknown names into a trailing Other group instead of failing', () => {
    const groups = groupStack(['Docker', 'Figma', 'Astro']);
    expect(groups.at(-1)).toEqual({key: 'other', label: 'Other', tools: ['Docker', 'Astro']});
    expect(countTools(groups)).toBe(3);
  });

  it('returns no groups for an empty stack', () => {
    expect(groupStack([])).toEqual([]);
  });
});
