function majorMinor(version: string): string | null {
  const match = /^(\d+)\.(\d+)/.exec(version);
  return match ? `${match[1]}.${match[2]}` : null;
}

export function crossesMinorVersion(
  previousVersion: string | undefined,
  currentVersion: string,
): boolean {
  if (!previousVersion) return false;
  const before = majorMinor(previousVersion);
  const after = majorMinor(currentVersion);
  if (before === null || after === null) return false;
  return before !== after;
}
