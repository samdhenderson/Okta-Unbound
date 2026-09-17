import type { CatalogEndpoint } from '../types';

const POLICY_ENDPOINTS: readonly CatalogEndpoint[] = [
  {
    id: 'policies.list',
    path: '/api/v1/policies',
    method: 'GET',
    group: 'policies',
    summary: 'Policies of one type, in evaluation order. The type parameter is required.',
    collection: true,
    keywords: ['signon', 'mfa', 'password', 'access'],
  },
  {
    id: 'policies.get',
    path: '/api/v1/policies/{policyId}',
    method: 'GET',
    group: 'policies',
    summary: 'One policy — its type, its status, and the groups it applies to.',
    collection: false,
  },
  {
    id: 'policies.rules',
    path: '/api/v1/policies/{policyId}/rules',
    method: 'GET',
    group: 'policies',
    summary: 'The rules inside a policy, in priority order. The first match decides.',
    collection: false,
  },
  {
    id: 'policies.rules.get',
    path: '/api/v1/policies/{policyId}/rules/{ruleId}',
    method: 'GET',
    group: 'policies',
    summary: "One rule's conditions and the action it takes when they match.",
    collection: false,
  },
  {
    id: 'policies.lifecycle.activate',
    path: '/api/v1/policies/{policyId}/lifecycle/activate',
    method: 'POST',
    group: 'policies',
    summary: 'Activate a policy, putting it back into evaluation.',
    collection: false,
  },
  {
    id: 'policies.lifecycle.deactivate',
    path: '/api/v1/policies/{policyId}/lifecycle/deactivate',
    method: 'POST',
    group: 'policies',
    summary: 'Deactivate a policy. Whatever it was enforcing stops being enforced.',
    collection: false,
  },
  {
    id: 'policies.simulate',
    path: '/api/v1/policies/simulate',
    method: 'POST',
    group: 'policies',
    summary: 'Ask which policies and rules a described sign-in would hit, without signing in.',
    collection: false,
    keywords: ['what-if', 'test', 'evaluate'],
  },
] as const;

export default POLICY_ENDPOINTS;
