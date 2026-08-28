import type { OktaFactor, OktaUser } from '../../shared/types';
import { SeededRandom, fakeId } from './org';
import { demoUsers } from './users';

const FACTOR_KINDS = {
  fastpass: { factorType: 'signed_nonce', provider: 'OKTA' },
  push: { factorType: 'push', provider: 'OKTA' },
  oktaTotp: { factorType: 'token:software:totp', provider: 'OKTA' },
  googleTotp: { factorType: 'token:software:totp', provider: 'GOOGLE' },
  webauthn: { factorType: 'webauthn', provider: 'FIDO' },
  sms: { factorType: 'sms', provider: 'OKTA' },
  email: { factorType: 'email', provider: 'OKTA' },
} as const;

type FactorKind = keyof typeof FACTOR_KINDS;

const HARDENED_DEPARTMENTS = new Set(['Security', 'IT']);

const UNENROLLABLE_STATUSES = new Set(['STAGED', 'PROVISIONED', 'DEPROVISIONED']);

function factorsFor(user: OktaUser, rng: SeededRandom, ordinal: number): OktaFactor[] {
  const kinds: FactorKind[] = [];

  const isContractor = user.profile.employeeType === 'CONTRACTOR';
  const hardened =
    HARDENED_DEPARTMENTS.has(user.profile.department ?? '') ||
    /(^|\s)(Head|Director|VP|Chief)(\s|$)/.test(user.profile.title ?? '');

  const roll = rng.next();
  const secondRoll = rng.next();
  const thirdRoll = rng.next();

  if (UNENROLLABLE_STATUSES.has(user.status)) return [];

  if (hardened) {
    kinds.push('fastpass', 'webauthn');
    if (secondRoll < 0.4) kinds.push('push');
  } else if (isContractor) {
    if (roll < 0.34) return [];
    if (roll < 0.7) kinds.push('sms');
    else kinds.push('googleTotp');
    if (secondRoll < 0.15) kinds.push('email');
  } else {
    if (roll < 0.08) return [];
    if (roll < 0.5) kinds.push('push');
    else if (roll < 0.72) kinds.push('fastpass');
    else if (roll < 0.88) kinds.push('oktaTotp');
    else kinds.push('sms');

    if (secondRoll < 0.36) kinds.push(thirdRoll < 0.5 ? 'sms' : 'oktaTotp');
    if (secondRoll > 0.94) kinds.push('webauthn');
  }

  const unique = [...new Set(kinds)];
  return unique.map((kind, i) => ({
    id: fakeId('ufs', ordinal * 10 + i),
    factorType: FACTOR_KINDS[kind].factorType,
    provider: FACTOR_KINDS[kind].provider,
    status: 'ACTIVE',
  }));
}

function buildFactors(): Map<string, OktaFactor[]> {
  const rng = new SeededRandom(0x4d4641);
  const byUser = new Map<string, OktaFactor[]>();
  demoUsers.forEach((user, i) => {
    byUser.set(user.id, factorsFor(user, rng, i + 1));
  });
  return byUser;
}

export const demoFactorsByUser: ReadonlyMap<string, OktaFactor[]> = buildFactors();

export function demoFactorsFor(userId: string): OktaFactor[] {
  return demoFactorsByUser.get(userId) ?? [];
}
