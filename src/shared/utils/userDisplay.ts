import type { OktaUser } from '../types';

export const userDisplayName = (user: OktaUser): string => {
  const name = `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim();
  return name || user.profile.login || user.profile.email || 'User';
};

export const initialsOf = (user: OktaUser): string => {
  const first = (user.profile.firstName || '').trim();
  const last = (user.profile.lastName || '').trim();
  if (first || last) {
    return `${first[0] || ''}${last[0] || ''}`.toUpperCase() || '?';
  }
  const fallback = user.profile.login || user.profile.email || '?';
  return fallback.slice(0, 2).toUpperCase();
};

export const hueFromId = (id: string): number => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 360;
};
