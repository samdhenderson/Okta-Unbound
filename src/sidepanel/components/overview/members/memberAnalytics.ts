import type { OktaUser, MemberMfaResult } from '../../../../shared/types';

export type Dimension = string;

export type ProfileDimension = string;

export const PROFILE_DIMENSIONS: ProfileDimension[] = [
  'status',
  'department',
  'title',
  'manager',
  'city',
  'state',
  'countryCode',
];

export type SortField = 'name' | 'status' | 'factors';

export const DIMENSION_TITLES: Record<string, string> = {
  status: 'Status',
  department: 'Department',
  title: 'Title',
  manager: 'Manager',
  city: 'City',
  state: 'State / Region',
  countryCode: 'Country',
  zipCode: 'Zip / Postal code',
  costCenter: 'Cost center',
  userType: 'User type',
  employeeType: 'Employee type',
  division: 'Division',
  organization: 'Organization',
  locale: 'Locale',
  timezone: 'Timezone',
  preferredLanguage: 'Preferred language',
};

export const EXCLUDED_ATTRIBUTES = new Set<string>([
  'login',
  'email',
  'secondEmail',
  'firstName',
  'lastName',
  'middleName',
  'displayName',
  'nickName',
  'name',
  'honorificPrefix',
  'honorificSuffix',
  'mobilePhone',
  'primaryPhone',
  'streetAddress',
  'postalAddress',
  'profileUrl',
  'employeeNumber',
  'managerId',
  'id',
]);

const PREFERRED_ATTRIBUTE_ORDER = [
  'department',
  'title',
  'manager',
  'division',
  'organization',
  'userType',
  'employeeType',
  'costCenter',
  'city',
  'state',
  'countryCode',
];

export function humanizeAttributeKey(key: string): string {
  const spaced = key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  if (!spaced) return key;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function dimensionTitle(dim: string): string {
  return DIMENSION_TITLES[dim] ?? humanizeAttributeKey(dim);
}

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

function coerceScalar(raw: unknown): string {
  if (typeof raw === 'string') return raw.trim();
  if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw);
  return '';
}

export function getMemberDimensionValue(user: OktaUser, dim: ProfileDimension): string {
  if (dim === 'status') return user.status || '';
  return coerceScalar(user.profile?.[dim]);
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

export interface AttributeSummary {
  key: string; // profile attribute key
  label: string; // display title
  distinct: number; // count of distinct non-empty values
  populated: number; // members with a non-empty value
  total: number; // total members
  fillRate: number; // 0-100, populated / total
  rows: BreakdownRow[]; // top values (+ "Other" / "(none)") for the summary bar
}

export interface DiscoverOptions {
  maxRows?: number;
  minPopulated?: number;
  uniqueRatio?: number;
}

export function discoverAttributeBreakdowns(
  members: OktaUser[],
  options: DiscoverOptions = {},
): AttributeSummary[] {
  const { maxRows = 6, minPopulated = 10, uniqueRatio = 0.9 } = options;
  const total = members.length;

  const counts = new Map<string, Map<string, number>>();
  for (const member of members) {
    const profile = member.profile;
    if (!profile) continue;
    for (const key in profile) {
      if (EXCLUDED_ATTRIBUTES.has(key)) continue;
      const value = coerceScalar(profile[key]);
      if (value === '') continue; // never materialize keys that are only ever empty
      let map = counts.get(key);
      if (!map) {
        map = new Map();
        counts.set(key, map);
      }
      map.set(value, (map.get(value) || 0) + 1);
    }
  }

  const summaries: AttributeSummary[] = [];
  for (const [key, map] of counts) {
    const distinct = map.size;
    let populated = 0;
    for (const c of map.values()) populated += c;

    if (populated >= minPopulated && distinct >= populated * uniqueRatio) continue;

    const withMissing = new Map(map);
    const missing = total - populated;
    if (missing > 0) withMissing.set('', missing);

    summaries.push({
      key,
      label: dimensionTitle(key),
      distinct,
      populated,
      total,
      fillRate: total > 0 ? (populated / total) * 100 : 0,
      rows: mapToRows(withMissing, total, maxRows),
    });
  }

  const preferredRank = (k: string) => {
    const i = PREFERRED_ATTRIBUTE_ORDER.indexOf(k);
    return i === -1 ? Number.POSITIVE_INFINITY : i;
  };
  summaries.sort((a, b) => {
    const ra = preferredRank(a.key);
    const rb = preferredRank(b.key);
    if (ra !== rb) return ra - rb;
    if (b.fillRate !== a.fillRate) return b.fillRate - a.fillRate;
    return a.label.localeCompare(b.label);
  });

  return summaries;
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
