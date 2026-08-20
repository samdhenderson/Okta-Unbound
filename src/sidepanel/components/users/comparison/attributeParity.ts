import type { OktaUser } from '../../../../shared/types';
import type { OktaUserProfileSchema } from '../../../../shared/schemas/okta';
import type { ProfileDisplayConfig } from '../../../../shared/storage/profileDisplayStore';
import {
  allProfileAttributes,
  type AttributeDescriptor,
  type AttributeKind,
} from '../profileAttributes';
import { UNCATEGORIZED } from '../profileAttributeBlocks';

export type AttributeVerdict = 'same' | 'differs' | 'onlyContext' | 'onlyCompared' | 'bothEmpty';

export interface AttributeParityRow {
  readonly key: string;
  readonly name: string;
  readonly label: string;
  readonly kind: AttributeKind;
  readonly contextValue: string;
  readonly comparedValue: string;
  readonly verdict: AttributeVerdict;
  readonly categoryKey: string;
  readonly hiddenByConfig: boolean;
}

export interface AttributeParityResult {
  readonly rows: AttributeParityRow[];
  readonly hiddenRows: AttributeParityRow[];
  readonly hiddenDifferences: number;
  readonly differenceCount: number;
}

function isDifference(verdict: AttributeVerdict): boolean {
  return verdict === 'differs' || verdict === 'onlyContext' || verdict === 'onlyCompared';
}

function verdictOf(contextValue: string, comparedValue: string): AttributeVerdict {
  const contextEmpty = contextValue === '';
  const comparedEmpty = comparedValue === '';
  if (contextEmpty && comparedEmpty) return 'bothEmpty';
  if (comparedEmpty) return 'onlyContext';
  if (contextEmpty) return 'onlyCompared';
  return contextValue === comparedValue ? 'same' : 'differs';
}

function indexByName(
  descriptors: readonly AttributeDescriptor[],
): Map<string, AttributeDescriptor> {
  const byName = new Map<string, AttributeDescriptor>();
  for (const descriptor of descriptors) {
    if (!byName.has(descriptor.name)) byName.set(descriptor.name, descriptor);
  }
  return byName;
}

export function attributeParityRows(
  contextUser: OktaUser,
  comparedUser: OktaUser,
  schema: OktaUserProfileSchema | null,
  config: ProfileDisplayConfig,
): AttributeParityResult {
  const contextByName = indexByName(allProfileAttributes(contextUser, schema));
  const comparedByName = indexByName(allProfileAttributes(comparedUser, schema));

  const names = [
    ...contextByName.keys(),
    ...[...comparedByName.keys()].filter((name) => !contextByName.has(name)),
  ];

  const categoryKeys = new Set(config.categories.map((category) => category.key));
  const orderIndex = new Map(config.attrOrder.map((name, index) => [name, index]));

  const rows: AttributeParityRow[] = [];
  const hiddenRows: AttributeParityRow[] = [];

  for (const name of names) {
    const descriptor = contextByName.get(name) ?? comparedByName.get(name);
    if (!descriptor) continue;

    const contextValue = contextByName.get(name)?.value ?? '';
    const comparedValue = comparedByName.get(name)?.value ?? '';
    const verdict = verdictOf(contextValue, comparedValue);

    if (verdict === 'bothEmpty' && !config.showEmpty) continue;

    const assigned = config.assign[name];
    const hidden = config.hidden[name] === true;

    const row: AttributeParityRow = {
      key: descriptor.key,
      name: descriptor.name,
      label: descriptor.label,
      kind: descriptor.kind,
      contextValue,
      comparedValue,
      verdict,
      categoryKey: assigned && categoryKeys.has(assigned) ? assigned : UNCATEGORIZED,
      hiddenByConfig: hidden,
    };

    if (hidden) hiddenRows.push(row);
    else rows.push(row);
  }

  const byDifferenceThenConfigOrder = (a: AttributeParityRow, b: AttributeParityRow): number => {
    const rank = (row: AttributeParityRow) => (isDifference(row.verdict) ? 0 : 1);
    const placed = (row: AttributeParityRow) => orderIndex.get(row.name) ?? Number.MAX_SAFE_INTEGER;
    return rank(a) - rank(b) || placed(a) - placed(b) || a.label.localeCompare(b.label);
  };

  rows.sort(byDifferenceThenConfigOrder);
  hiddenRows.sort(byDifferenceThenConfigOrder);

  return {
    rows,
    hiddenRows,
    hiddenDifferences: hiddenRows.filter((row) => isDifference(row.verdict)).length,
    differenceCount: rows.filter((row) => isDifference(row.verdict)).length,
  };
}
