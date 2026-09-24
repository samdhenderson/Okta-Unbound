import { afterEach, describe, expect, it, vi } from 'vitest';

async function hostWith(value: string | undefined) {
  vi.resetModules();
  if (value === undefined) vi.stubEnv('VITE_GUIDE_HOST', undefined as unknown as string);
  else vi.stubEnv('VITE_GUIDE_HOST', value);
  return import('./host');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('GUIDE_HOST', () => {
  it('is extension when the flag is unset', async () => {
    const { GUIDE_HOST, IS_HOSTED_GUIDE } = await hostWith(undefined);
    expect(GUIDE_HOST).toBe('extension');
    expect(IS_HOSTED_GUIDE).toBe(false);
  });

  it('is web only for the exact value the guide build defines', async () => {
    const { GUIDE_HOST, IS_HOSTED_GUIDE } = await hostWith('web');
    expect(GUIDE_HOST).toBe('web');
    expect(IS_HOSTED_GUIDE).toBe(true);
  });

  it('falls back to extension on any other value', async () => {
    const { GUIDE_HOST } = await hostWith('Web');
    expect(GUIDE_HOST).toBe('extension');
  });
});
