import { resolveCount, type CountInput, type OrgFigureStatus } from './orgFigures';
import type { GroupFinding } from '../groups/ruleOrphans';

export const REPORT_PREVIEW_LIMIT = 25;

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
}

export function buildReport({ key, label, findings, caveat, ...counts }: ReportInput): HomeReport {
  const resolved = resolveCount({ ...counts, count: findings.length });
  return {
    key,
    label,
    ...resolved,
    findings: resolved.value === null ? [] : findings.slice(0, REPORT_PREVIEW_LIMIT),
    caveat,
  };
}
