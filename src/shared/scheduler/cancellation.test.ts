import { describe, it, expect } from 'vitest';
import { OperationCancelledError, createCancellation } from './cancellation';

describe('OperationCancelledError', () => {
  it('is an Error with a stable name and default message', () => {
    const err = new OperationCancelledError();
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(OperationCancelledError);
    expect(err.name).toBe('OperationCancelledError');
    expect(err.message).toBe('Operation cancelled');
  });

  it('accepts a custom message', () => {
    expect(new OperationCancelledError('stopped by user').message).toBe('stopped by user');
  });
});

describe('createCancellation', () => {
  it('starts un-cancelled and does not throw', () => {
    const token = createCancellation();
    expect(token.isCancelled).toBe(false);
    expect(() => token.throwIfCancelled()).not.toThrow();
  });

  it('throwIfCancelled throws OperationCancelledError once cancelled', () => {
    const token = createCancellation();
    token.cancel();
    expect(token.isCancelled).toBe(true);
    expect(() => token.throwIfCancelled()).toThrow(OperationCancelledError);
  });

  it('reset clears the cancelled flag so the token is reusable', () => {
    const token = createCancellation();
    token.cancel();
    token.reset();
    expect(token.isCancelled).toBe(false);
    expect(() => token.throwIfCancelled()).not.toThrow();
  });
});
