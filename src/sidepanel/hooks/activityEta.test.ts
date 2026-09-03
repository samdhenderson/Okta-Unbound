import { describe, it, expect } from 'vitest';
import { estimateEta, longestArmedGateMs, MIN_SAMPLES } from './activityEta';

describe('estimateEta', () => {
  it('is a point estimate when throughput is known and nothing is gated', () => {
    const eta = estimateEta({ done: 10, total: 20, elapsedMs: 20_000, longestGateMs: 0 });

    expect(eta.kind).toBe('point');
    expect(eta.label).toBe('~0:20 left');
  });

  it('widens the upper bound by a cooldown the scheduler already knows about', () => {
    const eta = estimateEta({ done: 10, total: 20, elapsedMs: 20_000, longestGateMs: 90_000 });

    expect(eta).toMatchObject({ kind: 'range', lowerMs: 20_000, upperMs: 110_000 });
    expect(eta.label).toBe('0:20–1:50 left');
  });

  it('does not know before it has a throughput sample, and says so in words', () => {
    const eta = estimateEta({
      done: MIN_SAMPLES - 1,
      total: 500,
      elapsedMs: 4_000,
      longestGateMs: 0,
    });

    expect(eta.kind).toBe('unknown');
    expect(eta.label).not.toMatch(/\d/);
  });

  it('does not know before any time has elapsed, however many items report done', () => {
    const eta = estimateEta({ done: 50, total: 500, elapsedMs: 0, longestGateMs: 0 });

    expect(eta.kind).toBe('unknown');
    expect(eta.label).not.toMatch(/\d/);
  });

  it('does not know when a gate is armed but throughput is not measured yet', () => {
    const eta = estimateEta({ done: 1, total: 500, elapsedMs: 3_000, longestGateMs: 120_000 });

    expect(eta.kind).toBe('unknown');
    expect(eta.label).not.toMatch(/\d/);
  });

  it('does not know once nothing is left to do', () => {
    expect(estimateEta({ done: 20, total: 20, elapsedMs: 40_000, longestGateMs: 0 }).kind).toBe(
      'unknown',
    );
  });
});

describe('longestArmedGateMs', () => {
  const NOW = 1_760_000_000_000;

  it('is zero when nothing is gated', () => {
    expect(longestArmedGateMs([null, null], 0, NOW)).toBe(0);
  });

  it('takes the widest gate, not the sum — gates elapse concurrently', () => {
    expect(longestArmedGateMs([NOW + 30_000, NOW + 90_000, null], 0, NOW)).toBe(90_000);
  });

  it('includes the scheduler-wide cooldown alongside the per-bucket gates', () => {
    expect(longestArmedGateMs([NOW + 10_000], 45_000, NOW)).toBe(45_000);
  });

  it('ignores a gate that has already lifted rather than going negative', () => {
    expect(longestArmedGateMs([NOW - 5_000], 0, NOW)).toBe(0);
  });
});
