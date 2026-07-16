export class OperationCancelledError extends Error {
  constructor(message = 'Operation cancelled') {
    super(message);
    this.name = 'OperationCancelledError';
    Object.setPrototypeOf(this, OperationCancelledError.prototype);
  }
}

export interface CancellationToken {
  readonly isCancelled: boolean;
  cancel: () => void;
  reset: () => void;
  throwIfCancelled: () => void;
}

export function createCancellation(): CancellationToken {
  let cancelled = false;
  return {
    get isCancelled() {
      return cancelled;
    },
    cancel() {
      cancelled = true;
    },
    reset() {
      cancelled = false;
    },
    throwIfCancelled() {
      if (cancelled) {
        throw new OperationCancelledError();
      }
    },
  };
}
