import { MFA_ENROLLMENT_PAINT } from '../../../theme/chartPalette';
import type { BreakdownRow } from '../../members/memberAnalytics';
import type { SpreadSegment } from './attributeSpread';

const UNKNOWN_BUCKET = 'var(--color-neutral-300)';

export function mfaEnrollmentSegments(rows: readonly BreakdownRow[]): SpreadSegment[] {
  const segments: SpreadSegment[] = [];
  for (const row of rows) {
    if (row.count <= 0) continue;
    segments.push({
      row,
      background: MFA_ENROLLMENT_PAINT[row.value] ?? UNKNOWN_BUCKET,
      isTail: false,
    });
  }
  return segments;
}
