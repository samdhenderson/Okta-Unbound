import type { CatalogEndpoint } from '../types';

const RULE_ENDPOINTS: readonly CatalogEndpoint[] = [
  {
    id: 'rules.list',
    path: '/api/v1/groups/rules',
    method: 'GET',
    group: 'rules',
    summary: 'Every group rule in the org, with its condition and its target groups.',
    collection: true,
    keywords: ['automation', 'dynamic', 'expression'],
  },
  {
    id: 'rules.create',
    path: '/api/v1/groups/rules',
    method: 'POST',
    group: 'rules',
    summary: 'Create a rule. It is INACTIVE until activated, and matches nobody meanwhile.',
    collection: false,
  },
  {
    id: 'rules.get',
    path: '/api/v1/groups/rules/{ruleId}',
    method: 'GET',
    group: 'rules',
    summary: "One rule's expression, its target groups, and its status.",
    collection: false,
  },
  {
    id: 'rules.update',
    path: '/api/v1/groups/rules/{ruleId}',
    method: 'PUT',
    group: 'rules',
    summary: 'Replace a rule. The rule must be INACTIVE first or the call is refused.',
    collection: false,
  },
  {
    id: 'rules.delete',
    path: '/api/v1/groups/rules/{ruleId}',
    method: 'DELETE',
    group: 'rules',
    summary: 'Delete a rule. Members it added stay in the group as manual members.',
    collection: false,
  },
  {
    id: 'rules.lifecycle.activate',
    path: '/api/v1/groups/rules/{ruleId}/lifecycle/activate',
    method: 'POST',
    group: 'rules',
    summary: 'Activate a rule. It evaluates against every user in the org on the way in.',
    collection: false,
  },
  {
    id: 'rules.lifecycle.deactivate',
    path: '/api/v1/groups/rules/{ruleId}/lifecycle/deactivate',
    method: 'POST',
    group: 'rules',
    summary: 'Deactivate a rule. Members it added stay where they are.',
    collection: false,
  },
] as const;

export default RULE_ENDPOINTS;
