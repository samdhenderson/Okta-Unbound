import { z } from 'zod';

export const WARNING_THRESHOLD_ENDPOINT = '/api/v1/rate-limit-settings/warning-threshold';

export const WARNING_THRESHOLD_MARGIN = 5;

const MIN_PLAUSIBLE_THRESHOLD = 10;
const MAX_PLAUSIBLE_THRESHOLD = 100;

export const warningThresholdSchema = z.object({ warningThreshold: z.number() }).passthrough();

export function minRemainingFromWarningThreshold(warningThreshold: number): number {
  return 100 - (warningThreshold - WARNING_THRESHOLD_MARGIN);
}

export function parseWarningThreshold(data: unknown): number | null {
  const parsed = warningThresholdSchema.safeParse(data);
  if (!parsed.success) return null;

  const { warningThreshold } = parsed.data;
  if (!Number.isFinite(warningThreshold)) return null;
  if (warningThreshold < MIN_PLAUSIBLE_THRESHOLD) return null;
  if (warningThreshold > MAX_PLAUSIBLE_THRESHOLD) return null;
  return warningThreshold;
}
