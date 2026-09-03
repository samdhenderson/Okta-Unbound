import type { OktaUser } from '../../shared/types';
import { EMEA_COUNTRIES, SeededRandom, fakeId } from './org';
import { currentUsers, demoRevision } from './state';
import { demoUsers } from './users';

export const GROUP = {
  everyone: 1,
  engineering: 2,
  sales: 3,
  customerSuccess: 4,
  marketing: 5,
  finance: 6,
  peopleOps: 7,
  it: 8,
  security: 9,
  data: 10,
  legal: 11,
  awsProdAdmin: 12,
  awsProdReadOnly: 13,
  vpnUsers: 14,
  contractorsEmea: 15,
  contractorsAmer: 16,
  oktaAdministrators: 17,
  onCallEngineering: 18,
  releaseManagers: 19,
  incidentResponse: 20,
  interns: 21,
  dormant: 22,
  executiveStaff: 23,
  londonOffice: 24,
  berlinOffice: 25,
  seattleOffice: 26,
  austinOffice: 27,
  sydneyOffice: 28,
  salesforceSalesUsers: 29,
  salesforceAdmins: 30,
  workdayAllWorkers: 31,
  githubEngineering: 32,
  zoomLicensed: 33,
  datadogEngineering: 34,
  migrationAccess: 35,
  salesEmeaLegacy: 36,
  verifyRollout: 37,
} as const;

const DEPARTMENT_GROUPS: readonly { ordinal: number; department: string }[] = [
  { ordinal: GROUP.engineering, department: 'Engineering' },
  { ordinal: GROUP.sales, department: 'Sales' },
  { ordinal: GROUP.customerSuccess, department: 'Customer Success' },
  { ordinal: GROUP.marketing, department: 'Marketing' },
  { ordinal: GROUP.finance, department: 'Finance' },
  { ordinal: GROUP.peopleOps, department: 'People Ops' },
  { ordinal: GROUP.it, department: 'IT' },
  { ordinal: GROUP.security, department: 'Security' },
  { ordinal: GROUP.data, department: 'Data' },
  { ordinal: GROUP.legal, department: 'Legal' },
];

const OFFICE_GROUPS: readonly { ordinal: number; city: string }[] = [
  { ordinal: GROUP.londonOffice, city: 'London' },
  { ordinal: GROUP.berlinOffice, city: 'Berlin' },
  { ordinal: GROUP.seattleOffice, city: 'Seattle' },
  { ordinal: GROUP.austinOffice, city: 'Austin' },
  { ordinal: GROUP.sydneyOffice, city: 'Sydney' },
];

const attr = (user: OktaUser, key: string): string => String(user.profile[key] ?? '');

type RuleFedGroup = {
  ordinal: number;
  predicate: (user: OktaUser) => boolean;
  expression: string | null;
  exemption?: string;
};

const RULE_FED: readonly RuleFedGroup[] = [
  ...DEPARTMENT_GROUPS.map(({ ordinal, department }) => ({
    ordinal,
    predicate: (user: OktaUser) => attr(user, 'department') === department,
    expression: `user.department == "${department}"`,
  })),
  ...OFFICE_GROUPS.map(({ ordinal, city }) => ({
    ordinal,
    predicate: (user: OktaUser) => attr(user, 'city') === city,
    expression: `user.city == "${city}"`,
  })),
  {
    ordinal: GROUP.vpnUsers,
    predicate: (user) => user.status === 'ACTIVE',
    expression: 'user.status == "ACTIVE"',
  },
  {
    ordinal: GROUP.contractorsEmea,
    predicate: (user) =>
      attr(user, 'employeeType') === 'CONTRACTOR' &&
      EMEA_COUNTRIES.includes(attr(user, 'countryCode')),
    expression:
      'user.employeeType == "CONTRACTOR" && (user.countryCode == "GB" || user.countryCode == "DE" || user.countryCode == "IE")',
  },
  {
    ordinal: GROUP.contractorsAmer,
    predicate: (user) =>
      attr(user, 'employeeType') === 'CONTRACTOR' &&
      ['US', 'CA'].includes(attr(user, 'countryCode')),
    expression:
      'user.employeeType == "CONTRACTOR" && (user.countryCode == "US" || user.countryCode == "CA")',
  },
  {
    ordinal: GROUP.interns,
    predicate: (user) => attr(user, 'employeeType') === 'INTERN',
    expression:
      'user.employeeType == "INTERN" && String.stringContains(user.organization, "Northwind")',
  },
  {
    ordinal: GROUP.githubEngineering,
    predicate: (user) =>
      attr(user, 'department') === 'Engineering' && attr(user, 'employeeType') !== 'CONTRACTOR',
    expression: 'user.department == "Engineering" && user.employeeType != "CONTRACTOR"',
  },
  {
    ordinal: GROUP.everyone,
    predicate: () => true,
    expression: null,
    exemption:
      'Okta maintains the built-in Everyone group itself and rejects a group rule that targets it; declaring one would misstate the platform.',
  },
  {
    ordinal: GROUP.workdayAllWorkers,
    predicate: (user) => user.status !== 'STAGED' && user.status !== 'DEPROVISIONED',
    expression: null,
    exemption:
      'Sourced from the Workday HR import, which fills it on every sync. The invisible maintainer is the point: to the panel it is indistinguishable from an unmaintained group.',
  },
  {
    ordinal: GROUP.datadogEngineering,
    predicate: (user) => attr(user, 'department') === 'Engineering',
    expression: 'user.department == "Engineering"',
  },
];

export const RULE_FED_GROUPS: readonly RuleFedGroup[] = RULE_FED;

const HAND_MANAGED: readonly {
  ordinal: number;
  size: number;
  eligible: (user: OktaUser) => boolean;
}[] = [
  {
    ordinal: GROUP.awsProdAdmin,
    size: 8,
    eligible: (u) => ['Engineering', 'IT', 'Security'].includes(attr(u, 'department')),
  },
  {
    ordinal: GROUP.awsProdReadOnly,
    size: 41,
    eligible: (u) => ['Engineering', 'IT', 'Security', 'Data'].includes(attr(u, 'department')),
  },
  {
    ordinal: GROUP.oktaAdministrators,
    size: 6,
    eligible: (u) => ['IT', 'Security'].includes(attr(u, 'department')),
  },
  {
    ordinal: GROUP.onCallEngineering,
    size: 22,
    eligible: (u) => attr(u, 'department') === 'Engineering' && u.status === 'ACTIVE',
  },
  {
    ordinal: GROUP.releaseManagers,
    size: 9,
    eligible: (u) => attr(u, 'department') === 'Engineering',
  },
  {
    ordinal: GROUP.incidentResponse,
    size: 7,
    eligible: (u) => ['Security', 'Engineering'].includes(attr(u, 'department')),
  },
  {
    ordinal: GROUP.executiveStaff,
    size: 11,
    eligible: (u) => /Manager|Director|Controller|Counsel|Principal/.test(attr(u, 'title')),
  },
  {
    ordinal: GROUP.salesforceSalesUsers,
    size: 47,
    eligible: (u) => ['Sales', 'Customer Success', 'Marketing'].includes(attr(u, 'department')),
  },
  {
    ordinal: GROUP.salesforceAdmins,
    size: 5,
    eligible: (u) => attr(u, 'department') === 'Sales',
  },
  {
    ordinal: GROUP.zoomLicensed,
    size: 168,
    eligible: (u) => u.status === 'ACTIVE',
  },
  {
    ordinal: GROUP.dormant,
    size: 29,
    eligible: (u) => {
      if (!u.lastLogin) return false;
      const days = (Date.parse('2026-08-01T09:00:00.000Z') - Date.parse(u.lastLogin)) / 86_400_000;
      return days > 120;
    },
  },
];

let handManaged: ReadonlyMap<string, readonly string[]> | null = null;

function sampleHandManaged(): ReadonlyMap<string, readonly string[]> {
  if (handManaged) return handManaged;
  const byGroup = new Map<string, readonly string[]>();
  const rng = new SeededRandom(778899);
  for (const { ordinal, size, eligible } of HAND_MANAGED) {
    const pool = demoUsers.filter(eligible);
    const chosen: string[] = [];
    const taken = new Set<number>();
    const target = Math.min(size, pool.length);
    let guard = 0;
    while (chosen.length < target && guard < target * 40) {
      guard += 1;
      const index = rng.int(0, pool.length - 1);
      if (taken.has(index)) continue;
      const candidate = pool[index];
      if (!candidate) continue;
      taken.add(index);
      chosen.push(candidate.id);
    }
    byGroup.set(fakeId('00g', ordinal), chosen);
  }
  handManaged = byGroup;
  return handManaged;
}

let memoRevision = -1;
let memoByGroup: ReadonlyMap<string, readonly string[]> = new Map();
let memoByUser: ReadonlyMap<string, readonly string[]> = new Map();

function derive(): void {
  const revision = demoRevision();
  if (memoRevision === revision) return;

  const users = currentUsers();
  const byGroup = new Map<string, readonly string[]>(sampleHandManaged());

  for (const { ordinal, predicate } of RULE_FED) {
    byGroup.set(
      fakeId('00g', ordinal),
      users.filter(predicate).map((u) => u.id),
    );
  }

  const byUser = new Map<string, string[]>();
  for (const [groupId, memberIds] of byGroup) {
    for (const userId of memberIds) {
      const existing = byUser.get(userId);
      if (existing) existing.push(groupId);
      else byUser.set(userId, [groupId]);
    }
  }

  memoByGroup = byGroup;
  memoByUser = byUser;
  memoRevision = revision;
}

export function demoGroupMembers(): ReadonlyMap<string, readonly string[]> {
  derive();
  return memoByGroup;
}

export function demoUserGroups(): ReadonlyMap<string, readonly string[]> {
  derive();
  return memoByUser;
}
