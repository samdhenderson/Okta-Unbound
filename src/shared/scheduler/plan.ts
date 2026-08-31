import { createLogger } from '../utils/logger';

const log = createLogger('PlanRegistry');

export type PlanEstimate =
  { kind: 'exact'; requests: number } | { kind: 'atLeast'; requests: number } | { kind: 'unknown' };

export interface PlanLeg {
  id: string;
  bucket: string;
  method: string;
  estimate: PlanEstimate;
  spent: number;
}

export type PlanStatus = 'active' | 'done' | 'cancelled';

export interface OperationPlan {
  id: string;
  name: string;
  tabId: number;
  legs: PlanLeg[];
  startedAt: number;
  status: PlanStatus;
}

export interface PlanLegSummary {
  id: string;
  bucket: string;
  method: string;
  estimated: number | null;
  spent: number;
  remaining: number | null;
  approximate: boolean;
}

export interface PlanSummary {
  id: string;
  name: string;
  startedAt: number;
  legs: PlanLegSummary[];
  spent: number;
  estimated: number | null;
  remaining: number | null;
  approximate: boolean;
}

export const PLAN_STALE_MS = 5 * 60 * 1000;

export const MAX_TRACKED_PLANS = 32;

export const MAX_LEGS_PER_PLAN = 16;

export interface PlanLegInput {
  endpoint: string;
  method?: string;
  estimate: PlanEstimate;
}

export interface PlanDeclaration {
  id: string;
  name: string;
  tabId: number;
  legs: PlanLegInput[];
}

function normalizeEstimate(estimate: PlanEstimate): PlanEstimate {
  if (estimate.kind === 'unknown') return estimate;
  if (!Number.isFinite(estimate.requests) || estimate.requests < 0) {
    return { kind: 'unknown' };
  }
  return { kind: estimate.kind, requests: Math.floor(estimate.requests) };
}

export class PlanRegistry {
  private plans: Map<string, OperationPlan> = new Map();
  private touchedAt: Map<string, number> = new Map();
  private legSeq = 0;

  constructor(private readonly bucketFor: (endpoint: string) => string) {}

  declare(declaration: PlanDeclaration): OperationPlan | null {
    const existing = this.plans.get(declaration.id);
    if (existing) return existing;

    this.reap();

    if (this.plans.size >= MAX_TRACKED_PLANS) {
      log.warn('Refusing to track another plan; at capacity', { tracked: this.plans.size });
      return null;
    }

    const legs = declaration.legs.slice(0, MAX_LEGS_PER_PLAN).map((input) => ({
      id: `leg-${++this.legSeq}`,
      bucket: this.bucketFor(input.endpoint),
      method: (input.method ?? 'GET').toUpperCase(),
      estimate: normalizeEstimate(input.estimate),
      spent: 0,
    }));

    if (legs.length === 0) return null;

    const plan: OperationPlan = {
      id: declaration.id,
      name: declaration.name,
      tabId: declaration.tabId,
      legs,
      startedAt: Date.now(),
      status: 'active',
    };

    this.plans.set(plan.id, plan);
    this.touchedAt.set(plan.id, plan.startedAt);
    log.debug('Plan declared', { name: plan.name, legs: legs.length });
    return plan;
  }

  refine(planId: string, endpoint: string, estimate: PlanEstimate): void {
    const plan = this.plans.get(planId);
    if (!plan || plan.status !== 'active') return;

    const bucket = this.bucketFor(endpoint);
    const leg = plan.legs.find((candidate) => candidate.bucket === bucket);
    if (!leg) return;

    leg.estimate = normalizeEstimate(estimate);
    this.touchedAt.set(planId, Date.now());
  }

  attribute(planId: string, endpoint: string): void {
    const plan = this.plans.get(planId);
    if (!plan || plan.status !== 'active') return;

    const bucket = this.bucketFor(endpoint);
    let leg = plan.legs.find((candidate) => candidate.bucket === bucket);

    if (!leg) {
      if (plan.legs.length >= MAX_LEGS_PER_PLAN) return;
      leg = {
        id: `leg-${++this.legSeq}`,
        bucket,
        method: 'GET',
        estimate: { kind: 'unknown' },
        spent: 0,
      };
      plan.legs.push(leg);
    }

    leg.spent++;
    this.touchedAt.set(planId, Date.now());
  }

  complete(planId: string): void {
    this.settle(planId, 'done');
  }

  cancel(planId: string): void {
    this.settle(planId, 'cancelled');
  }

  private settle(planId: string, status: PlanStatus): void {
    const plan = this.plans.get(planId);
    if (!plan) return;
    plan.status = status;
    this.plans.delete(planId);
    this.touchedAt.delete(planId);
    log.debug('Plan settled', { name: plan.name, status, spent: totalSpent(plan) });
  }

  has(planId: string): boolean {
    return this.plans.get(planId)?.status === 'active';
  }

  plannedForBucket(bucket: string): number {
    let planned = 0;
    for (const plan of this.plans.values()) {
      if (plan.status !== 'active') continue;
      for (const leg of plan.legs) {
        if (leg.bucket !== bucket) continue;
        planned += remainingFor(leg) ?? 0;
      }
    }
    return planned;
  }

  plannedBuckets(): Set<string> {
    const buckets = new Set<string>();
    for (const plan of this.plans.values()) {
      if (plan.status !== 'active') continue;
      for (const leg of plan.legs) buckets.add(leg.bucket);
    }
    return buckets;
  }

  summarize(): PlanSummary[] {
    this.reap();

    return [...this.plans.values()]
      .filter((plan) => plan.status === 'active')
      .sort((a, b) => a.startedAt - b.startedAt)
      .map((plan) => {
        const legs = plan.legs.map(summarizeLeg);
        const sized = legs.filter((leg) => leg.estimated !== null);
        const estimated = sized.length > 0 ? sized.reduce((n, leg) => n + leg.estimated!, 0) : null;
        const spent = totalSpent(plan);

        return {
          id: plan.id,
          name: plan.name,
          startedAt: plan.startedAt,
          legs,
          spent,
          estimated,
          remaining: estimated === null ? null : Math.max(0, estimated - spent),
          approximate: legs.some((leg) => leg.approximate || leg.estimated === null),
        };
      });
  }

  reap(now: number = Date.now()): void {
    for (const [planId, touched] of [...this.touchedAt.entries()]) {
      if (now - touched < PLAN_STALE_MS) continue;
      const plan = this.plans.get(planId);
      log.debug('Reaping stale plan', { name: plan?.name });
      this.plans.delete(planId);
      this.touchedAt.delete(planId);
    }
  }

  reset(): void {
    this.plans.clear();
    this.touchedAt.clear();
  }
}

function remainingFor(leg: PlanLeg): number | null {
  if (leg.estimate.kind === 'unknown') return null;
  return Math.max(0, leg.estimate.requests - leg.spent);
}

function summarizeLeg(leg: PlanLeg): PlanLegSummary {
  const estimated = leg.estimate.kind === 'unknown' ? null : leg.estimate.requests;
  return {
    id: leg.id,
    bucket: leg.bucket,
    method: leg.method,
    estimated,
    spent: leg.spent,
    remaining: remainingFor(leg),
    approximate: leg.estimate.kind !== 'exact',
  };
}

function totalSpent(plan: OperationPlan): number {
  return plan.legs.reduce((n, leg) => n + leg.spent, 0);
}
