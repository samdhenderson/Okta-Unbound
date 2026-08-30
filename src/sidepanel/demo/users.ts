import type { OktaUser, UserStatus } from '../../shared/types';
import {
  DEMO_ORG_NAME,
  FIRST_NAMES,
  LAST_NAMES,
  LOCATIONS,
  SeededRandom,
  fakeId,
  isoDaysAgo,
  pickDepartment,
} from './org';

export const DEMO_USER_COUNT = 250;

const STATUS_WEIGHTS: readonly { status: UserStatus; weight: number }[] = [
  { status: 'ACTIVE', weight: 82 },
  { status: 'SUSPENDED', weight: 5 },
  { status: 'DEPROVISIONED', weight: 6 },
  { status: 'STAGED', weight: 3 },
  { status: 'PROVISIONED', weight: 2 },
  { status: 'LOCKED_OUT', weight: 1 },
  { status: 'PASSWORD_EXPIRED', weight: 1 },
];

function pickStatus(rng: SeededRandom): UserStatus {
  const total = STATUS_WEIGHTS.reduce((sum, s) => sum + s.weight, 0);
  let roll = rng.next() * total;
  for (const entry of STATUS_WEIGHTS) {
    roll -= entry.weight;
    if (roll <= 0) return entry.status;
  }
  return 'ACTIVE';
}

function loginSlug(first: string, last: string): string {
  return `${first}.${last}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z.]/g, '');
}

function buildUsers(): OktaUser[] {
  const rng = new SeededRandom(20260826);
  const seenLogins = new Map<string, number>();
  const users: OktaUser[] = [];

  for (let i = 0; i < DEMO_USER_COUNT; i += 1) {
    const firstName = rng.pick(FIRST_NAMES);
    const lastName = rng.pick(LAST_NAMES);
    const department = pickDepartment(rng);
    const title = rng.pick(department.titles);
    const location = rng.pick(LOCATIONS);
    const status = pickStatus(rng);

    const slug = loginSlug(firstName, lastName);
    const seen = (seenLogins.get(slug) ?? 0) + 1;
    seenLogins.set(slug, seen);
    const login = `${seen === 1 ? slug : `${slug}${seen}`}@example.com`;

    const employeeType =
      department.name === 'Engineering' || department.name === 'IT'
        ? rng.chance(0.18)
          ? 'CONTRACTOR'
          : rng.chance(0.09)
            ? 'INTERN'
            : 'FULL_TIME'
        : rng.chance(0.06)
          ? 'CONTRACTOR'
          : rng.chance(0.05)
            ? 'INTERN'
            : 'FULL_TIME';

    const createdDaysAgo = rng.int(30, 1400);
    const isDormant = status === 'ACTIVE' && rng.chance(0.12);

    users.push({
      id: fakeId('00u', i + 1),
      status,
      created: isoDaysAgo(createdDaysAgo),
      activated: status === 'STAGED' ? undefined : isoDaysAgo(createdDaysAgo - 1),
      lastUpdated: isoDaysAgo(rng.int(1, 120)),
      lastLogin:
        status === 'ACTIVE' || status === 'PASSWORD_EXPIRED'
          ? isoDaysAgo(isDormant ? rng.int(120, 400) : rng.int(0, 21))
          : null,
      profile: {
        login,
        email: login,
        firstName,
        lastName,
        department: department.name,
        title,
        city: location.city,
        ...(location.state ? { state: location.state } : {}),
        countryCode: location.countryCode,
        employeeType,
        userType: employeeType === 'CONTRACTOR' ? 'Contractor' : 'Employee',
        organization: DEMO_ORG_NAME,
      },
    });
  }

  return users;
}

export const demoUsers: OktaUser[] = buildUsers();

export const demoUsersById: ReadonlyMap<string, OktaUser> = new Map(
  demoUsers.map((user) => [user.id, user]),
);

export const DEMO_COMPARISON_PAIR = {
  left: fakeId('00u', 7),
  right: fakeId('00u', 19),
} as const;

const heroLeft = demoUsersById.get(DEMO_COMPARISON_PAIR.left);
if (heroLeft) {
  heroLeft.status = 'ACTIVE';
  heroLeft.profile.firstName = 'Amara';
  heroLeft.profile.lastName = 'Okonkwo';
  heroLeft.profile.login = 'amara.okonkwo@example.com';
  heroLeft.profile.email = 'amara.okonkwo@example.com';
  heroLeft.profile.department = 'Engineering';
  heroLeft.profile.title = 'Staff Engineer';
  heroLeft.profile.city = 'Seattle';
  heroLeft.profile.state = 'WA';
  heroLeft.profile.countryCode = 'US';
  heroLeft.profile.employeeType = 'FULL_TIME';
  heroLeft.profile.userType = 'Employee';
}

const heroRight = demoUsersById.get(DEMO_COMPARISON_PAIR.right);
if (heroRight) {
  heroRight.status = 'ACTIVE';
  heroRight.profile.firstName = 'Tomas';
  heroRight.profile.lastName = 'Lindqvist';
  heroRight.profile.login = 'tomas.lindqvist@example.com';
  heroRight.profile.email = 'tomas.lindqvist@example.com';
  heroRight.profile.department = 'Engineering';
  heroRight.profile.title = 'Senior Software Engineer';
  heroRight.profile.city = 'Berlin';
  delete heroRight.profile.state;
  heroRight.profile.countryCode = 'DE';
  heroRight.profile.employeeType = 'CONTRACTOR';
  heroRight.profile.userType = 'Contractor';
}

export const DEMO_ONBOARDING_USER = fakeId('00u', 31);

const heroOnboarding = demoUsersById.get(DEMO_ONBOARDING_USER);
if (heroOnboarding) {
  heroOnboarding.status = 'ACTIVE';
  heroOnboarding.profile.firstName = 'Priya';
  heroOnboarding.profile.lastName = 'Achterberg';
  heroOnboarding.profile.login = 'priya.achterberg@example.com';
  heroOnboarding.profile.email = 'priya.achterberg@example.com';
  heroOnboarding.profile.department = 'Enginering';
  heroOnboarding.profile.title = 'Software Engineer';
  heroOnboarding.profile.city = 'Seattle';
  heroOnboarding.profile.state = 'WA';
  heroOnboarding.profile.countryCode = 'US';
  heroOnboarding.profile.employeeType = 'FULL_TIME';
  heroOnboarding.profile.userType = 'Employee';
  heroOnboarding.created = isoDaysAgo(3);
  heroOnboarding.activated = isoDaysAgo(2);
  heroOnboarding.lastLogin = isoDaysAgo(1);
}
