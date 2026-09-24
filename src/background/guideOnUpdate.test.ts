import { describe, it, expect } from 'vitest';
import { crossesMinorVersion } from './guideOnUpdate';

describe('crossesMinorVersion', () => {
  it('is true for a minor bump', () => {
    expect(crossesMinorVersion('1.2.0', '1.3.0')).toBe(true);
  });

  it('is true for a major bump', () => {
    expect(crossesMinorVersion('1.9.4', '2.0.0')).toBe(true);
  });

  it('is false for a patch bump', () => {
    expect(crossesMinorVersion('1.2.0', '1.2.1')).toBe(false);
  });

  it('is false when the version has not changed', () => {
    expect(crossesMinorVersion('1.2.0', '1.2.0')).toBe(false);
  });

  it('is false when there is no previous version', () => {
    expect(crossesMinorVersion(undefined, '1.3.0')).toBe(false);
    expect(crossesMinorVersion('', '1.3.0')).toBe(false);
  });

  it('is false when a version cannot be parsed', () => {
    expect(crossesMinorVersion('unknown', '1.3.0')).toBe(false);
    expect(crossesMinorVersion('1.2.0', 'dev')).toBe(false);
  });
});
