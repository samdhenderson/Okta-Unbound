import { RateLimitDetector } from './rateLimitDetector';
import type {
  QueuedRequest,
  RequestPriority,
  SchedulerStatus,
  SchedulerConfig,
  SchedulerState,
  SchedulerMetrics,
  RequestResult,
  RateLimitInfo,
} from './types';

const DEFAULT_CONFIG: SchedulerConfig = {
  maxConcurrent: 5, // Max 5 parallel requests
  minRemainingThreshold: 10, // Cooldown when <10% remaining
  cooldownDuration: 30000, // 30 seconds cooldown fallback
  retryDelay: 2000, // 2 second base retry delay
  maxRetries: 2, // Retry up to 2 times
  requestTimeout: 30000, // 30 second timeout per request
};

export class ApiScheduler {
  private queue: QueuedRequest[] = [];
  private activeRequests: Map<string, QueuedRequest> = new Map();
  private rateLimitDetector: RateLimitDetector;
  private config: SchedulerConfig;
  private status: SchedulerStatus = 'idle';
  private cooldownEndsAt: number | null = null;
  private isPaused: boolean = false;
  private processingInterval: ReturnType<typeof setInterval> | null = null;

  private metrics: SchedulerMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    retriedRequests: 0,
    cacheHits: 0,
    averageWaitTime: 0,
    averageExecutionTime: 0,
    cooldownEvents: 0,
    throttleEvents: 0,
  };

  private lastError: string | null = null;
  private stateListeners: Set<(state: SchedulerState) => void> = new Set();

  constructor(config: Partial<SchedulerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.rateLimitDetector = new RateLimitDetector();

    console.log('[ApiScheduler] Initialized with config:', this.config);

    this.startProcessing();
  }

  async scheduleRequest(
    endpoint: string,
    method: string,
    body: any | undefined,
    tabId: number,
    priority: RequestPriority = 'normal',
  ): Promise<RequestResult> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: this.generateRequestId(),
        endpoint,
        method,
        body,
        priority,
        tabId,
        timestamp: Date.now(),
        resolve: (result: RequestResult) => resolve(result),
        reject,
        retryCount: 0,
        maxRetries: this.config.maxRetries,
      };

      this.addToQueue(request);
      this.metrics.totalRequests++;
      this.notifyStateChange();

      console.log('[ApiScheduler] Scheduled request:', {
        id: request.id,
        endpoint,
        method,
        priority,
        queueLength: this.queue.length,
      });
    });
  }

  private addToQueue(request: QueuedRequest): void {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    const requestPriorityValue = priorityOrder[request.priority];

    let insertIndex = this.queue.length;
    for (let i = 0; i < this.queue.length; i++) {
      if (priorityOrder[this.queue[i].priority] > requestPriorityValue) {
        insertIndex = i;
        break;
      }
    }

    this.queue.splice(insertIndex, 0, request);
  }

  private startProcessing(): void {
    if (this.processingInterval) return;

    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, 50);

    console.log('[ApiScheduler] Started processing loop');
  }

  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    console.log('[ApiScheduler] Stopped processing loop');
  }

  private async processQueue(): Promise<void> {
    if (this.isPaused) {
      this.updateStatus('paused');
      return;
    }

    if (this.cooldownEndsAt && Date.now() < this.cooldownEndsAt) {
      this.updateStatus('cooldown');
      return;
    } else if (this.cooldownEndsAt) {
      console.log('[ApiScheduler] Cooldown ended, resuming processing');
      this.cooldownEndsAt = null;
    }

    if (this.activeRequests.size >= this.config.maxConcurrent) {
      this.updateStatus('processing');
      return;
    }

    if (
      this.rateLimitDetector.isApproachingLimit(
        this.config.minRemainingThreshold,
        this.activeRequests.size,
      )
    ) {
      this.enterCooldown();
      return;
    }

    const request = this.queue.shift();
    if (!request) {
      this.updateStatus('idle');
      return;
    }

    this.updateStatus('processing');
    this.executeRequest(request);
  }

  private async executeRequest(request: QueuedRequest): Promise<void> {
    this.activeRequests.set(request.id, request);
    const startTime = Date.now();

    try {
      console.log('[ApiScheduler] Executing request:', {
        id: request.id,
        endpoint: request.endpoint,
        method: request.method,
        attempt: request.retryCount + 1,
      });

      const result = await this.makeApiCall(request);

      if (result.headers) {
        const rateLimitInfo = this.rateLimitDetector.parseHeaders(result.headers, request.endpoint);

        if (rateLimitInfo && this.shouldEnterCooldown(rateLimitInfo)) {
          this.enterCooldown();
        }
      }

      const executionTime = Date.now() - startTime;
      this.updateAverageExecutionTime(executionTime);

      this.metrics.successfulRequests++;
      this.activeRequests.delete(request.id);
      request.resolve(result);

      console.log('[ApiScheduler] Request completed:', {
        id: request.id,
        success: result.success,
        executionTime: `${executionTime}ms`,
      });
    } catch (error) {
      console.error('[ApiScheduler] Request failed:', {
        id: request.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        attempt: request.retryCount + 1,
      });

      if (request.retryCount < request.maxRetries) {
        await this.retryRequest(request, error);
      } else {
        this.metrics.failedRequests++;
        this.lastError = error instanceof Error ? error.message : 'Unknown error';
        this.activeRequests.delete(request.id);
        request.reject(error instanceof Error ? error : new Error('Request failed'));
      }
    } finally {
      this.notifyStateChange();
    }
  }

  private async makeApiCall(request: QueuedRequest): Promise<RequestResult> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, this.config.requestTimeout);

      chrome.tabs
        .sendMessage(request.tabId, {
          action: 'makeApiRequest',
          endpoint: request.endpoint,
          method: request.method,
          body: request.body,
        })
        .then((response) => {
          clearTimeout(timeout);
          resolve(response);
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  private async retryRequest(request: QueuedRequest, _error: any): Promise<void> {
    request.retryCount++;
    this.metrics.retriedRequests++;

    const backoffDelay = this.config.retryDelay * Math.pow(2, request.retryCount - 1);

    console.log('[ApiScheduler] Retrying request:', {
      id: request.id,
      attempt: request.retryCount + 1,
      maxRetries: request.maxRetries,
      delayMs: backoffDelay,
    });

    await new Promise((resolve) => setTimeout(resolve, backoffDelay));

    this.activeRequests.delete(request.id);
    request.priority = 'high';
    this.addToQueue(request);
  }

  private shouldEnterCooldown(info: RateLimitInfo): boolean {
    const effectiveRemaining = Math.max(0, info.remaining - this.activeRequests.size);
    const percentRemaining = (effectiveRemaining / info.limit) * 100;
    return percentRemaining <= this.config.minRemainingThreshold;
  }

  private enterCooldown(): void {
    const info = this.rateLimitDetector.getMostRestrictive();
    if (!info) return;

    const resetWaitTime = this.rateLimitDetector.getMillisecondsUntilReset(info);
    const cooldownDuration =
      resetWaitTime > 0
        ? Math.min(this.config.cooldownDuration, resetWaitTime)
        : this.config.cooldownDuration;

    this.cooldownEndsAt = Date.now() + cooldownDuration;
    this.metrics.cooldownEvents++;

    console.warn('[ApiScheduler] Entering cooldown mode:', {
      remaining: info.remaining,
      limit: info.limit,
      cooldownDuration: `${Math.ceil(cooldownDuration / 1000)}s`,
      endsAt: new Date(this.cooldownEndsAt).toISOString(),
    });

    this.updateStatus('cooldown');
    this.notifyStateChange();
  }

  pause(): void {
    this.isPaused = true;
    this.updateStatus('paused');
    console.log('[ApiScheduler] Paused');
  }

  resume(): void {
    this.isPaused = false;
    console.log('[ApiScheduler] Resumed');
  }

  private updateStatus(status: SchedulerStatus): void {
    if (this.status !== status) {
      this.status = status;
      console.log('[ApiScheduler] Status changed:', status);
    }
  }

  getState(): SchedulerState {
    return {
      status: this.status,
      queueLength: this.queue.length,
      activeRequests: this.activeRequests.size,
      totalProcessed: this.metrics.successfulRequests + this.metrics.failedRequests,
      rateLimitInfo: this.rateLimitDetector.getMostRestrictive(),
      cooldownEndsAt: this.cooldownEndsAt,
      errorCount: this.metrics.failedRequests,
      lastError: this.lastError,
    };
  }

  getMetrics(): SchedulerMetrics {
    return { ...this.metrics };
  }

  onStateChange(listener: (state: SchedulerState) => void): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  private notifyStateChange(): void {
    const state = this.getState();
    this.stateListeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        console.error('[ApiScheduler] Error in state listener:', error);
      }
    });
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateAverageExecutionTime(executionTime: number): void {
    const total = this.metrics.successfulRequests + this.metrics.failedRequests;
    const currentAvg = this.metrics.averageExecutionTime;
    this.metrics.averageExecutionTime = (currentAvg * (total - 1) + executionTime) / total;
  }

  getQueueDepth(): number {
    return this.queue.length + this.activeRequests.size;
  }

  clearQueue(): void {
    const queueLength = this.queue.length;
    this.queue = [];
    console.log(`[ApiScheduler] Cleared ${queueLength} requests from queue`);
    this.notifyStateChange();
  }

  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      retriedRequests: 0,
      cacheHits: 0,
      averageWaitTime: 0,
      averageExecutionTime: 0,
      cooldownEvents: 0,
      throttleEvents: 0,
    };
    console.log('[ApiScheduler] Metrics reset');
  }
}
