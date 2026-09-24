export function motionAvailable(): boolean {
  if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') return false;
  if (document.querySelector('[data-motion="off"]')) return false;
  return readDurToken('--dur-tell') > 0;
}

export function readDurToken(name: string): number {
  if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') return 0;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const match = /^([\d.]+)(ms|s)$/.exec(raw);
  if (!match) return 0;
  const value = Number(match[1]);
  return match[2] === 's' ? value * 1000 : value;
}
