import type { CatalogParam } from '../types';

const EXPAND_PARAMS: readonly CatalogParam[] = [
  {
    name: 'expand',
    kind: 'enum',
    values: ['stats', 'app'],
    description: 'Embed a group’s exact member count, or the app that sources it.',
    group: 'Embedding',
    appliesTo: { kind: 'endpoints', ids: ['groups.list'] },
    note: 'stats carries an authoritative member count, not a page-length estimate, and survives into the rel="next" link. Its hasAdminPrivlege field is misspelled in Okta’s own schema and has a known accuracy defect — do not report admin status from it.',
  },
  {
    name: 'expand',
    kind: 'enum',
    values: ['group-rules'],
    description: 'Embed which rules feed each member, ending one lookup per member.',
    group: 'Embedding',
    appliesTo: { kind: 'endpoints', ids: ['groups.members.list'] },
    note: 'Three states, not two: an array with entries means rule-fed, an empty array means Okta says no rule feeds them, and an absent key means Okta said nothing at all. Okta drops this parameter from the rel="next" link, so re-append it on every page or attribution degrades after the first 200 rows.',
  },
  {
    name: 'expand',
    kind: 'string',
    description: 'Embed one user’s assignment on each app — write it as user/{userId}.',
    group: 'Embedding',
    appliesTo: { kind: 'endpoints', ids: ['apps.list'] },
    note: 'Pairs with filter=user.id eq "{userId}". The embedded assignment carries its scope, which is otherwise one call per app. A scope of USER means a direct assignment exists — not that a group path does not.',
  },
  {
    name: 'expand',
    kind: 'enum',
    values: ['group'],
    description: 'Embed the whole group object on each assignment row.',
    group: 'Embedding',
    appliesTo: { kind: 'endpoints', ids: ['apps.groups'] },
  },
  {
    name: 'expand',
    kind: 'enum',
    values: ['user'],
    description: 'Embed the users associated with each device.',
    group: 'Embedding',
    appliesTo: { kind: 'endpoints', ids: ['org.devices'] },
  },
] as const;

export default EXPAND_PARAMS;
