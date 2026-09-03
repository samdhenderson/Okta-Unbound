import {
  resolveCount,
  type CountInput,
  type CountResolution,
  type OrgFigureStatus,
} from './orgFigures';
import type { GroupFinding } from '../groups/ruleOrphans';

export const REPORT_PREVIEW_LIMIT = 25;

export const MFA_SCAN_CAVEAT =
  'This one is not free. Coverage is a factor read per member, so picking a group opens that ' +
  'group and arms the scan there — nothing is read until you start it.';

export const MFA_UNAVAILABLE_NOTE =
  'Groups have not been read yet, so there is nothing to choose from. Refresh the org snapshot ' +
  'above, then come back.';

export const MFA_PARTIAL_NOTE =
  'The last group read did not finish, so a group missing from this list may simply be unread.';

export interface HomeReport {
  key: string;
  label: string;
  status: OrgFigureStatus;
  value: number | null;
  note?: string;
  findings: GroupFinding[];
  caveat: string;
}

export interface ReportInput extends Omit<CountInput, 'count'> {
  key: string;
  label: string;
  findings: GroupFinding[];
  caveat: string;
  suppressed?: string;
}

export function resolveReportCount(counts: CountInput, suppressed?: string): CountResolution {
  const resolved = resolveCount(counts);
  const blocked =
    suppressed !== undefined && (resolved.status === 'ok' || resolved.status === 'partial');
  return blocked ? { status: 'unavailable', value: null, note: suppressed } : resolved;
}

export function buildReport({
  key,
  label,
  findings,
  caveat,
  suppressed,
  ...counts
}: ReportInput): HomeReport {
  const resolved = resolveReportCount({ ...counts, count: findings.length }, suppressed);
  return {
    key,
    label,
    status: resolved.status,
    value: resolved.value,
    note: resolved.note,
    findings: resolved.value === null ? [] : findings.slice(0, REPORT_PREVIEW_LIMIT),
    caveat,
  };
}
