import type { OktaFactor, MemberMfaResult } from '../types';

export function factorLabel(factorType: string, provider?: string): string {
  const type = (factorType || '').toLowerCase();
  const prov = (provider || '').toUpperCase();

  switch (type) {
    case 'push':
      return 'Okta Verify Push';
    case 'signed_nonce':
      return 'Okta Verify (Fastpass)';
    case 'token:software:totp':
      if (prov === 'GOOGLE') return 'Google Authenticator';
      if (prov === 'OKTA') return 'Okta Verify (TOTP)';
      return 'Authenticator App (TOTP)';
    case 'token:hardware':
      return 'Hardware Token';
    case 'token':
      return 'Token';
    case 'sms':
      return 'SMS';
    case 'call':
      return 'Voice Call';
    case 'email':
      return 'Email';
    case 'question':
      return 'Security Question';
    case 'webauthn':
    case 'u2f':
    case 'fido':
      return 'Security Key (WebAuthn)';
    default: {
      const cleaned = type.replace(/[:_]+/g, ' ').trim();
      if (!cleaned) return 'Unknown';
      return cleaned
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
  }
}

export function isActiveMfaFactor(factor: OktaFactor): boolean {
  return factor.status === 'ACTIVE' && (factor.factorType || '').toLowerCase() !== 'password';
}

export function summarizeFactors(userId: string, factors: OktaFactor[]): MemberMfaResult {
  const active = (factors || []).filter(isActiveMfaFactor);
  const labels = new Set<string>();
  active.forEach((f) => labels.add(factorLabel(f.factorType, f.provider)));

  return {
    userId,
    factors: factors || [],
    enrolled: active.length > 0,
    factorCount: active.length,
    factorLabels: Array.from(labels).sort(),
  };
}
