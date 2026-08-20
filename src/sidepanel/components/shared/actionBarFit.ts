export interface FitInput {
  widths: readonly number[];
  compactWidths: readonly number[];
  available: number;
  gap: number;
  overflowWidth: number;
  pinned: number;
  tierAlwaysPresent: boolean;
  previous: number;
  hysteresis?: number;
}

export interface FitResult {
  inBar: number;
  compact: boolean;
}

function px(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}

function prefixSums(widths: readonly number[], length: number): number[] {
  const prefix: number[] = [0];
  for (let i = 0; i < length; i += 1) prefix.push(prefix[i] + px(widths[i]));
  return prefix;
}

export function fitActions(input: FitInput): FitResult {
  const n = Array.isArray(input.widths) ? input.widths.length : 0;
  const gap = px(input.gap);
  const available = px(input.available);
  const overflowWidth = px(input.overflowWidth);
  const hysteresis = px(input.hysteresis ?? gap);

  const pinned = Math.min(n, Math.max(0, Math.trunc(px(input.pinned))));
  const previous = Math.min(n, Math.max(0, Math.trunc(px(input.previous))));

  const naturalPrefix = prefixSums(input.widths, n);

  const required = (k: number, prefix: readonly number[]): number => {
    const needsControl = input.tierAlwaysPresent || k < n;
    const boxes = needsControl ? k + 1 : k;
    return prefix[k] + (needsControl ? overflowWidth : 0) + gap * Math.max(boxes - 1, 0);
  };

  const best = (prefix: readonly number[]): number => {
    for (let k = n; k > pinned; k -= 1) {
      const budget = available - (k > previous ? hysteresis : 0);
      if (required(k, prefix) <= budget) return k;
    }
    return pinned;
  };

  if (best(naturalPrefix) === n) return { inBar: n, compact: false };

  const measured = Array.isArray(input.compactWidths) ? input.compactWidths : [];
  const compactPrefix = prefixSums(
    Array.from({ length: n }, (_, i) => measured[i] ?? input.widths[i]),
    n,
  );

  return { inBar: best(compactPrefix), compact: true };
}
