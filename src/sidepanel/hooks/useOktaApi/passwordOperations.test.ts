import { describe, it, expect, vi } from 'vitest';
import { createPasswordOperations } from './passwordOperations';
import type { CoreApi } from './core';
import { makeFakeCore } from '@/test/factories/coreApi';

const FAKE_PASSWORD = 'not-a-real-password-FAKE';

const makeCore = (overrides: Partial<CoreApi> = {}): CoreApi =>
  makeFakeCore({
    makeApiRequest: vi.fn().mockResolvedValue({ success: true, data: {} }),
    ...overrides,
  });

const validUser = (overrides: Record<string, unknown> = {}) => ({
  id: '00uFAKE1',
  status: 'ACTIVE',
  profile: {
    login: 'jane@example.com',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
  },
  ...overrides,
});

describe('setUserPassword', () => {
  it('posts the credential body to the user endpoint', async () => {
    const makeApiRequest = vi.fn().mockResolvedValue({ success: true, data: validUser() });
    const { setUserPassword } = createPasswordOperations(makeCore({ makeApiRequest }));

    const result = await setUserPassword('00uFAKE1', FAKE_PASSWORD);

    expect(makeApiRequest).toHaveBeenCalledWith('/api/v1/users/00uFAKE1', {
      method: 'POST',
      body: { credentials: { password: { value: FAKE_PASSWORD } } },
      reason: 'Set user password',
    });
    expect(result).toEqual({ kind: 'saved', user: expect.objectContaining({ id: '00uFAKE1' }) });
  });

  it('refuses an empty value without issuing a request', async () => {
    const makeApiRequest = vi.fn();
    const { setUserPassword } = createPasswordOperations(makeCore({ makeApiRequest }));

    await expect(setUserPassword('00uFAKE1', '')).rejects.toThrow(/empty password/i);
    expect(makeApiRequest).not.toHaveBeenCalled();
  });

  it("passes Okta's own rejection message through, because it names the policy rule", async () => {
    const makeApiRequest = vi.fn().mockResolvedValue({
      success: false,
      error: 'Password requirements were not met. Password must contain a number.',
    });
    const { setUserPassword } = createPasswordOperations(makeCore({ makeApiRequest }));

    const result = await setUserPassword('00uFAKE1', FAKE_PASSWORD);

    expect(result).toEqual({
      kind: 'failed',
      error: 'Password requirements were not met. Password must contain a number.',
    });
  });

  it("reports 'unknown' when the call throws, because the write may have applied", async () => {
    const makeApiRequest = vi.fn().mockRejectedValue(new Error('port closed'));
    const { setUserPassword } = createPasswordOperations(makeCore({ makeApiRequest }));

    const result = await setUserPassword('00uFAKE1', FAKE_PASSWORD);

    expect(result.kind).toBe('unknown');
  });

  it("reports 'unknown' when Okta accepts but returns an unreadable user", async () => {
    const makeApiRequest = vi
      .fn()
      .mockResolvedValue({ success: true, data: { nothing: 'useful' } });
    const { setUserPassword } = createPasswordOperations(makeCore({ makeApiRequest }));

    const result = await setUserPassword('00uFAKE1', FAKE_PASSWORD);

    expect(result.kind).toBe('unknown');
  });

  it('never carries the password back in the result', async () => {
    const makeApiRequest = vi.fn().mockResolvedValue({ success: true, data: validUser() });
    const { setUserPassword } = createPasswordOperations(makeCore({ makeApiRequest }));

    const result = await setUserPassword('00uFAKE1', FAKE_PASSWORD);

    expect(JSON.stringify(result)).not.toContain(FAKE_PASSWORD);
  });

  it('never carries the password back on the failure arm either', async () => {
    const makeApiRequest = vi.fn().mockResolvedValue({ success: false, error: 'rejected' });
    const { setUserPassword } = createPasswordOperations(makeCore({ makeApiRequest }));

    const result = await setUserPassword('00uFAKE1', FAKE_PASSWORD);

    expect(JSON.stringify(result)).not.toContain(FAKE_PASSWORD);
  });
});

describe('expirePassword', () => {
  it('posts to the expire_password lifecycle endpoint with no body', async () => {
    const makeApiRequest = vi.fn().mockResolvedValue({ success: true, data: validUser() });
    const { expirePassword } = createPasswordOperations(makeCore({ makeApiRequest }));

    const result = await expirePassword('00uFAKE1');

    expect(makeApiRequest).toHaveBeenCalledWith(
      '/api/v1/users/00uFAKE1/lifecycle/expire_password',
      { method: 'POST', reason: 'Expire user password' },
    );
    expect(result.kind).toBe('saved');
  });

  it('never reports a temporary password', async () => {
    const makeApiRequest = vi
      .fn()
      .mockResolvedValue({ success: true, data: validUser({ tempPassword: 'ignored-FAKE' }) });
    const { expirePassword } = createPasswordOperations(makeCore({ makeApiRequest }));

    const result = await expirePassword('00uFAKE1');

    expect(result.kind).toBe('saved');
    expect(JSON.stringify(result)).not.toContain('ignored-FAKE');
  });
});

describe('expirePasswordWithTempPassword', () => {
  it('returns the temporary password Okta generated', async () => {
    const makeApiRequest = vi.fn().mockResolvedValue({
      success: true,
      data: validUser({ status: 'PASSWORD_EXPIRED', tempPassword: 'TempFAKE123' }),
    });
    const { expirePasswordWithTempPassword } = createPasswordOperations(
      makeCore({ makeApiRequest }),
    );

    const result = await expirePasswordWithTempPassword('00uFAKE1');

    expect(makeApiRequest).toHaveBeenCalledWith(
      '/api/v1/users/00uFAKE1/lifecycle/expire_password_with_temp_password',
      { method: 'POST', reason: 'Expire password with temporary password' },
    );
    expect(result).toEqual({
      kind: 'saved-with-temp',
      user: expect.objectContaining({ status: 'PASSWORD_EXPIRED' }),
      tempPassword: 'TempFAKE123',
    });
  });

  it('lifts the value off the raw body, which the schema would have stripped', async () => {
    const makeApiRequest = vi.fn().mockResolvedValue({
      success: true,
      data: validUser({ tempPassword: 'TempFAKE123', credentials: { password: {} } }),
    });
    const { expirePasswordWithTempPassword } = createPasswordOperations(
      makeCore({ makeApiRequest }),
    );

    const result = await expirePasswordWithTempPassword('00uFAKE1');

    expect(result.kind).toBe('saved-with-temp');
    if (result.kind === 'saved-with-temp') {
      expect(JSON.stringify(result.user)).not.toContain('TempFAKE123');
    }
  });

  it("reports 'unknown' when Okta accepts but names no temporary password", async () => {
    const makeApiRequest = vi.fn().mockResolvedValue({ success: true, data: validUser() });
    const { expirePasswordWithTempPassword } = createPasswordOperations(
      makeCore({ makeApiRequest }),
    );

    const result = await expirePasswordWithTempPassword('00uFAKE1');

    expect(result.kind).toBe('unknown');
  });

  it("reports 'unknown' when the temporary password is not a string", async () => {
    const makeApiRequest = vi
      .fn()
      .mockResolvedValue({ success: true, data: validUser({ tempPassword: 12345 }) });
    const { expirePasswordWithTempPassword } = createPasswordOperations(
      makeCore({ makeApiRequest }),
    );

    const result = await expirePasswordWithTempPassword('00uFAKE1');

    expect(result.kind).toBe('unknown');
  });
});
