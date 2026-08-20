import { describe, it, expect } from 'vitest';
import { fitActions, type FitInput, type FitResult } from './actionBarFit';

const fit = (over: Partial<FitInput>): FitResult =>
  fitActions({
    widths: [],
    compactWidths: [],
    available: 0,
    gap: 8,
    overflowWidth: 50,
    pinned: 0,
    tierAlwaysPresent: false,
    previous: 99,
    ...over,
  });

const THREE = { widths: [100, 100, 100], compactWidths: [100, 100, 100] } as const;

const SIX = {
  widths: [100, 100, 100, 100, 100, 100],
  compactWidths: [80, 80, 80, 80, 80, 80],
} as const;

describe('the plain fit ladder', () => {
  it.each([
    { available: 400, inBar: 3, compact: false },
    { available: 316, inBar: 3, compact: false }, // exactly the requirement — inclusive
    { available: 315, inBar: 2, compact: true },
    { available: 266, inBar: 2, compact: true },
    { available: 265, inBar: 1, compact: true },
    { available: 158, inBar: 1, compact: true },
    { available: 157, inBar: 0, compact: true },
  ])('seats $inBar of 3 actions in $available px', ({ available, inBar, compact }) => {
    expect(fit({ ...THREE, available })).toEqual({ inBar, compact });
  });

  it('charges the gap between items but not after the last one', () => {
    expect(fit({ ...THREE, available: 266 }).inBar).toBe(2);
    expect(fit({ ...THREE, available: 265 }).inBar).toBe(1);
  });
});

describe('the needsControl budget', () => {
  const TAPERED = { widths: [100, 100, 20], compactWidths: [100, 100, 20] } as const;

  it('seats every action in a width that could not seat all but one', () => {
    expect(fit({ ...TAPERED, available: 240 })).toEqual({ inBar: 3, compact: false });
    expect(
      fit({ widths: [100, 100, 200], compactWidths: [100, 100, 200], available: 240 }),
    ).toEqual({ inBar: 1, compact: true });
  });

  it('charges the cluster to every split once the tier always has content', () => {
    expect(fit({ ...TAPERED, available: 240, tierAlwaysPresent: true })).toEqual({
      inBar: 1,
      compact: true,
    });
  });

  it('costs the cluster its width at the top of the ladder', () => {
    const TWO = { widths: [100, 100], compactWidths: [100, 100], available: 208 } as const;
    expect(fit(TWO).inBar).toBe(2);
    expect(fit({ ...TWO, tierAlwaysPresent: true }).inBar).toBe(1);
  });
});

describe('dropping icons', () => {
  const COMPACT = { widths: [100, 100, 100], compactWidths: [80, 80, 80] } as const;

  it('drops icons to seat more actions', () => {
    expect(fit({ ...COMPACT, available: 250 })).toEqual({ inBar: 2, compact: true });
  });

  it('drops icons to seat the whole row', () => {
    expect(fit({ ...COMPACT, available: 300 })).toEqual({ inBar: 3, compact: true });
  });

  it('keeps icons when everything already fits', () => {
    expect(fit({ ...COMPACT, available: 320 })).toEqual({ inBar: 3, compact: false });
  });

  it('still drops icons when dropping them seats no more', () => {
    expect(fit({ widths: [100, 100, 100], compactWidths: [98, 98, 98], available: 250 })).toEqual({
      inBar: 1,
      compact: true,
    });
  });

  it('does not restore icons at a width where the two ladders tie', () => {
    expect(fit({ ...SIX, available: 489, previous: 4 })).toEqual({ inBar: 4, compact: true });
  });

  it('never turns compact back off as the panel narrows', () => {
    let previous: number = SIX.widths.length;
    let lastInBar: number = SIX.widths.length;
    let sawCompact = false;

    for (let available = 900; available >= 100; available -= 1) {
      const result = fit({ ...SIX, available, pinned: 1, previous });

      expect(result.inBar).toBeLessThanOrEqual(lastInBar);
      if (sawCompact) {
        expect({ available, compact: result.compact }).toEqual({ available, compact: true });
      }

      sawCompact = sawCompact || result.compact;
      lastInBar = result.inBar;
      previous = result.inBar;
    }

    expect(sawCompact).toBe(true);
    expect(lastInBar).toBeLessThan(SIX.widths.length);
  });

  it('is all-or-nothing: the result carries one flag for the whole row', () => {
    const result = fit({ ...COMPACT, available: 250 });
    expect(result.compact).toBe(true);
    expect(Object.keys(result).sort()).toEqual(['compact', 'inBar']);
  });
});

describe('the pinned floor', () => {
  it('never drops below pinned, even with no room at all', () => {
    expect(
      fit({ widths: [100, 100, 100], compactWidths: [80, 80, 80], available: 10, pinned: 2 }),
    ).toEqual({ inBar: 2, compact: true });
  });

  it('still overflows down to the floor, not past it', () => {
    expect(
      fit({ widths: [100, 100, 100], compactWidths: [80, 80, 80], available: 100, pinned: 1 }),
    ).toEqual({ inBar: 1, compact: true });
  });

  it('does not let the floor block a wider fit', () => {
    expect(fit({ ...THREE, available: 400, pinned: 1 }).inBar).toBe(3);
  });
});

describe('the one-sided deadband', () => {
  const TWO = { widths: [100, 100], compactWidths: [100, 100] } as const;

  it('demotes at the exact threshold, with no slack granted', () => {
    expect(fit({ ...TWO, available: 208, previous: 2 }).inBar).toBe(2);
    expect(fit({ ...TWO, available: 207, previous: 2 }).inBar).toBe(1);
  });

  it.each([
    { available: 207 },
    { available: 208 }, // the width that held it a moment ago — still not enough
    { available: 212 },
    { available: 215 }, // one pixel short of the full deadband
  ])('does not re-promote at $available px once demoted', ({ available }) => {
    expect(fit({ ...TWO, available, previous: 1 }).inBar).toBe(1);
  });

  it('re-promotes only once the budget clears the requirement by a full hysteresis', () => {
    expect(fit({ ...TWO, available: 216, previous: 1 }).inBar).toBe(2);
  });

  it('honours an explicit hysteresis over the gap default', () => {
    expect(fit({ ...TWO, available: 208, previous: 1, hysteresis: 0 }).inBar).toBe(2);
    expect(fit({ ...TWO, available: 240, previous: 1, hysteresis: 40 }).inBar).toBe(1);
    expect(fit({ ...TWO, available: 248, previous: 1, hysteresis: 40 }).inBar).toBe(2);
  });

  it('applies the deadband on the compact ladder too', () => {
    const COMPACT = { widths: [100, 100, 100], compactWidths: [80, 80, 80] } as const;
    expect(fit({ ...COMPACT, available: 226, previous: 2 })).toEqual({ inBar: 2, compact: true });
    expect(fit({ ...COMPACT, available: 226, previous: 1 })).toEqual({ inBar: 1, compact: true });
    expect(fit({ ...COMPACT, available: 234, previous: 1 })).toEqual({ inBar: 2, compact: true });
  });
});

describe('degenerate input', () => {
  it('handles an empty action list', () => {
    expect(fit({ available: 500 })).toEqual({ inBar: 0, compact: false });
  });

  it.each([{ available: 0 }, { available: -500 }, { available: Number.NaN }])(
    'floors at pinned for an available width of $available',
    ({ available }) => {
      expect(fit({ ...THREE, available, pinned: 1 })).toEqual({ inBar: 1, compact: true });
    },
  );

  it('clamps a pinned count larger than the action list', () => {
    expect(fit({ widths: [100, 100], compactWidths: [100, 100], available: 0, pinned: 5 })).toEqual(
      { inBar: 2, compact: false },
    );
  });

  it('falls back to the natural width where a compact width is missing', () => {
    expect(fit({ widths: [100, 100, 100], compactWidths: [], available: 250 })).toEqual({
      inBar: 1,
      compact: true,
    });
    expect(fit({ widths: [100, 100, 100], compactWidths: [80], available: 250 })).toEqual({
      inBar: 2,
      compact: true,
    });
  });

  it('treats unmeasurable widths as zero rather than throwing', () => {
    expect(
      fit({
        widths: [Number.NaN, Number.POSITIVE_INFINITY, 100],
        compactWidths: [Number.NaN, Number.POSITIVE_INFINITY, 100],
        available: 250,
      }),
    ).toEqual({ inBar: 3, compact: false });
  });

  it('does not let a negative width pay for its neighbours', () => {
    expect(
      fit({ widths: [-40, 100, 100], compactWidths: [-40, 100, 100], available: 180 }),
    ).toEqual({ inBar: 2, compact: true });
  });

  it('survives a nonsensical gap, cluster width and previous split', () => {
    expect(() =>
      fit({
        ...THREE,
        available: 300,
        gap: Number.NaN,
        overflowWidth: Number.NaN,
        previous: Number.NaN,
      }),
    ).not.toThrow();
    expect(
      fit({
        ...THREE,
        available: 300,
        gap: Number.NaN,
        overflowWidth: Number.NaN,
        previous: Number.NaN,
      }),
    ).toEqual({ inBar: 3, compact: false });
  });
});
