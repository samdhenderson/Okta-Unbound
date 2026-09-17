import type { CatalogParam } from '../types';

const LIFECYCLE_PARAMS: readonly CatalogParam[] = [
  {
    name: 'sendEmail',
    kind: 'enum',
    values: ['true', 'false'],
    description: 'Whether Okta emails the person as part of this transition.',
    group: 'Other',
    appliesTo: {
      kind: 'endpoints',
      ids: [
        'users.lifecycle.resetPassword',
        'users.lifecycle.activate',
        'users.lifecycle.reactivate',
        'users.lifecycle.deactivate',
        'users.delete',
        'apps.users.unassign',
      ],
    },
    note: 'On reset_password, sendEmail=false sends no mail and returns a one-time resetPasswordUrl in the response instead — the break-glass form, for an account whose mailbox is the thing that is broken.',
  },
  {
    name: 'activate',
    kind: 'enum',
    values: ['true', 'false'],
    description: 'Whether a newly created user is activated immediately.',
    defaultValue: 'true',
    group: 'Other',
    appliesTo: { kind: 'endpoints', ids: ['users.create'] },
    note: 'activate=false leaves the account STAGED — created, and unable to sign in until someone activates it.',
  },
  {
    name: 'nextLogin',
    kind: 'enum',
    values: ['changePassword'],
    description: 'Force a password change at the new user’s first sign-in.',
    group: 'Other',
    appliesTo: { kind: 'endpoints', ids: ['users.create'] },
  },
  {
    name: 'provider',
    kind: 'enum',
    values: ['true', 'false'],
    description: 'Create the user against an external provider named in the body.',
    group: 'Other',
    appliesTo: { kind: 'endpoints', ids: ['users.create'] },
  },
  {
    name: 'strict',
    kind: 'enum',
    values: ['true', 'false'],
    description: 'Enforce the password policy’s minimum age on a credential change.',
    group: 'Other',
    appliesTo: { kind: 'endpoints', ids: ['users.update', 'users.replace'] },
  },
  {
    name: 'removeUsers',
    kind: 'enum',
    values: ['true', 'false'],
    description: 'Whether removing a push mapping also removes the users it pushed.',
    group: 'Other',
    appliesTo: { kind: 'endpoints', ids: ['apps.groupPush'] },
  },
] as const;

export default LIFECYCLE_PARAMS;
