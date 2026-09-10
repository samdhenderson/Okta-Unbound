import {
  DEFAULT_PROFILE_DISPLAY_CONFIG,
  type ProfileDisplayConfig,
} from '../../../shared/storage/profileDisplayStore';
import type { AttributeDescriptor } from './profileAttributes';

export function fixtureAttribute(
  name: string,
  kind: AttributeDescriptor['kind'],
  value: string,
  label = name,
): AttributeDescriptor {
  return {
    key: kind === 'system' ? name : `profile.${name}`,
    name,
    label,
    kind,
    value,
    raw: value,
    isEmpty: value === '',
  };
}

export const fixtureAttributes: AttributeDescriptor[] = [
  fixtureAttribute('login', 'base', 'ada@example.com', 'Username'),
  fixtureAttribute('lastName', 'base', 'Lovelace', 'Last name'),
  fixtureAttribute('firstName', 'base', 'Ada', 'First name'),
  fixtureAttribute('department', 'custom', '', 'Department'),
  fixtureAttribute('id', 'system', '00uFAKE0001', 'Okta ID'),
];

export const fixtureConfig: ProfileDisplayConfig = {
  ...DEFAULT_PROFILE_DISPLAY_CONFIG,
  showEmpty: true,
  categories: [
    { key: 'identity', name: 'Identity' },
    { key: 'organization', name: 'Organization' },
  ],
  attrOrder: ['login', 'lastName', 'firstName', 'department', 'id'],
  assign: {
    login: 'identity',
    lastName: '',
    firstName: 'identity',
    department: 'organization',
    id: '',
  },
  hidden: {
    login: false,
    lastName: false,
    firstName: false,
    department: false,
    id: false,
  },
};
