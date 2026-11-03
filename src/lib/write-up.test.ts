import {describe, expect, it} from 'vitest';
import {splitWriteUp} from './write-up';

describe('splitWriteUp', () => {
  it('splits at ## headings and picks out a plain bullet list', () => {
    const sections = splitWriteUp('## Built\n\nA shop.\n\n## What it included\n\n- Boxes\n- Delivery slots\n');
    expect(sections).toEqual([
      {heading: 'Built', markdown: 'A shop.', items: null},
      {heading: 'What it included', markdown: '- Boxes\n- Delivery slots', items: ['Boxes', 'Delivery slots']},
    ]);
  });

  it('keeps text before the first heading and skips an empty lead', () => {
    expect(splitWriteUp('Intro.\n\n## A\n\nB')).toEqual([
      {heading: null, markdown: 'Intro.', items: null},
      {heading: 'A', markdown: 'B', items: null},
    ]);
    expect(splitWriteUp('\n## A\n\nB')).toHaveLength(1);
  });

  it('leaves lists with inline Markdown to the renderer', () => {
    expect(splitWriteUp('## A\n\n- Uses `pnpm`\n- Plain')[0]?.items).toBeNull();
  });

  it('ignores ## lines inside fenced code', () => {
    const sections = splitWriteUp('## A\n\n```md\n## not a heading\n```');
    expect(sections).toHaveLength(1);
    expect(sections[0]?.markdown).toContain('## not a heading');
  });
});
