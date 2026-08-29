export type RequestPriority = 'interactive' | 'high' | 'normal' | 'low';
export type SchedulerStatus = 'idle' | 'processing' | 'throttled' | 'cooldown' | 'paused';

export interface QueuedRequest {
  id: string;
  endpoint: string;
  method: string;
  body?: unknown;
  priority: RequestPriority;
  tabId: number;
  timestamp: number;
  reason?: string;
  resolve: (response: RequestResult) => void;
  reject: (error: Error) => void;
  retryCount: number;
  maxRetries: number;
}

export interface RateLimitInfo {
  limit: number; // X-Rate-Limit-Limit
  remaining: number; // X-Rate-Limit-Remaining
  reset: number; // X-Rate-Limit-Reset (Unix timestamp in seconds)
  endpoint: string;
  timestamp: number;
}

export interface SchedulerConfig {
  maxConcurrent: number; // Max parallel requests
  minRemainingThreshold: number; // Trigger cooldown when remaining < this (percentage)
  cooldownDuration: number; // How long to pause when threshold hit (ms)
  retryDelay: number; // Base retry delay for failed requests (ms)
  maxRetries: number; // Max retry attempts per request
  requestTimeout: number; // Timeout for individual requests (ms)
}

export interface SchedulerState {
  status: SchedulerStatus;
  queueLength: number;
  activeRequests: number;
  totalProcessed: number;
  rateLimitInfo: RateLimitInfo | null;
  cooldownEndsAt: number | null; // Timestamp when cooldown ends
  errorCount: number;
  lastError: string | null;
}

export interface RequestSuccess {
  success: true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  headers?: Record<string, string>;
  status?: number;
  fromCache?: boolean;
}

export interface RequestFailure {
  success: false;
  status: number;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  headers?: Record<string, string>;
}

export type RequestResult = RequestSuccess | RequestFailure;

export interface SchedulerMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  retriedRequests: number;
  cacheHits: number;
  coalescedRequests: number;
  averageWaitTime: number;
  averageExecutionTime: number;
  cooldownEvents: number;
  throttleEvents: number;
}
