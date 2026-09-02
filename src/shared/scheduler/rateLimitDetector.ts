import { createLogger } from '../utils/logger';
import type { RateLimitInfo } from './types';

const log = createLogger('RateLimitDetector');

const API_V1_RESOURCE = /^\/api\/v1\/([^/]+)/;

function parseCount(value: string): number | null {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function bucketOf(endpoint: string): string {
  const path = endpoint.split('?')[0];
  const match = API_V1_RESOURCE.exec(path);
  return match ? `/api/v1/${match[1]}` : path;
}

export class RateLimitDetector {
  private limits: Map<string, RateLimitInfo> = new Map();
  private globalLimit: RateLimitInfo | null = null;

  parseHeaders(headers: Record<string, string>, endpoint: string): RateLimitInfo | null {
    const limit = headers['x-rate-limit-limit'];
    const remaining = headers['x-rate-limit-remaining'];
    const reset = headers['x-rate-limit-reset'];

    if (!limit || !remaining || !reset) {
      log.debug('Missing rate limit headers for', endpoint.split('?')[0]);
      return null;
    }

    const parsed = {
      limit: parseCount(limit),
      remaining: parseCount(remaining),
      reset: parseCount(reset),
    };

    if (parsed.limit === null || parsed.remaining === null || parsed.reset === null) {
      log.warn('Unreadable rate limit headers; leaving the bucket unobserved:', {
        endpoint: endpoint.split('?')[0],
        fields: (Object.keys(parsed) as Array<keyof typeof parsed>).filter(
          (field) => parsed[field] === null,
        ),
      });
      return null;
    }

    const bucket = bucketOf(endpoint);
    const info: RateLimitInfo = {
      limit: parsed.limit,
      remaining: parsed.remaining,
      reset: parsed.reset,
      endpoint,
      bucket,
      timestamp: Date.now(),
    };

    this.limits.set(bucket, info);

    if (!this.globalLimit || info.remaining < this.globalLimit.remaining) {
      this.globalLimit = info;
    }

    log.debug('Rate limit updated:', {
      bucket,
      remaining: info.remaining,
      limit: info.limit,
      resetIn: this.getSecondsUntilReset(info),
    });

    return info;
  }

  getMostRestrictive(): RateLimitInfo | null {
    this.cleanExpiredLimits();
    return this.globalLimit;
  }

  getForBucket(bucket: string): RateLimitInfo | null {
    const info = this.limits.get(bucket);
    if (!info) return null;

    if (this.isExpired(info)) {
      this.limits.delete(bucket);
      return null;
    }

    return info;
  }

  getForEndpoint(endpoint: string): RateLimitInfo | null {
    return this.getForBucket(bucketOf(endpoint));
  }

  isApproachingLimit(
    thresholdPercent: number = 10,
    inFlightCount: number = 0,
    bucket?: string,
  ): boolean {
    const info = bucket === undefined ? this.getMostRestrictive() : this.getForBucket(bucket);
    if (!info) return false;

    const effectiveRemaining = Math.max(0, info.remaining - inFlightCount);
    const percentRemaining = (effectiveRemaining / info.limit) * 100;
    const approaching = percentRemaining <= thresholdPercent;

    if (approaching) {
      log.warn('Approaching rate limit:', {
        bucket: info.bucket,
        remaining: info.remaining,
        limit: info.limit,
        percentRemaining: percentRemaining.toFixed(1) + '%',
        resetIn: this.getSecondsUntilReset(info),
      });
    }

    return approaching;
  }

  isLimitExceeded(bucket?: string): boolean {
    const info = bucket === undefined ? this.getMostRestrictive() : this.getForBucket(bucket);
    if (!info) return false;
    return info.remaining <= 0;
  }

  getSecondsUntilReset(info?: RateLimitInfo): number {
    const limit = info || this.getMostRestrictive();
    if (!limit) return 0;

    const nowSeconds = Math.floor(Date.now() / 1000);
    const secondsUntilReset = Math.max(0, limit.reset - nowSeconds);
    return secondsUntilReset;
  }

  getMillisecondsUntilReset(info?: RateLimitInfo): number {
    return this.getSecondsUntilReset(info) * 1000;
  }

  getRecommendedWaitTime(thresholdPercent: number = 10, inFlightCount: number = 0): number {
    if (!this.isApproachingLimit(thresholdPercent, inFlightCount)) {
      return 0;
    }

    const info = this.getMostRestrictive();
    if (!info) return 0;

    if (info.remaining <= 0) {
      return this.getMillisecondsUntilReset(info);
    }

    const secondsUntilReset = this.getSecondsUntilReset(info);
    const requestsRemaining = info.remaining;

    const safeDelaySeconds = secondsUntilReset / Math.max(requestsRemaining, 1);
    const safeDelayMs = Math.ceil(safeDelaySeconds * 1000);

    return Math.max(safeDelayMs, 1000);
  }

  private isExpired(info: RateLimitInfo): boolean {
    const nowSeconds = Math.floor(Date.now() / 1000);
    return nowSeconds >= info.reset;
  }

  private cleanExpiredLimits(): void {
    for (const [bucket, info] of this.limits.entries()) {
      if (this.isExpired(info)) {
        this.limits.delete(bucket);
      }
    }

    if (this.globalLimit && this.isExpired(this.globalLimit)) {
      this.globalLimit = null;
    }

    if (this.limits.size > 0) {
      let mostRestrictive: RateLimitInfo | null = null;
      for (const info of this.limits.values()) {
        if (!mostRestrictive || info.remaining < mostRestrictive.remaining) {
          mostRestrictive = info;
        }
      }
      this.globalLimit = mostRestrictive;
    }
  }

  reset(): void {
    this.limits.clear();
    this.globalLimit = null;
    log.debug('Reset all rate limit tracking');
  }

  getState(): {
    globalLimit: RateLimitInfo | null;
    bucketLimits: Array<{ bucket: string; info: RateLimitInfo }>;
  } {
    this.cleanExpiredLimits();

    return {
      globalLimit: this.globalLimit,
      bucketLimits: Array.from(this.limits.entries()).map(([bucket, info]) => ({
        bucket,
        info,
      })),
    };
  }
}
