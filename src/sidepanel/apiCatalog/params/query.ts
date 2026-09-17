import type { CatalogParam } from '../types';

const Q_ENDPOINTS = ['users.list', 'groups.list', 'apps.list', 'logs.list', 'org.idps'] as const;

const SEARCH_ENDPOINTS = ['users.list', 'groups.list', 'org.devices'] as const;

const FILTER_ENDPOINTS = [
  'users.list',
  'groups.list',
  'apps.list',
  'logs.list',
  'org.devices',
  'org.zones',
] as const;

const OPERATORS =
  'Operators: eq, ne, gt, ge, lt, le, pr (present, no operand), sw, co, and ew on the System Log only. Combine with and, or, not and parentheses.';

const QUERY_PARAMS: readonly CatalogParam[] = [
  {
    name: 'q',
    kind: 'string',
    description: 'Starts-with match over a few obvious properties. For someone typing.',
    group: 'Filtering',
    appliesTo: { kind: 'endpoints', ids: Q_ENDPOINTS },
    note: 'No operators and no sorting — on users it matches firstName, lastName and email only. Right for a people picker at limit=20; wrong for a report, because what it does not match it does not mention.',
  },
  {
    name: 'search',
    kind: 'expression',
    description: 'Expression over almost any property, custom profile attributes included.',
    group: 'Filtering',
    appliesTo: { kind: 'endpoints', ids: SEARCH_ENDPOINTS },
    note: `${OPERATORS} Attribute names are case-sensitive and operators are not — profile.firstName works and profile.firstname does not. Okta prefers search over filter for users. It reads from an index that lags writes slightly, so read a just-written object by id rather than searching for it.`,
  },
  {
    name: 'filter',
    kind: 'expression',
    description: 'Expression over a narrower, per-endpoint set of properties.',
    group: 'Filtering',
    appliesTo: { kind: 'endpoints', ids: FILTER_ENDPOINTS },
    note: `${OPERATORS} Support varies per endpoint and an unsupported filter is often ignored rather than rejected — check the row count against an unfiltered limit=1 and its x-total-count header before trusting it. Groups accept filter on id, type, lastUpdated and lastMembershipUpdated only.`,
  },
  {
    name: 'sortBy',
    kind: 'string',
    description: 'Property to order by. Applies to a search query and to nothing else.',
    group: 'Filtering',
    appliesTo: { kind: 'endpoints', ids: SEARCH_ENDPOINTS },
    note: 'Ignored without search. On groups, lastMembershipUpdated is the one that answers "which groups changed recently".',
  },
  {
    name: 'sortOrder',
    kind: 'enum',
    values: ['ASCENDING', 'DESCENDING'],
    description: 'Direction for sortBy.',
    defaultValue: 'ASCENDING',
    group: 'Filtering',
    appliesTo: { kind: 'endpoints', ids: SEARCH_ENDPOINTS },
  },
] as const;

export default QUERY_PARAMS;
