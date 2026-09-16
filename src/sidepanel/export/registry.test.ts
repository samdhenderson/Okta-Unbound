import { describe, it, expect, vi } from 'vitest';
import { buildRegistry, listDescriptors } from './registry';
import type { ExportApiDeps } from './types.deps';
import type { SelectionBasket, SelectionKind } from '@/sidepanel/selection/selectionStore';

const deps: ExportApiDeps = { searchGroups: vi.fn() };

function basketOf(kind: SelectionKind): SelectionBasket {
  return { picked: [{ kind, id: `00${kind}FAKE1`, name: 'Ticked', pickedAt: 0 }] };
}

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
        descriptor.endpoint !== undefined ||
        descriptor.context.kind === 'search-to-select' ||
        descriptor.context.kind === 'from-selection';
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

describe('from-selection availability', () => {
  const registry = buildRegistry(deps);

  it('registers the three selection-scoped descriptors', () => {
    expect(registry['users-selected']?.context.kind).toBe('from-selection');
    expect(registry['groups-selected']?.context.kind).toBe('from-selection');
    expect(registry['group-memberships-selected']?.context.kind).toBe('from-selection');
  });

  it('omits every from-selection descriptor when nothing is ticked', () => {
    const ids = listDescriptors(registry, { picked: [] }).map((d) => d.id);
    expect(ids).not.toContain('users-selected');
    expect(ids).not.toContain('groups-selected');
    expect(ids).not.toContain('group-memberships-selected');
  });

  it('omits them for a caller that passes no basket at all', () => {
    const ids = listDescriptors(registry).map((d) => d.id);
    expect(ids).not.toContain('users-selected');
  });

  it('lists only the descriptors whose partition is non-empty', () => {
    const userIds = listDescriptors(registry, basketOf('user')).map((d) => d.id);
    expect(userIds).toContain('users-selected');
    expect(userIds).not.toContain('groups-selected');
    expect(userIds).not.toContain('group-memberships-selected');

    const groupIds = listDescriptors(registry, basketOf('group')).map((d) => d.id);
    expect(groupIds).toContain('groups-selected');
    expect(groupIds).toContain('group-memberships-selected');
    expect(groupIds).not.toContain('users-selected');
  });

  it('never drops a whole-org or search-to-select descriptor for an empty basket', () => {
    const ids = listDescriptors(registry, { picked: [] }).map((d) => d.id);
    expect(ids).toContain('users');
    expect(ids).toContain('groups');
    expect(ids).toContain('group-memberships');
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
