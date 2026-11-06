import {describe, expect, it} from 'vitest';
import {stripMarkers} from './marked-copy';

describe('stripMarkers', () => {
  it('keeps the marked words and drops the brackets', () => {
    expect(stripMarkers('From the [[blog.]]')).toBe('From the blog.');
  });

  it('handles several marks in one line', () => {
    expect(stripMarkers('Two kinds of site, [[both]] done [[properly]].')).toBe('Two kinds of site, both done properly.');
  });

  it('leaves unmarked copy alone', () => {
    expect(stripMarkers('Nothing to strip here')).toBe('Nothing to strip here');
  });
});
