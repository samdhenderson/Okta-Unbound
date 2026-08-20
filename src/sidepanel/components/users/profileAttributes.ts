import type { OktaUser } from '../../../shared/types';
import type { OktaUserProfileSchema, OktaUserSchemaProperty } from '../../../shared/schemas/okta';
import { formatDateShort } from '../../../shared/utils/dateFormat';
import {
  BASE_PROFILE_ATTRIBUTES,
  isExcludedProfileField,
} from '../../../shared/utils/profileFields';

export type AttributeKind = 'system' | 'base' | 'custom';

export interface AttributeDescriptor {
  key: string;
  name: string;
  label: string;
  kind: AttributeKind;
  value: string;
  raw: unknown;
  isEmpty: boolean;
  mono?: boolean;
  property?: OktaUserSchemaProperty;
}

export function toDisplay(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function humanize(name: string): string {
  const spaced = name
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim();
  if (spaced === '') return name;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function displayDate(value: string | null | undefined): string {
  return value ? formatDateShort(value) : '';
}

function displayUserType(value: unknown): string {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    if (typeof record.name === 'string') return record.name;
    if (typeof record.id === 'string') return record.id;
  }
  return toDisplay(value);
}

function systemAttributes(user: OktaUser): AttributeDescriptor[] {
  const rawType = (user as OktaUser & { type?: unknown }).type;

  const rows: Array<{ name: string; label: string; value: string; raw: unknown; mono?: boolean }> =
    [
      { name: 'id', label: 'User ID', value: toDisplay(user.id), raw: user.id, mono: true },
      { name: 'status', label: 'Status', value: toDisplay(user.status), raw: user.status },
      { name: 'type', label: 'Type', value: displayUserType(rawType), raw: rawType },
      { name: 'created', label: 'Created', value: displayDate(user.created), raw: user.created },
      {
        name: 'activated',
        label: 'Activated',
        value: displayDate(user.activated),
        raw: user.activated,
      },
      {
        name: 'statusChanged',
        label: 'Status Changed',
        value: displayDate(user.statusChanged),
        raw: user.statusChanged,
      },
      {
        name: 'lastLogin',
        label: 'Last Login',
        value: displayDate(user.lastLogin),
        raw: user.lastLogin,
      },
      {
        name: 'lastUpdated',
        label: 'Last Updated',
        value: displayDate(user.lastUpdated),
        raw: user.lastUpdated,
      },
      {
        name: 'passwordChanged',
        label: 'Password Changed',
        value: displayDate(user.passwordChanged),
        raw: user.passwordChanged,
      },
    ];

  return rows.map((row) => ({
    key: row.name,
    name: row.name,
    label: row.label,
    kind: 'system' as const,
    value: row.value,
    raw: row.raw,
    isEmpty: row.value === '',
    ...(row.mono ? { mono: true } : {}),
  }));
}

function definitionProperties(
  schema: OktaUserProfileSchema | null,
  block: 'base' | 'custom',
): Record<string, OktaUserSchemaProperty> {
  return schema?.definitions?.[block]?.properties ?? {};
}

function profileAttribute(
  user: OktaUser,
  name: string,
  kind: AttributeKind,
  property?: OktaUserSchemaProperty,
): AttributeDescriptor {
  const raw = user.profile?.[name];
  const value = toDisplay(raw);
  return {
    key: `profile.${name}`,
    name,
    label: property?.title || humanize(name),
    kind,
    value,
    raw,
    isEmpty: value === '',
    property,
  };
}

export function allProfileAttributes(
  user: OktaUser,
  schema: OktaUserProfileSchema | null,
): AttributeDescriptor[] {
  const attributes: AttributeDescriptor[] = [];
  const seen = new Set<string>();

  const emit = (descriptor: AttributeDescriptor): void => {
    if (seen.has(descriptor.key)) return;
    if (isExcludedProfileField(descriptor.name)) return;
    seen.add(descriptor.key);
    attributes.push(descriptor);
  };

  for (const attribute of systemAttributes(user)) emit(attribute);

  const baseProperties = definitionProperties(schema, 'base');
  const schemaBaseNames = Object.keys(baseProperties);
  const baseNames = schemaBaseNames.length > 0 ? schemaBaseNames : BASE_PROFILE_ATTRIBUTES;
  for (const name of baseNames) {
    emit(profileAttribute(user, name, 'base', baseProperties[name]));
  }

  const customProperties = definitionProperties(schema, 'custom');
  for (const [name, property] of Object.entries(customProperties)) {
    emit(profileAttribute(user, name, 'custom', property));
  }

  for (const name of Object.keys(user.profile ?? {})) {
    emit(profileAttribute(user, name, 'custom'));
  }

  return attributes;
}
