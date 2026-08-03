import { describe, expect, it } from 'vitest';
import { buildRegistry, listDescriptors } from './registry';
import type { ExportApiDeps } from './types.deps';

const stubDeps: ExportApiDeps = {
  searchGroups: async () => [],
  searchApps: async () => [],
};

const populatedRow = {
  id: '00uFAKE',
  status: 'ACTIVE',
  created: '2024-01-01T00:00:00.000Z',
  activated: '2024-01-01T00:00:00.000Z',
  lastLogin: '2024-01-02T00:00:00.000Z',
  lastUpdated: '2024-01-03T00:00:00.000Z',
  name: 'Fake Entity',
  label: 'Fake Entity',
  type: 'OKTA_GROUP',
  scope: 'ACTIVE',
  registered: true,
  profile: {
    login: 'user@example.com',
    email: 'user@example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    department: 'Engineering',
    title: 'Engineer',
    manager: 'Grace Hopper',
    displayName: 'Fake Device',
    platform: 'MACOS',
    manufacturer: 'Apple',
    model: 'MacBook Pro',
    osVersion: '14.0',
    serialNumber: 'SN-FAKE',
    name: 'Fake Group',
    description: 'A fake group for tests',
  },
} as never;

const emptyRow = {} as never;

describe('export column catalogs', () => {
  const registry = buildRegistry(stubDeps);
  const descriptors = listDescriptors(registry);

  it('registers at least the core descriptors', () => {
    expect(descriptors.length).toBeGreaterThan(0);
  });

  for (const descriptor of descriptors) {
    describe(`${descriptor.id} columns`, () => {
      it('has a non-empty, well-formed column catalog', () => {
        expect(descriptor.columnCatalog.length).toBeGreaterThan(0);
        for (const column of descriptor.columnCatalog) {
          expect(typeof column.id).toBe('string');
          expect(typeof column.accessor).toBe('function');
        }
      });

      it('exercises every accessor and formatter without throwing', () => {
        for (const column of descriptor.columnCatalog) {
          for (const row of [populatedRow, emptyRow]) {
            const value = column.accessor(row);
            expect(() => column.accessor(row)).not.toThrow();
            if (column.format) {
              const formatted = column.format(value, row);
              expect(typeof formatted).toBe('string');
            }
          }
        }
      });
    });
  }
});
