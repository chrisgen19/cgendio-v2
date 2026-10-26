import {describe, expect, it} from 'vitest';
import {buildSpanChart, monthOf, parseWhen} from './timeline-v2-spans';

const m = (year: number, month: number) => year * 12 + month;
const NOW = m(2026, 9); // Oct 2026

describe('parseWhen', () => {
  it('parses the seeded formats', () => {
    expect(parseWhen('Jun 2025 - Now', NOW)).toEqual({start: m(2025, 5), end: NOW + 1, open: true});
    expect(parseWhen('Feb - Jun 2025', NOW)).toEqual({start: m(2025, 1), end: m(2025, 6), open: false});
    expect(parseWhen('Mar 2022 - Nov 2024', NOW)).toEqual({start: m(2022, 2), end: m(2024, 11), open: false});
    expect(parseWhen('2007 - 2018', NOW)).toEqual({start: m(2007, 0), end: m(2019, 0), open: false});
  });

  it('accepts dashes, "to" and the open-ended words', () => {
    expect(parseWhen('Jun 2025 \u2013 Present', NOW)?.open).toBe(true);
    expect(parseWhen('Jun 2025\u2014current', NOW)?.open).toBe(true);
    expect(parseWhen('June 2025 to Today', NOW)?.end).toBe(NOW + 1);
    expect(parseWhen('2019-2022', NOW)).toEqual({start: m(2019, 0), end: m(2023, 0), open: false});
    expect(parseWhen('October 2020 to March 2021', NOW)).toEqual({start: m(2020, 9), end: m(2021, 3), open: false});
  });

  it('handles single dates and a start month later than the end month', () => {
    expect(parseWhen('2020', NOW)).toEqual({start: m(2020, 0), end: m(2021, 0), open: false});
    expect(parseWhen('Jun 2025', NOW)).toEqual({start: m(2025, 5), end: m(2025, 6), open: false});
    expect(parseWhen('Nov - Feb 2025', NOW)).toEqual({start: m(2024, 10), end: m(2025, 2), open: false});
  });

  it('returns null for text it cannot read', () => {
    for (const text of ['', 'Since forever', 'Now', 'Feb - Now', '2020 - 2018', 'Jun 2025 - Now - Later', 'Q1 2020 - 2021', '13/2020']) {
      expect(parseWhen(text, NOW)).toBeNull();
    }
  });
});

describe('monthOf', () => {
  it('counts months from year zero', () => {
    expect(monthOf(new Date(Date.UTC(2026, 9, 26)))).toBe(NOW);
  });
});

describe('buildSpanChart', () => {
  const chart = buildSpanChart(
    ['Jun 2025 - Now', 'Feb - Jun 2025', 'Mar 2022 - Nov 2024', 'Jul 2019 - Feb 2022', 'Sep 2018 - May 2019', '2007 - 2018', '??'],
    NOW,
  );

  it('runs the axis from the first January to now', () => {
    expect(chart.firstYear).toBe(2007);
    expect(chart.ticks[0]).toMatchObject({year: 2007, frac: 0, labelled: true});
    expect(chart.ticks.filter((t) => t.labelled).map((t) => t.year)).toEqual([2007, 2010, 2015, 2020, 2025]);
    expect(chart.ticks.at(-1)?.nearEnd).toBe(true);
  });

  it('places the open role against the right edge and keeps labels on the chart', () => {
    const [current, short, , , , long, unknown] = chart.placements;
    expect((current?.s ?? 0) + (current?.w ?? 0)).toBeCloseTo(1);
    expect(current).toMatchObject({open: true, side: 'start'});
    expect(short?.w).toBeCloseTo(4 / 238);
    expect(long).toMatchObject({s: 0, side: 'end'});
    expect(unknown).toBeNull();
  });

  it('cuts future ends at now', () => {
    const [future] = buildSpanChart(['2024 - 2030'], NOW).placements;
    expect((future?.s ?? 0) + (future?.w ?? 0)).toBeCloseTo(1);
  });
});
