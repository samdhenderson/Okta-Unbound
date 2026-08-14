import type { OktaUser, OktaGroup } from '../../shared/types';

export const mockUsers: OktaUser[] = Array.from({ length: 250 }, (_, i) => ({
  id: `user${i + 1}`,
  status: i < 5 ? 'DEPROVISIONED' : i < 10 ? 'SUSPENDED' : 'ACTIVE',
  profile: {
    login: `user${i + 1}@example.com`,
    email: `user${i + 1}@example.com`,
    firstName: `First${i + 1}`,
    lastName: `Last${i + 1}`,
    department: 'Engineering',
    title: 'Developer',
  },
}));

export const mockGroup: OktaGroup = {
  id: 'group123',
  type: 'OKTA_GROUP',
  profile: {
    name: 'Test Group',
    description: 'A test group',
  },
};
