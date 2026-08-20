import type { ProfileDisplayConfig } from '../../../shared/storage/profileDisplayStore';
import type { AttributeDescriptor } from './profileAttributes';

export const UNCATEGORIZED = '';

export const UNCATEGORIZED_LABEL = 'Uncategorized';

export interface AttributeBlock {
  key: string;
  name: string;
  attributes: AttributeDescriptor[];
}

export interface AttributeBlockFilters {
  filter: string;
  onlyRuleRead: boolean;
}

function matchesFilter(attribute: AttributeDescriptor, needle: string): boolean {
  if (needle === '') return true;
  return (
    attribute.label.toLowerCase().includes(needle) ||
    attribute.name.toLowerCase().includes(needle) ||
    attribute.value.toLowerCase().includes(needle)
  );
}

export function buildAttributeBlocks(
  attributes: readonly AttributeDescriptor[],
  config: ProfileDisplayConfig,
  ruleReads: Record<string, string[]>,
  filters: AttributeBlockFilters,
): AttributeBlock[] {
  const needle = filters.filter.trim().toLowerCase();
  const categoryKeys = new Set(config.categories.map((category) => category.key));

  const byName = new Map<string, AttributeDescriptor>();
  for (const attribute of attributes) {
    if (!byName.has(attribute.name)) byName.set(attribute.name, attribute);
  }

  const placed = new Set(config.attrOrder);
  const ordered = [
    ...config.attrOrder.filter((name) => byName.has(name)),
    ...[...byName.keys()].filter((name) => !placed.has(name)),
  ];

  const buckets = new Map<string, AttributeDescriptor[]>();
  for (const name of ordered) {
    const attribute = byName.get(name);
    if (!attribute) continue;
    if (config.hidden[name]) continue;
    if (attribute.isEmpty && !config.showEmpty) continue;
    if (filters.onlyRuleRead && !ruleReads[name]?.length) continue;
    if (!matchesFilter(attribute, needle)) continue;

    const assigned = config.assign[name];
    const key = assigned && categoryKeys.has(assigned) ? assigned : UNCATEGORIZED;
    const bucket = buckets.get(key);
    if (bucket) bucket.push(attribute);
    else buckets.set(key, [attribute]);
  }

  const blocks: AttributeBlock[] = [];
  for (const category of config.categories) {
    const bucket = buckets.get(category.key);
    if (bucket && bucket.length > 0) {
      blocks.push({ key: category.key, name: category.name, attributes: bucket });
    }
  }

  const leftovers = buckets.get(UNCATEGORIZED);
  if (leftovers && leftovers.length > 0) {
    blocks.push({ key: UNCATEGORIZED, name: UNCATEGORIZED_LABEL, attributes: leftovers });
  }

  return blocks;
}
