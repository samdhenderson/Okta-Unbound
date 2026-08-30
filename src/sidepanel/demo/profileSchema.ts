import type { OktaUserProfileSchema, OktaUserSchemaProperty } from '../../shared/schemas/okta';

const text = (title: string, required = false): OktaUserSchemaProperty => ({
  title,
  type: 'string',
  mutability: 'READ_WRITE',
  required,
  master: { type: 'OKTA' },
});

const choice = (title: string, values: readonly string[]): OktaUserSchemaProperty => ({
  title,
  type: 'string',
  mutability: 'READ_WRITE',
  required: false,
  enum: [...values],
  master: { type: 'OKTA' },
});

const BASE: Record<string, OktaUserSchemaProperty> = {
  login: {
    title: 'Username',
    type: 'string',
    mutability: 'READ_WRITE',
    required: true,
    master: { type: 'OKTA' },
  },
  email: text('Primary email', true),
  secondEmail: text('Secondary email'),
  firstName: text('First name', true),
  lastName: text('Last name', true),
  displayName: text('Display name'),
  title: text('Title'),
  userType: text('User type'),
  department: text('Department'),
  organization: text('Organization'),
  manager: text('Manager'),
  mobilePhone: text('Mobile phone'),
  city: text('City'),
  state: text('State'),
  countryCode: choice('Country code', ['US', 'GB', 'DE', 'IE', 'CA', 'AU']),
};

const CUSTOM: Record<string, OktaUserSchemaProperty> = {
  employeeType: choice('Employee type', ['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'INTERN']),
};

export const DEMO_USER_PROFILE_SCHEMA: OktaUserProfileSchema = {
  id: 'https://example.okta.com/meta/schemas/user/default',
  name: 'user',
  definitions: {
    base: { id: '#base', type: 'object', properties: BASE, required: ['login'] },
    custom: { id: '#custom', type: 'object', properties: CUSTOM, required: [] },
  },
};
