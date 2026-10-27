import {describe, expect, it} from 'vitest';
import {brandPanelStyle} from './project-theme';

describe('brandPanelStyle', () => {
  it('returns nothing without a brand colour, even with a tint', () => {
    expect(brandPanelStyle(null, null)).toBeUndefined();
    expect(brandPanelStyle(null, '#6b6460')).toBeUndefined();
  });

  it('sets the light and dark variables from the palette', () => {
    expect(brandPanelStyle('#005fe5', null)).toEqual({
      '--brand-bg-light': '#e0ecfc',
      '--brand-accent-light': '#005fe5',
      '--brand-button-light': '#005fe5',
      '--brand-on-button-light': '#ffffff',
      '--brand-bg-dark': '#102749',
      '--brand-accent-dark': '#4d8fed',
      '--brand-button-dark': '#4d8fed',
      '--brand-on-button-dark': '#0d0e12',
    });
  });
});
