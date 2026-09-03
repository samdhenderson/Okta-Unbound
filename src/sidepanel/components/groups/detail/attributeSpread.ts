import { CHART_TAIL_HATCH, INDIGO_RAMP } from '../../../theme/chartPalette';
import { NONE_VALUE, OTHER_VALUE, type BreakdownRow } from '../../members/memberAnalytics';

const RAMP_FALLBACK = 'var(--color-primary)';

export interface SpreadSegment {
  row: BreakdownRow;
  background: string;
  isTail: boolean;
}

export function spreadSegments(rows: readonly BreakdownRow[]): SpreadSegment[] {
  const segments: SpreadSegment[] = [];
  let rampIndex = 0;
  for (const row of rows) {
    if (row.count <= 0 || row.value === NONE_VALUE) continue;
    if (row.value === OTHER_VALUE) {
      segments.push({ row, background: CHART_TAIL_HATCH, isTail: true });
      continue;
    }
    const stop = INDIGO_RAMP[Math.min(rampIndex, INDIGO_RAMP.length - 1)];
    rampIndex += 1;
    segments.push({ row, background: stop ?? RAMP_FALLBACK, isTail: false });
  }
  return segments;
}
