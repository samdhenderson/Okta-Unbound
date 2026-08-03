export { parseNextLink, nextPageUrl } from '@/shared/utils/oktaPagination';

export function deepMergeProfiles(
  baseProfile: Record<string, unknown>,
  overrideProfile: Record<string, unknown>,
  arrayStrategy: 'merge' | 'replace' = 'replace',
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...baseProfile };

  for (const [key, overrideValue] of Object.entries(overrideProfile)) {
    const baseValue = result[key];

    if (overrideValue === null || overrideValue === undefined) {
      continue;
    }

    if (Array.isArray(overrideValue)) {
      if (arrayStrategy === 'merge' && Array.isArray(baseValue)) {
        result[key] = [...new Set([...baseValue, ...overrideValue])];
      } else {
        result[key] = [...overrideValue];
      }
    } else if (
      typeof overrideValue === 'object' &&
      typeof baseValue === 'object' &&
      !Array.isArray(baseValue)
    ) {
      result[key] = deepMergeProfiles(
        (baseValue as Record<string, unknown> | null) || {},
        overrideValue as Record<string, unknown>,
        arrayStrategy,
      );
    } else {
      result[key] = overrideValue;
    }
  }

  return result;
}
