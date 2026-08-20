import { toDisplay } from './profileAttributes';
import type { AttributeDescriptor } from './profileAttributes';
import { editControlFor } from './profileEditability';
import type { AttributeEditability, EditControl } from './profileEditability';

export interface DraftChange {
  readonly name: string;
  readonly label: string;
  readonly beforeDisplay: string;
  readonly afterDisplay: string;
  readonly afterRaw: unknown;
  readonly changesSignIn: boolean;
}

export type CoercionResult = { ok: true; value: unknown } | { ok: false; error: string };

const LOGIN_ATTRIBUTE = 'login';

const NUMERIC = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

export function coerceDraftValue(raw: string, control: EditControl): CoercionResult {
  switch (control) {
    case 'number': {
      const trimmed = raw.trim();
      if (trimmed === '') return { ok: true, value: undefined };
      if (!NUMERIC.test(trimmed)) return { ok: false, error: 'Enter a number.' };
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed)) return { ok: false, error: 'Enter a number.' };
      return { ok: true, value: parsed };
    }
    case 'checkbox': {
      const trimmed = raw.trim();
      if (trimmed === '') return { ok: true, value: undefined };
      if (trimmed === 'true') return { ok: true, value: true };
      if (trimmed === 'false') return { ok: true, value: false };
      return { ok: false, error: 'Choose either true or false.' };
    }
    case 'text':
    case 'select':
      return { ok: true, value: raw };
  }
}

function controlFor(attribute: AttributeDescriptor): EditControl {
  return editControlFor(attribute.property) ?? 'text';
}

export function draftDiff(
  attributes: readonly AttributeDescriptor[],
  draft: Readonly<Record<string, string>>,
): DraftChange[] {
  const changes: DraftChange[] = [];

  for (const attribute of attributes) {
    const drafted = draft[attribute.name];
    if (drafted === undefined) continue;

    const beforeDisplay = toDisplay(attribute.raw);
    const coerced = coerceDraftValue(drafted, controlFor(attribute));
    const afterRaw = coerced.ok ? coerced.value : drafted;
    const afterDisplay = coerced.ok ? toDisplay(coerced.value) : drafted;
    if (afterDisplay === beforeDisplay) continue;

    changes.push({
      name: attribute.name,
      label: attribute.label,
      beforeDisplay,
      afterDisplay,
      afterRaw,
      changesSignIn: attribute.name === LOGIN_ATTRIBUTE,
    });
  }

  return changes;
}

export function validateDraft(
  attributes: readonly AttributeDescriptor[],
  editability: ReadonlyMap<string, AttributeEditability>,
  draft: Readonly<Record<string, string>>,
): Readonly<Record<string, string>> {
  const errors: Record<string, string> = {};

  for (const attribute of attributes) {
    const drafted = draft[attribute.name];
    if (drafted === undefined) continue;

    const verdict = editability.get(attribute.name);
    if (verdict === undefined || !verdict.editable) continue;

    const coerced = coerceDraftValue(drafted, verdict.control);
    if (!coerced.ok) {
      errors[attribute.name] = coerced.error;
      continue;
    }

    if (verdict.required && (coerced.value === undefined || coerced.value === '')) {
      errors[attribute.name] = 'A value is required.';
    }
  }

  return errors;
}
