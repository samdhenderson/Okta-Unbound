export interface BatchProgress {
  total: number;
  completed: number;
  active: number;
  failed: number;
}

export interface BatchItemResult<T, R> {
  item: T;
  index: number;
  status: 'fulfilled' | 'rejected' | 'skipped';
  value?: R;
  error?: unknown;
}

export interface RunBatchOptions<T> {
  concurrency?: number;
  throwIfCancelled?: () => void;
  onProgress?: (progress: BatchProgress) => void;
  stopOnError?: (error: unknown, item: T, index: number) => boolean;
}

export interface BatchOutcome<T, R> {
  results: BatchItemResult<T, R>[];
  total: number;
  completed: number;
  failed: number;
  skipped: number;
  stoppedByError: boolean;
  cancelled: boolean;
}

export async function runBatch<T, R>(
  items: T[],
  task: (item: T, index: number) => Promise<R>,
  options: RunBatchOptions<T> = {},
): Promise<BatchOutcome<T, R>> {
  const { concurrency = 5, throwIfCancelled, onProgress, stopOnError } = options;
  const total = items.length;

  const results: BatchItemResult<T, R>[] = items.map((item, index) => ({
    item,
    index,
    status: 'skipped',
  }));

  let completed = 0;
  let failed = 0;
  let active = 0;
  let next = 0;
  let halted = false; // stopOnError requested a halt
  let cancelled = false;

  const report = () => onProgress?.({ total, completed, active, failed });

  const shouldStop = (): boolean => {
    if (halted) return true;
    if (throwIfCancelled) {
      try {
        throwIfCancelled();
      } catch {
        cancelled = true;
        return true;
      }
    }
    return false;
  };

  async function worker(): Promise<void> {
    for (;;) {
      if (shouldStop()) return;
      const index = next;
      if (index >= total) return;
      next += 1;

      const item = items[index];
      active += 1;
      report();

      try {
        const value = await task(item, index);
        results[index] = { item, index, status: 'fulfilled', value };
        completed += 1;
      } catch (error) {
        results[index] = { item, index, status: 'rejected', error };
        failed += 1;
        if (stopOnError?.(error, item, index)) {
          halted = true;
        }
      } finally {
        active -= 1;
        report();
      }
    }
  }

  const workerCount = Math.max(1, Math.min(concurrency, total));
  report(); // initial 0/total snapshot
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  const skipped = total - completed - failed;
  return { results, total, completed, failed, skipped, stoppedByError: halted, cancelled };
}
