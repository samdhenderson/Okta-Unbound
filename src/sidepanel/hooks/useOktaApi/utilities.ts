export function parseNextLink(linkHeader?: string): string | null {
  if (!linkHeader) return null;

  const links = linkHeader.split(',');
  for (const link of links) {
    if (link.includes('rel="next"')) {
      const match = link.match(/<([^>]+)>/);
      if (match) {
        const fullUrl = new URL(match[1]);
        return fullUrl.pathname + fullUrl.search;
      }
    }
  }
  return null;
}

export function deepMergeProfiles(
  baseProfile: Record<string, any>,
  overrideProfile: Record<string, any>,
  arrayStrategy: 'merge' | 'replace' = 'replace',
): Record<string, any> {
  const result: Record<string, any> = { ...baseProfile };

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
      result[key] = deepMergeProfiles(baseValue || {}, overrideValue, arrayStrategy);
    } else {
      result[key] = overrideValue;
    }
  }

  return result;
}
