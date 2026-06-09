import type { OktaUser, MemberMfaResult } from '../../../../shared/types';

export type Dimension =
  'department' | 'title' | 'manager' | 'city' | 'state' | 'countryCode' | 'status' | 'mfa';

export type ProfileDimension = Exclude<Dimension, 'mfa'>;

export const PROFILE_DIMENSIONS: ProfileDimension[] = [
  'status',
  'department',
  'title',
  'manager',
  'city',
  'state',
  'countryCode',
];

export const COMPOSITION_DIMENSIONS: ProfileDimension[] = [
  'department',
  'title',
  'manager',
  'city',
  'state',
  'countryCode',
];

export type SortField = 'name' | 'status' | 'factors';

export const DIMENSION_TITLES: Record<ProfileDimension, string> = {
  status: 'Status',
  department: 'Department',
  title: 'Title',
  manager: 'Manager',
  city: 'City',
  state: 'State / Region',
  countryCode: 'Country',
};

export const NONE_VALUE = '__none__';
export const OTHER_VALUE = '__other__';

export interface BreakdownRow {
  value: string; // canonical value used for filtering (NONE_VALUE / OTHER_VALUE for sentinels)
  label: string; // display label
  count: number;
  pct: number; // 0-100 of total members
}

export interface MemberFilter {
  dimension: Dimension;
  value: string;
  label: string;
}

export function getMemberDimensionValue(user: OktaUser, dim: ProfileDimension): string {
  if (dim === 'status') return user.status || '';
  const raw = user.profile?.[dim];
  return typeof raw === 'string' ? raw.trim() : '';
}

function mapToRows(counts: Map<string, number>, total: number, maxRows: number): BreakdownRow[] {
  const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const rows: BreakdownRow[] = [];

  const head = entries.slice(0, maxRows);
  const tail = entries.slice(maxRows);

  for (const [value, count] of head) {
    rows.push({
      value: value === '' ? NONE_VALUE : value,
      label: value === '' ? '(none)' : value,
      count,
      pct: total > 0 ? (count / total) * 100 : 0,
    });
  }

  if (tail.length > 0) {
    const otherCount = tail.reduce((sum, [, c]) => sum + c, 0);
    rows.push({
      value: OTHER_VALUE,
      label: `Other (${tail.length} ${tail.length === 1 ? 'value' : 'values'})`,
      count: otherCount,
      pct: total > 0 ? (otherCount / total) * 100 : 0,
    });
  }

  return rows;
}

export function computeDimensionBreakdown(
  members: OktaUser[],
  dim: ProfileDimension,
  maxRows = Number.POSITIVE_INFINITY,
): BreakdownRow[] {
  const counts = new Map<string, number>();
  for (const member of members) {
    const value = getMemberDimensionValue(member, dim);
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return mapToRows(counts, members.length, maxRows);
}

export function computeAllBreakdowns(
  members: OktaUser[],
  maxRows = 8,
): Record<ProfileDimension, BreakdownRow[]> {
  const maps: Record<ProfileDimension, Map<string, number>> = {
    status: new Map(),
    department: new Map(),
    title: new Map(),
    manager: new Map(),
    city: new Map(),
    state: new Map(),
    countryCode: new Map(),
  };

  for (const member of members) {
    for (const dim of PROFILE_DIMENSIONS) {
      const value = getMemberDimensionValue(member, dim);
      const map = maps[dim];
      map.set(value, (map.get(value) || 0) + 1);
    }
  }

  const total = members.length;
  const result = {} as Record<ProfileDimension, BreakdownRow[]>;
  for (const dim of PROFILE_DIMENSIONS) {
    result[dim] = mapToRows(maps[dim], total, maxRows);
  }
  return result;
}

export function memberMatchesMfaValue(result: MemberMfaResult | undefined, value: string): boolean {
  if (value.startsWith('missing:')) {
    return !(result?.factorLabels.includes(value.slice(8)) ?? false);
  }
  if (!result) return false;
  if (value === 'none') return result.factorCount === 0;
  if (value === 'enrolled') return result.enrolled;
  if (value === 'multiple') return result.factorCount >= 2;
  if (value.startsWith('has:')) return result.factorLabels.includes(value.slice(4));
  return false;
}

export function computeMfaBreakdown(
  members: OktaUser[],
  mfaResults: Map<string, MemberMfaResult> | null,
): BreakdownRow[] {
  if (!mfaResults) return [];
  const total = members.length;

  let noneCount = 0;
  let multipleCount = 0;
  const labelCounts = new Map<string, number>();

  for (const member of members) {
    const result = mfaResults.get(member.id);
    if (!result) continue;
    if (result.factorCount === 0) noneCount++;
    if (result.factorCount >= 2) multipleCount++;
    for (const label of result.factorLabels) {
      labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
    }
  }

  const rows: BreakdownRow[] = [];
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  rows.push({ value: 'none', label: 'No factors enrolled', count: noneCount, pct: pct(noneCount) });
  rows.push({
    value: 'multiple',
    label: 'Multiple factors (2+)',
    count: multipleCount,
    pct: pct(multipleCount),
  });

  Array.from(labelCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([label, count]) => {
      rows.push({ value: `has:${label}`, label: `Has ${label}`, count, pct: pct(count) });
    });

  return rows;
}

export function getObservedFactorLabels(mfaResults: Map<string, MemberMfaResult> | null): string[] {
  if (!mfaResults) return [];
  const labels = new Set<string>();
  mfaResults.forEach((r) => r.factorLabels.forEach((l) => labels.add(l)));
  return Array.from(labels).sort();
}

function matchesQuery(user: OktaUser, lowerQuery: string): boolean {
  if (!lowerQuery) return true;
  const p = user.profile;
  return (
    (p.firstName || '').toLowerCase().includes(lowerQuery) ||
    (p.lastName || '').toLowerCase().includes(lowerQuery) ||
    (p.email || '').toLowerCase().includes(lowerQuery) ||
    (p.login || '').toLowerCase().includes(lowerQuery)
  );
}

export function filterMembers(
  members: OktaUser[],
  query: string,
  filters: MemberFilter[],
  mfaResults: Map<string, MemberMfaResult> | null,
): OktaUser[] {
  const lowerQuery = query.trim().toLowerCase();

  const byDimension = new Map<Dimension, Set<string>>();
  for (const f of filters) {
    let set = byDimension.get(f.dimension);
    if (!set) {
      set = new Set();
      byDimension.set(f.dimension, set);
    }
    set.add(f.value);
  }

  if (lowerQuery === '' && byDimension.size === 0) return members;

  return members.filter((member) => {
    if (!matchesQuery(member, lowerQuery)) return false;

    for (const [dimension, values] of byDimension) {
      if (dimension === 'mfa') {
        const result = mfaResults?.get(member.id);
        const ok = Array.from(values).every((v) => memberMatchesMfaValue(result, v));
        if (!ok) return false;
      } else {
        const raw = getMemberDimensionValue(member, dimension as ProfileDimension);
        const canonical = raw === '' ? NONE_VALUE : raw;
        if (!values.has(canonical)) return false;
      }
    }
    return true;
  });
}

export function memberFullName(user: OktaUser): string {
  const name = `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim();
  return name || user.profile.login || '';
}

export function sortMembers(
  members: OktaUser[],
  sortBy: SortField,
  sortDesc: boolean,
  mfaResults: Map<string, MemberMfaResult> | null,
): OktaUser[] {
  const sorted = [...members].sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case 'name':
        cmp = memberFullName(a).localeCompare(memberFullName(b));
        break;
      case 'status':
        cmp = a.status.localeCompare(b.status);
        break;
      case 'factors': {
        const fa = mfaResults?.get(a.id)?.factorCount ?? -1;
        const fb = mfaResults?.get(b.id)?.factorCount ?? -1;
        cmp = fa - fb;
        break;
      }
    }
    if (cmp === 0) cmp = memberFullName(a).localeCompare(memberFullName(b));
    return sortDesc ? -cmp : cmp;
  });
  return sorted;
}
