import { describe, it, expect, vi } from 'vitest';
import { buildRegistry, listDescriptors } from './registry';
import type { ExportApiDeps } from './types.deps';

const deps: ExportApiDeps = { searchGroups: vi.fn() };

describe('buildRegistry', () => {
  it('includes the users descriptor keyed by its id', () => {
    const registry = buildRegistry(deps);

    expect(registry['users']).toBeDefined();
    expect(registry['users'].id).toBe('users');
    expect(registry['users'].displayName).toBe('Users');
  });

  it('keys every descriptor by its own id', () => {
    const registry = buildRegistry(deps);
    for (const [key, descriptor] of Object.entries(registry)) {
      expect(descriptor.id).toBe(key);
    }
  });
});

describe('row-acquisition invariant', () => {
  it('resolves every descriptor exactly one way', () => {
    for (const descriptor of Object.values(buildRegistry(deps))) {
      const isSnapshot = descriptor.source?.kind === 'snapshot';
      const namesAnEndpoint =
        descriptor.endpoint !== undefined || descriptor.context.kind === 'search-to-select';
      expect(isSnapshot).not.toBe(namesAnEndpoint);
    }
  });

  it('leaves every endpoint descriptor with no source at all', () => {
    const endpointDescriptors = Object.values(buildRegistry(deps)).filter(
      (descriptor) => descriptor.source?.kind !== 'snapshot',
    );

    expect(endpointDescriptors.length).toBeGreaterThan(0);
    expect(endpointDescriptors.every((descriptor) => descriptor.source === undefined)).toBe(true);
  });

  it('registers the three report descriptors from one module', () => {
    const registry = buildRegistry(deps);

    expect(registry['report-group-cleanup']?.source?.kind).toBe('snapshot');
    expect(registry['report-unmaintained-app-access']?.source?.kind).toBe('snapshot');
    expect(registry['report-dormant-app-access']?.source?.kind).toBe('snapshot');
  });
});

describe('listDescriptors', () => {
  it('returns the descriptors sorted by display name', () => {
    const registry = buildRegistry(deps);
    const list = listDescriptors(registry);

    expect(list.length).toBeGreaterThan(0);
    const names = list.map((d) => d.displayName);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
});
