export const MIN_SAMPLES = 3;

export interface EtaUnknown {
  kind: 'unknown';
  label: string;
}

export interface EtaPoint {
  kind: 'point';
  lowerMs: number;
  label: string;
}

export interface EtaRange {
  kind: 'range';
  lowerMs: number;
  upperMs: number;
  label: string;
}

export type EtaEstimate = EtaUnknown | EtaPoint | EtaRange;

export function clock(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function cooldownClock(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  if (seconds >= 60) {
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export function longestArmedGateMs(
  gatedUntil: readonly (number | null)[],
  globalCooldownMs: number,
  now: number,
): number {
  return gatedUntil.reduce<number>(
    (widest, deadline) => Math.max(widest, deadline === null ? 0 : deadline - now),
    Math.max(0, globalCooldownMs),
  );
}

export interface EtaInput {
  done: number;
  total: number;
  elapsedMs: number;
  longestGateMs: number;
}

export function estimateEta(input: EtaInput): EtaEstimate {
  const { done, total, elapsedMs, longestGateMs } = input;
  const left = Math.max(0, total - done);

  if (done < MIN_SAMPLES || elapsedMs <= 0 || left === 0) {
    return { kind: 'unknown', label: 'estimating…' };
  }

  const lowerMs = Math.round((elapsedMs / done) * left);
  if (lowerMs <= 0) return { kind: 'unknown', label: 'estimating…' };

  const gate = Math.max(0, Math.round(longestGateMs));
  if (gate === 0) {
    return { kind: 'point', lowerMs, label: `~${clock(Math.round(lowerMs / 1000))} left` };
  }

  const upperMs = lowerMs + gate;
  return {
    kind: 'range',
    lowerMs,
    upperMs,
    label: `${clock(Math.round(lowerMs / 1000))}–${clock(Math.round(upperMs / 1000))} left`,
  };
}
