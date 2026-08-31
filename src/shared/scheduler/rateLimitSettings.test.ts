import { describe, it, expect } from 'vitest';
import {
  WARNING_THRESHOLD_ENDPOINT,
  WARNING_THRESHOLD_MARGIN,
  minRemainingFromWarningThreshold,
  parseWarningThreshold,
} from './rateLimitSettings';

describe('WARNING_THRESHOLD_ENDPOINT', () => {
  it('is a same-origin GET path the background message guard will accept', () => {
    expect(WARNING_THRESHOLD_ENDPOINT).toBe('/api/v1/rate-limit-settings/warning-threshold');
    expect(WARNING_THRESHOLD_ENDPOINT.startsWith('/')).toBe(true);
    expect(WARNING_THRESHOLD_ENDPOINT.startsWith('//')).toBe(false);
  });
});

describe('minRemainingFromWarningThreshold', () => {
  it.each([
    [90, 15],
    [60, 45],
    [100, 5],
    [50, 55],
  ])('turns a consumed threshold of %i into %i%% remaining', (threshold, remaining) => {
    expect(minRemainingFromWarningThreshold(threshold)).toBe(remaining);
  });

  it('backs off by the margin in percentage points, not proportionally', () => {
    expect(WARNING_THRESHOLD_MARGIN).toBe(5);
    expect(minRemainingFromWarningThreshold(90)).toBe(15);
    expect(minRemainingFromWarningThreshold(60)).toBe(45);
    expect(minRemainingFromWarningThreshold(90) - (100 - 90)).toBe(WARNING_THRESHOLD_MARGIN);
    expect(minRemainingFromWarningThreshold(60) - (100 - 60)).toBe(WARNING_THRESHOLD_MARGIN);
  });

  it('is always more conservative than the org would be', () => {
    for (const threshold of [10, 45, 60, 90, 100]) {
      expect(minRemainingFromWarningThreshold(threshold)).toBeGreaterThan(100 - threshold);
    }
  });
});

describe('parseWarningThreshold', () => {
  it('reads the field out of a well-formed body', () => {
    expect(parseWarningThreshold({ warningThreshold: 90 })).toBe(90);
  });

  it('tolerates extra keys Okta may add', () => {
    expect(parseWarningThreshold({ warningThreshold: 60, _links: { self: {} } })).toBe(60);
  });

  it.each([
    ['a missing field', {}],
    ['a null value', { warningThreshold: null }],
    ['a string value', { warningThreshold: '90' }],
    ['a non-object body', 'warningThreshold=90'],
    ['null', null],
    ['undefined', undefined],
    ['an array', [{ warningThreshold: 90 }]],
  ])('returns null for %s', (_name, body) => {
    expect(parseWarningThreshold(body)).toBeNull();
  });

  it.each([
    ['below the plausible floor', 9],
    ['zero', 0],
    ['negative', -10],
    ['above 100', 101],
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
  ])('returns null for a value %s (%s), rather than clamping it', (_name, value) => {
    expect(parseWarningThreshold({ warningThreshold: value })).toBeNull();
  });

  it('accepts the exact band boundaries', () => {
    expect(parseWarningThreshold({ warningThreshold: 10 })).toBe(10);
    expect(parseWarningThreshold({ warningThreshold: 100 })).toBe(100);
  });
});
