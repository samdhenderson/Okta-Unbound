import { describe, it, expect } from 'vitest';
import { userStatusVariant } from './status';

describe('userStatusVariant', () => {
  it.each([
    ['ACTIVE', 'success'],
    ['PROVISIONED', 'info'],
    ['STAGED', 'neutral'],
    ['SUSPENDED', 'warning'],
    ['RECOVERY', 'info'],
    ['PASSWORD_EXPIRED', 'warning'],
    ['LOCKED_OUT', 'danger'],
    ['DEPROVISIONED', 'danger'],
  ] as const)('maps %s to %s', (status, variant) => {
    expect(userStatusVariant(status)).toBe(variant);
  });

  it('falls back to neutral for an unknown status', () => {
    expect(userStatusVariant('SOMETHING_NEW')).toBe('neutral');
    expect(userStatusVariant('')).toBe('neutral');
  });

  it('never returns the banned "error" vocabulary (ADR-0002)', () => {
    const statuses = [
      'ACTIVE',
      'PROVISIONED',
      'STAGED',
      'SUSPENDED',
      'RECOVERY',
      'PASSWORD_EXPIRED',
      'LOCKED_OUT',
      'DEPROVISIONED',
      'UNKNOWN',
    ];
    for (const status of statuses) {
      expect(userStatusVariant(status)).not.toBe('error');
    }
  });
});
