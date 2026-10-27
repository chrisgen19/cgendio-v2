import {describe, expect, it} from 'vitest';
import {brandPalette, contrastRatio, mixHex} from './brand-palette';

describe('mixHex', () => {
  it('mixes like color-mix in srgb', () => {
    expect(mixHex('#e31836', '#ffffff', 0.12)).toBe('#fce3e7');
    expect(mixHex('#e31836', '#15171d', 0.22)).toBe('#421723');
  });
});

describe('contrastRatio', () => {
  it('matches WCAG', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#e31836')).toBeCloseTo(4.72, 2);
  });
});

describe('brandPalette', () => {
  // The six projects, as in the design doc's table
  it.each([
    [
      '#e31836',
      null,
      {background: '#fce3e7', accent: '#ce1732', button: '#e31836', onButton: '#ffffff'},
      {background: '#421723', accent: '#eb5d72', button: '#e31836', onButton: '#ffffff'},
    ],
    [
      '#005fe5',
      null,
      {background: '#e0ecfc', accent: '#005fe5', button: '#005fe5', onButton: '#ffffff'},
      {background: '#102749', accent: '#4d8fed', button: '#4d8fed', onButton: '#0d0e12'},
    ],
    [
      '#415c5a',
      null,
      {background: '#e8ebeb', accent: '#415c5a', button: '#415c5a', onButton: '#ffffff'},
      {background: '#1f262a', accent: '#7e908f', button: '#7e908f', onButton: '#0d0e12'},
    ],
    [
      '#aa0212',
      null,
      {background: '#f5e1e3', accent: '#aa0212', button: '#aa0212', onButton: '#ffffff'},
      {background: '#36121b', accent: '#cc6771', button: '#cc6771', onButton: '#0d0e12'},
    ],
    [
      '#e53845',
      '#6b6460',
      {background: '#edecec', accent: '#c7323e', button: '#e53845', onButton: '#0d0e12'},
      {background: '#28282c', accent: '#eb646e', button: '#e53845', onButton: '#0d0e12'},
    ],
    [
      '#35b65a',
      null,
      {background: '#e7f6eb', accent: '#277d42', button: '#277d42', onButton: '#ffffff'},
      {background: '#1c3a2a', accent: '#35b65a', button: '#35b65a', onButton: '#0d0e12'},
    ],
  ])('derives %s (tint %s)', (brand, tint, light, dark) => {
    expect(brandPalette(brand, tint)).toEqual({light, dark});
  });

  it('reads uppercase hex', () => {
    expect(brandPalette('#E31836')).toEqual(brandPalette('#e31836'));
  });

  it('only changes the backgrounds when a tint is given', () => {
    const plain = brandPalette('#e53845');
    const tinted = brandPalette('#e53845', '#6b6460');
    expect(tinted.light.background).not.toBe(plain.light.background);
    expect(tinted.dark.background).not.toBe(plain.dark.background);
    expect(tinted.light.button).toBe(plain.light.button);
  });

  // Every colour on a 16-level grid, plus the extremes as brand and as tint
  const LEVELS = Array.from({length: 16}, (_, n) => (n * 17).toString(16).padStart(2, '0'));
  const GRID = LEVELS.flatMap((r) => LEVELS.flatMap((g) => LEVELS.map((b) => `#${r}${g}${b}`)));
  const EXTREMES = ['#ffffff', '#000000', '#0d0e12', '#15171d', '#f2f3f5'];

  it('passes AA for every colour, light and dark', () => {
    const cases = [...GRID.map((c) => [c, null] as const), ...EXTREMES.flatMap((c) => EXTREMES.map((t) => [c, t] as const))];
    const failures: string[] = [];
    for (const [brand, tint] of cases) {
      const {light, dark} = brandPalette(brand, tint);
      for (const [mode, shades, text] of [
        ['light', light, '#0d0e12'],
        ['dark', dark, '#f2f3f5'],
      ] as const) {
        if (
          contrastRatio(text, shades.background) < 4.5 ||
          contrastRatio(shades.accent, shades.background) < 4.5 ||
          contrastRatio(shades.button, shades.onButton) < 4.5 ||
          contrastRatio(shades.button, shades.background) < 3
        )
          failures.push(`${brand} tint ${tint} (${mode})`);
      }
    }
    expect(failures).toEqual([]);
  });
});
