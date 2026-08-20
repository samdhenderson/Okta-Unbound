import type { OktaUser } from '../../../shared/types';
import type { OktaUserSchemaProperty } from '../../../shared/schemas/okta';
import type { AttributeDescriptor } from './profileAttributes';

export type EditControl = 'text' | 'number' | 'select' | 'checkbox';

export type LockReason =
  | 'system'
  | 'read-only'
  | 'write-only'
  | 'externally-mastered'
  | 'account-mastered'
  | 'unsupported-type'
  | 'not-in-schema';

export interface ProfileMastering {
  readonly profileSources?: ReadonlyMap<string, string>;
}

export function profileMastering(
  apps:
    | readonly {
        readonly id: string;
        readonly label: string;
        readonly isProfileSource?: boolean;
      }[]
    | undefined,
  complete: boolean,
): ProfileMastering {
  if (apps === undefined || !complete) return {};

  const profileSources = new Map<string, string>();
  for (const app of apps) {
    if (app.isProfileSource === true) profileSources.set(app.id, app.label);
  }
  return { profileSources };
}

export interface EditOption {
  value: string;
  label: string;
}

export type AttributeEditability =
  | {
      readonly editable: true;
      readonly control: EditControl;
      readonly options?: readonly EditOption[];
      readonly required: boolean;
    }
  | {
      readonly editable: false;
      readonly reason: LockReason;
      readonly explanation: string;
      readonly source?: string;
    };

const OKTA_MASTER = 'OKTA';

const PROFILE_MASTER = 'PROFILE_MASTER';

const LOGIN_ATTRIBUTE = 'login';

function humanizeSource(token: string): string {
  const words = token
    .split(/[_\s-]+/)
    .filter((word) => word !== '')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  return words.length > 0 ? words.join(' ') : token;
}

function locked(reason: LockReason, explanation: string, source?: string): AttributeEditability {
  return source === undefined
    ? { editable: false, reason, explanation }
    : { editable: false, reason, explanation, source };
}

function oneOfOptions(entries: readonly unknown[]): EditOption[] | undefined {
  const options: EditOption[] = [];
  for (const entry of entries) {
    if (entry === null || typeof entry !== 'object') return undefined;
    const record = entry as { const?: unknown; title?: unknown };
    if (typeof record.const !== 'string') return undefined;
    const label =
      typeof record.title === 'string' && record.title !== '' ? record.title : undefined;
    options.push({ value: record.const, label: label ?? String(record.const) });
  }
  return options.length > 0 ? options : undefined;
}

function enumOptions(entries: readonly unknown[]): EditOption[] | undefined {
  const options: EditOption[] = [];
  for (const entry of entries) {
    if (typeof entry !== 'string') return undefined;
    options.push({ value: entry, label: entry });
  }
  return options.length > 0 ? options : undefined;
}

function selectOptions(property: OktaUserSchemaProperty): EditOption[] | undefined {
  if (property.oneOf !== undefined) {
    const labelled = oneOfOptions(property.oneOf);
    if (labelled !== undefined) return labelled;
  }
  if (property.enum !== undefined) return enumOptions(property.enum);
  return undefined;
}

export function editControlFor(
  property: OktaUserSchemaProperty | undefined,
): EditControl | undefined {
  if (property === undefined) return undefined;
  switch (property.type) {
    case 'string':
      return selectOptions(property) === undefined ? 'text' : 'select';
    case 'boolean':
      return 'checkbox';
    case 'number':
    case 'integer':
      return 'number';
    default:
      return undefined;
  }
}

function mutabilityLock(mutability: string): AttributeEditability {
  if (mutability === 'READ_ONLY') {
    return locked(
      'read-only',
      'Okta reports this attribute as read-only, so it is changed elsewhere.',
    );
  }
  if (mutability === 'WRITE_ONLY') {
    return locked(
      'write-only',
      'Okta accepts a value for this attribute but never returns one, so there is nothing here to edit against.',
    );
  }
  return locked(
    'read-only',
    'Okta reports a mutability this panel does not recognize, so the attribute is treated as read-only.',
  );
}

function masteringLock(
  property: OktaUserSchemaProperty,
  mastering: ProfileMastering | undefined,
): AttributeEditability | undefined {
  const type = property.master?.type;
  if (type === undefined || type === OKTA_MASTER) return undefined;

  if (type !== PROFILE_MASTER) {
    const source = humanizeSource(type);
    return locked(
      'externally-mastered',
      `An external system masters this attribute (${source}), so it is changed there rather than here.`,
      source,
    );
  }

  const sources = mastering?.profileSources;
  if (sources === undefined) {
    return locked(
      'externally-mastered',
      'A profile source outside Okta masters this attribute, so it is changed there rather than here.',
    );
  }

  if (sources.size === 0) return undefined;

  const names = [...sources.values()].filter((name) => name !== '');
  if (names.length === 0) {
    return locked(
      'externally-mastered',
      'A profile source outside Okta masters this attribute, so it is changed there rather than here.',
    );
  }

  if (names.length === 1) {
    return locked(
      'externally-mastered',
      `${names[0]} is this user's profile source, so this attribute is changed there rather than here.`,
      names[0],
    );
  }

  return locked(
    'externally-mastered',
    `This user is attached to more than one profile source (${names.join(', ')}), and Okta does not report which of them owns this attribute.`,
  );
}

function typeLock(type: string | undefined): AttributeEditability {
  if (type === undefined || type === '') {
    return locked(
      'unsupported-type',
      "The org's schema does not say what type this attribute holds, so this panel does not edit it.",
    );
  }
  return locked('unsupported-type', `This panel does not edit ${type} attributes.`);
}

export function attributeEditability(
  attribute: AttributeDescriptor,
  user: OktaUser,
  mastering?: ProfileMastering,
): AttributeEditability {
  if (attribute.kind === 'system') {
    return locked(
      'system',
      'This is an account field rather than a profile attribute, so it is not edited here.',
    );
  }

  const property = attribute.property;
  if (property === undefined) {
    return locked(
      'not-in-schema',
      "The org's profile schema does not describe this attribute, so this panel will not write to it.",
    );
  }

  if (attribute.name === LOGIN_ATTRIBUTE) {
    const provider = user.credentials?.provider?.type;
    if (provider === undefined || provider === '') {
      return locked(
        'account-mastered',
        'This panel could not confirm that Okta masters this account, so the sign-in name is changed in the Okta console instead.',
      );
    }
    if (provider !== OKTA_MASTER) {
      const source = humanizeSource(provider);
      return locked(
        'account-mastered',
        `This account is mastered by ${source}, so the sign-in name is changed there rather than here.`,
        source,
      );
    }
  }

  if (property.mutability !== undefined && property.mutability !== 'READ_WRITE') {
    return mutabilityLock(property.mutability);
  }

  const mastered = masteringLock(property, mastering);
  if (mastered !== undefined) return mastered;

  const control = editControlFor(property);
  if (control === undefined) return typeLock(property.type);

  const options = control === 'select' ? selectOptions(property) : undefined;
  const required = Boolean(property.required);

  return options === undefined
    ? { editable: true, control, required }
    : { editable: true, control, options, required };
}
