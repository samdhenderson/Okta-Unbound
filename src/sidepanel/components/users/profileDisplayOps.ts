import type {
  ProfileDisplayCategory,
  ProfileDisplayConfig,
} from '../../../shared/storage/profileDisplayStore';
import type { AttributeDescriptor } from './profileAttributes';
import { UNCATEGORIZED, UNCATEGORIZED_LABEL } from './profileAttributeBlocks';

export type AttributeStep = 'up' | 'down' | 'prev-section' | 'next-section';

export function categoryKeyFor(name: string, taken: ReadonlySet<string>): string {
  const slug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `category-${taken.size + 1}`;
  if (!taken.has(slug)) return slug;
  let suffix = 2;
  while (taken.has(`${slug}-${suffix}`)) suffix += 1;
  return `${slug}-${suffix}`;
}

function resolveKey(config: ProfileDisplayConfig, name: string): string {
  const assigned = config.assign[name];
  if (!assigned) return UNCATEGORIZED;
  return config.categories.some((category) => category.key === assigned) ? assigned : UNCATEGORIZED;
}

function resolveTarget(config: ProfileDisplayConfig, key: string): string {
  if (!key) return UNCATEGORIZED;
  return config.categories.some((category) => category.key === key) ? key : UNCATEGORIZED;
}

function orderedNames(
  config: ProfileDisplayConfig,
  attributes: readonly AttributeDescriptor[],
): string[] {
  const known = new Set(attributes.map((attribute) => attribute.name));
  const ordered = [...new Set(config.attrOrder.filter((name) => known.has(name)))];
  const placed = new Set(ordered);
  for (const name of known) {
    if (!placed.has(name)) ordered.push(name);
  }
  return ordered;
}

function partition(config: ProfileDisplayConfig, names: readonly string[]): string[] {
  const buckets = new Map<string, string[]>();
  for (const name of names) {
    const key = resolveKey(config, name);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(name);
    else buckets.set(key, [name]);
  }
  return sectionOrder(config).flatMap((section) => buckets.get(section.key) ?? []);
}

export function completeAssign(
  attributes: readonly AttributeDescriptor[],
  config: ProfileDisplayConfig,
  overrides: Readonly<Record<string, string>> = {},
): Record<string, string> {
  const assign: Record<string, string> = {};
  for (const attribute of attributes) {
    const override = overrides[attribute.name];
    assign[attribute.name] =
      override === undefined ? resolveKey(config, attribute.name) : resolveTarget(config, override);
  }
  return assign;
}

export function completeHidden(
  attributes: readonly AttributeDescriptor[],
  config: ProfileDisplayConfig,
  overrides: Readonly<Record<string, boolean>> = {},
): Record<string, boolean> {
  const hidden: Record<string, boolean> = {};
  for (const attribute of attributes) {
    const override = overrides[attribute.name];
    hidden[attribute.name] =
      override === undefined ? config.hidden[attribute.name] === true : override;
  }
  return hidden;
}

export function sectionOrder(config: ProfileDisplayConfig): ReadonlyArray<ProfileDisplayCategory> {
  return [...config.categories, { key: UNCATEGORIZED, name: UNCATEGORIZED_LABEL }];
}

export function namesInSection(config: ProfileDisplayConfig, key: string): string[] {
  const section = resolveTarget(config, key);
  return config.attrOrder.filter((name) => resolveKey(config, name) === section);
}

export function indexOfAttribute(config: ProfileDisplayConfig, name: string): number {
  return namesInSection(config, resolveKey(config, name)).indexOf(name);
}

export function placeAttribute(
  config: ProfileDisplayConfig,
  attributes: readonly AttributeDescriptor[],
  name: string,
  targetKey: string,
  index: number,
): ProfileDisplayConfig {
  const target = resolveTarget(config, targetKey);
  const assign = completeAssign(attributes, config, { [name]: target });
  const placed: ProfileDisplayConfig = { ...config, assign };

  const names = orderedNames(placed, attributes).filter((candidate) => candidate !== name);
  const attrOrder: string[] = [];
  for (const section of sectionOrder(placed)) {
    const members = names.filter((candidate) => resolveKey(placed, candidate) === section.key);
    if (section.key === target) {
      members.splice(Math.min(Math.max(index, 0), members.length), 0, name);
    }
    attrOrder.push(...members);
  }

  return { ...placed, attrOrder };
}

export function stepAttribute(
  config: ProfileDisplayConfig,
  attributes: readonly AttributeDescriptor[],
  name: string,
  direction: AttributeStep,
): ProfileDisplayConfig {
  const sections = sectionOrder(config);
  const currentKey = resolveKey(config, name);
  const sectionIndex = sections.findIndex((section) => section.key === currentKey);
  if (sectionIndex === -1) return config;

  const members = namesInSection(config, currentKey);
  const position = members.indexOf(name);
  if (position === -1) return config;

  const previous = sections[sectionIndex - 1];
  const next = sections[sectionIndex + 1];

  switch (direction) {
    case 'up':
      if (position > 0) return placeAttribute(config, attributes, name, currentKey, position - 1);
      if (!previous) return config;
      return placeAttribute(
        config,
        attributes,
        name,
        previous.key,
        namesInSection(config, previous.key).length,
      );
    case 'down':
      if (position < members.length - 1) {
        return placeAttribute(config, attributes, name, currentKey, position + 1);
      }
      if (!next) return config;
      return placeAttribute(config, attributes, name, next.key, 0);
    case 'prev-section':
      if (!previous) return config;
      return placeAttribute(
        config,
        attributes,
        name,
        previous.key,
        namesInSection(config, previous.key).length,
      );
    case 'next-section':
      if (!next) return config;
      return placeAttribute(
        config,
        attributes,
        name,
        next.key,
        namesInSection(config, next.key).length,
      );
  }
}

export function moveCategory(
  config: ProfileDisplayConfig,
  key: string,
  index: number,
): ProfileDisplayConfig {
  const from = config.categories.findIndex((category) => category.key === key);
  if (from === -1) return config;

  const categories = [...config.categories];
  const [moved] = categories.splice(from, 1);
  categories.splice(Math.min(Math.max(index, 0), categories.length), 0, moved);

  const reordered: ProfileDisplayConfig = { ...config, categories };
  return { ...reordered, attrOrder: partition(reordered, config.attrOrder) };
}

export function renameCategory(
  config: ProfileDisplayConfig,
  key: string,
  name: string,
): ProfileDisplayConfig {
  if (!config.categories.some((category) => category.key === key)) return config;
  return {
    ...config,
    categories: config.categories.map((category) =>
      category.key === key ? { ...category, name } : category,
    ),
  };
}

export function addCategory(config: ProfileDisplayConfig, name: string): ProfileDisplayConfig {
  const label = name.trim();
  if (label === '') return config;
  const taken = new Set(config.categories.map((category) => category.key));
  return {
    ...config,
    categories: [...config.categories, { key: categoryKeyFor(label, taken), name: label }],
  };
}

export function deleteCategory(
  config: ProfileDisplayConfig,
  attributes: readonly AttributeDescriptor[],
  key: string,
): ProfileDisplayConfig {
  if (!config.categories.some((category) => category.key === key)) return config;

  const categories = config.categories.filter((category) => category.key !== key);
  const shortened: ProfileDisplayConfig = { ...config, categories };
  const freed: ProfileDisplayConfig = {
    ...shortened,
    assign: completeAssign(attributes, shortened),
  };
  return { ...freed, attrOrder: partition(freed, orderedNames(freed, attributes)) };
}

export function toggleHidden(
  config: ProfileDisplayConfig,
  attributes: readonly AttributeDescriptor[],
  name: string,
): ProfileDisplayConfig {
  return {
    ...config,
    hidden: completeHidden(attributes, config, { [name]: config.hidden[name] !== true }),
  };
}
