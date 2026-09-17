import type { CatalogParam } from '../types';

const POLICY_PARAMS: readonly CatalogParam[] = [
  {
    name: 'type',
    kind: 'enum',
    values: [
      'ACCESS_POLICY',
      'OKTA_SIGN_ON',
      'MFA_ENROLL',
      'PASSWORD',
      'IDP_DISCOVERY',
      'PROFILE_ENROLLMENT',
      'POST_AUTH_SESSION',
      'ENTITY_RISK',
    ],
    description: 'Which kind of policy to list. Required — there is no listing across types.',
    group: 'Filtering',
    appliesTo: { kind: 'endpoints', ids: ['policies.list'] },
    note: 'Omitting it is a 400, not an empty page. A 403 here is a statement about the reader’s admin role, not about the org.',
  },
  {
    name: 'status',
    kind: 'enum',
    values: ['ACTIVE', 'INACTIVE'],
    description: 'Limit the listing to policies in one state.',
    group: 'Filtering',
    appliesTo: { kind: 'endpoints', ids: ['policies.list'] },
  },
  {
    name: 'expand',
    kind: 'enum',
    values: ['rules'],
    description: 'Embed each policy’s rules, instead of one call per policy.',
    group: 'Embedding',
    appliesTo: { kind: 'endpoints', ids: ['policies.list'] },
  },
] as const;

export default POLICY_PARAMS;
