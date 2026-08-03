export interface ThrottledRelayOptions<T> {
  intervalMs?: number;
  isUrgent?: (previous: T, next: T) => boolean;
}

const DEFAULT_INTERVAL_MS = 150;

export function createThrottledRelay<T>(
  send: (value: T) => void,
  options: ThrottledRelayOptions<T> = {},
): (value: T) => void {
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;

  let lastSent: T | undefined;
  let hasSent = false;
  let pending: T | undefined;
  let hasPending = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const doSend = (value: T): void => {
    lastSent = value;
    hasSent = true;
    pending = undefined;
    hasPending = false;
    send(value);
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(onWindowClosed, intervalMs);
  };

  const onWindowClosed = (): void => {
    timer = null;
    if (hasPending) {
      doSend(pending as T);
    }
  };

  return (value: T): void => {
    if (!hasSent || timer === null) {
      doSend(value);
      return;
    }
    if (options.isUrgent?.(lastSent as T, value)) {
      doSend(value);
      return;
    }
    pending = value;
    hasPending = true;
  };
}
