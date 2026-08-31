import { OKTA_PAGE_SIZE } from '../utils/oktaPagination';
import type { PlanEstimate } from './plan';

export function pagesFor(itemCount: number): number {
  if (!Number.isFinite(itemCount) || itemCount <= 0) return 1;
  return Math.ceil(itemCount / OKTA_PAGE_SIZE);
}

export function walkEstimate(itemCount: number | null | undefined): PlanEstimate {
  if (itemCount === null || itemCount === undefined || !Number.isFinite(itemCount)) {
    return { kind: 'unknown' };
  }
  return { kind: 'exact', requests: pagesFor(itemCount) };
}

export function openingWalkEstimate(): PlanEstimate {
  return { kind: 'atLeast', requests: 1 };
}

export function refinedWalkEstimate(pagesFetched: number, hasMore: boolean): PlanEstimate {
  const fetched = Math.max(1, Math.floor(pagesFetched));
  return hasMore
    ? { kind: 'atLeast', requests: fetched + 1 }
    : { kind: 'exact', requests: fetched };
}

export function fanOutEstimate(itemCount: number, requestsPerItem = 1): PlanEstimate {
  if (!Number.isFinite(itemCount) || itemCount < 0) return { kind: 'unknown' };
  return { kind: 'exact', requests: Math.floor(itemCount) * Math.max(1, requestsPerItem) };
}

export function atLeastFanOutEstimate(itemCount: number, requestsPerItem = 1): PlanEstimate {
  const exact = fanOutEstimate(itemCount, requestsPerItem);
  return exact.kind === 'exact' ? { kind: 'atLeast', requests: exact.requests } : exact;
}
