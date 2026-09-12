import type { OktaUser, MemberMfaResult } from '../../../shared/types';

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

export const RESERVED_DIMENSIONS = new Set<string>(['mfa', 'status', 'source']);

export const SOURCE_DIMENSION = 'source';

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
  driftValues?: readonly string[];
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
      if (EXCLUDED_ATTRIBUTES.has(key) || RESERVED_DIMENSIONS.has(key)) continue;
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
      driftValues: nearDuplicateValues(map.keys()),
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
  if (value === 'single') return result.factorCount === 1;
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

export interface MfaEnrollmentSummary {
  scanned: number;
  total: number;
  rows: BreakdownRow[];
}

export function computeMfaEnrollment(
  members: OktaUser[],
  mfaResults: Map<string, MemberMfaResult> | null,
): MfaEnrollmentSummary | null {
  if (!mfaResults) return null;

  let none = 0;
  let single = 0;
  let multiple = 0;
  let scanned = 0;

  for (const member of members) {
    const result = mfaResults.get(member.id);
    if (!result) continue;
    scanned++;
    if (result.factorCount === 0) none++;
    else if (result.factorCount === 1) single++;
    else multiple++;
  }

  const pct = (n: number) => (scanned > 0 ? (n / scanned) * 100 : 0);

  return {
    scanned,
    total: members.length,
    rows: [
      { value: 'none', label: 'No factors enrolled', count: none, pct: pct(none) },
      { value: 'single', label: 'One factor', count: single, pct: pct(single) },
      { value: 'multiple', label: 'Two or more factors', count: multiple, pct: pct(multiple) },
    ],
  };
}

export type MfaSignalKind = 'unprotected' | 'single-factor' | 'partial-scan';

export interface MfaSignal {
  kind: MfaSignalKind;
  label: string;
  description: string;
}

export function mfaSignals(summary: MfaEnrollmentSummary): MfaSignal[] {
  const signals: MfaSignal[] = [];
  const none = summary.rows.find((row) => row.value === 'none')?.count ?? 0;
  const single = summary.rows.find((row) => row.value === 'single')?.count ?? 0;

  if (none > 0) {
    signals.push({
      kind: 'unprotected',
      label: `${none.toLocaleString()} with no factor`,
      description: `${none.toLocaleString()} of the ${summary.scanned.toLocaleString()} members scanned have no active MFA factor enrolled, so a password is all that stands in front of their account.`,
    });
  }

  if (single > 0) {
    signals.push({
      kind: 'single-factor',
      label: `${single.toLocaleString()} on a single factor`,
      description: `${single.toLocaleString()} members hold exactly one active factor. Losing it locks them out; phishing it gets past them.`,
    });
  }

  if (summary.scanned < summary.total) {
    signals.push({
      kind: 'partial-scan',
      label: `${summary.scanned.toLocaleString()} of ${summary.total.toLocaleString()} scanned`,
      description: `Every figure on this card is over the ${summary.scanned.toLocaleString()} members the scan reached, not the full roster. Rescan to cover the rest.`,
    });
  }

  return signals;
}

export function computeMfaFactorTypes(
  members: OktaUser[],
  mfaResults: Map<string, MemberMfaResult> | null,
): BreakdownRow[] | null {
  if (!mfaResults) return null;

  let scanned = 0;
  const labelCounts = new Map<string, number>();

  for (const member of members) {
    const result = mfaResults.get(member.id);
    if (!result) continue;
    scanned++;
    for (const label of result.factorLabels) {
      labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
    }
  }

  return Array.from(labelCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({
      value: `has:${label}`,
      label,
      count,
      pct: scanned > 0 ? (count / scanned) * 100 : 0,
    }));
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
  sourceBuckets?: ReadonlyMap<string, ReadonlySet<string>> | null,
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
      if (dimension === SOURCE_DIMENSION) {
        if (!sourceBuckets) return false;
        const inAny = Array.from(values).some((value) => sourceBuckets.get(value)?.has(member.id));
        if (!inAny) return false;
      } else if (dimension === 'mfa') {
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

export const OUTLIER_DOMINANT_SHARE = 60;

export const OUTLIER_MAX_SHARE = 10;

export function outlierValues(summary: AttributeSummary): string[] {
  const real = summary.rows.filter((row) => row.value !== NONE_VALUE && row.value !== OTHER_VALUE);
  if (real.length < 2) return [];

  const populated = summary.populated;
  if (populated === 0) return [];

  const shareOf = (count: number): number => (count / populated) * 100;
  let dominant = real[0];
  for (const row of real) if (dominant && row.count > dominant.count) dominant = row;
  if (!dominant || shareOf(dominant.count) < OUTLIER_DOMINANT_SHARE) return [];

  return real
    .filter((row) => row !== dominant && shareOf(row.count) <= OUTLIER_MAX_SHARE)
    .map((row) => row.value);
}

export const DRIFT_WEIGHT = 4;

export const TAIL_WEIGHT = 2;

export const RULE_WEIGHT = 1;

export const TAIL_SHARE_THRESHOLD = 20;

export function normalizeAttributeValue(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function nearDuplicateValues(labels: Iterable<string>): string[] {
  const groups = new Map<string, string[]>();
  for (const label of labels) {
    const key = normalizeAttributeValue(label);
    if (key === '') continue;
    const group = groups.get(key);
    if (!group) {
      groups.set(key, [label]);
    } else if (!group.includes(label)) {
      group.push(label);
    }
  }

  const collisions: string[] = [];
  for (const group of groups.values()) {
    if (group.length > 1) collisions.push(...group);
  }
  return collisions;
}

export type AttributeSignalKind = 'drift' | 'tail' | 'rule';

export interface AttributeSignal {
  kind: AttributeSignalKind;
  weight: number;
  label: string;
  description: string;
}

export function attributeTailCount(summary: AttributeSummary): number {
  return summary.rows.find((row) => row.value === OTHER_VALUE)?.count ?? 0;
}

export function attributeDriftValues(summary: AttributeSummary): string[] {
  if (summary.driftValues) return [...summary.driftValues];
  return nearDuplicateValues(
    summary.rows
      .filter((row) => row.value !== NONE_VALUE && row.value !== OTHER_VALUE)
      .map((row) => row.label),
  );
}

export function attributeSignals(summary: AttributeSummary, ruleCount: number): AttributeSignal[] {
  const signals: AttributeSignal[] = [];

  const drift = attributeDriftValues(summary);
  if (drift.length > 1) {
    signals.push({
      kind: 'drift',
      weight: DRIFT_WEIGHT,
      label: `${drift.length} near-duplicate values`,
      description: `${drift.join(', ')} — these differ only in case or spacing, so they are almost certainly one value entered more than one way.`,
    });
  }

  const tailCount = attributeTailCount(summary);
  const tailShare = summary.total > 0 ? (tailCount / summary.total) * 100 : 0;
  if (tailShare >= TAIL_SHARE_THRESHOLD) {
    signals.push({
      kind: 'tail',
      weight: TAIL_WEIGHT,
      label: `${Math.round(tailShare)}% hidden in the tail`,
      description: `${tailCount.toLocaleString()} of ${summary.total.toLocaleString()} members hold a value this card does not name. Open it to see them.`,
    });
  }

  if (ruleCount > 0) {
    signals.push({
      kind: 'rule',
      weight: RULE_WEIGHT,
      label: ruleCount === 1 ? 'A rule depends on it' : `${ruleCount} rules depend on it`,
      description: 'A feeding rule reads this attribute, so how it is spelled grants access today.',
    });
  }

  return signals;
}

export interface RankedAttribute {
  summary: AttributeSummary;
  signals: AttributeSignal[];
  score: number;
  flagged: boolean;
}

export function rankAttributes(
  summaries: readonly AttributeSummary[],
  ruleCountFor: (key: string) => number,
): RankedAttribute[] {
  const ranked = summaries.map((summary) => {
    const signals = attributeSignals(summary, ruleCountFor(summary.key));
    const score = signals.reduce((sum, signal) => sum + signal.weight, 0);
    return { summary, signals, score, flagged: score > 0 };
  });
  return ranked.sort((a, b) => b.score - a.score);
}
