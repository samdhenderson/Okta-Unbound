export function parseRegexQuery(query: string): RegExp | null {
  const match = query.trim().match(/^\/(.+)\/([gimsuy]*)$/);
  if (!match) return null;
  try {
    return new RegExp(match[1], match[2].replace(/[gy]/g, ''));
  } catch {
    return null;
  }
}
