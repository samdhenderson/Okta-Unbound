import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render } from '@testing-library/react';
import type { UseOrgSnapshotResult } from '../cache/useOrgSnapshot';

const useOrgSnapshot = vi.fn();
vi.mock('../cache/useOrgSnapshot', () => ({
  useOrgSnapshot: (...args: unknown[]) => useOrgSnapshot(...args),
}));

vi.mock('../hooks/useOktaApi', () => ({
  useOktaApi: () => ({}),
}));

const { OrgEntityIndexProvider, useOrgEntityIndex } = await import('./OrgEntityIndexContext');
const { default: HomeTab } = await import('../components/HomeTab');
const { default: CommandPalette } = await import('../components/CommandPalette');

const ORIGIN = 'https://example.okta.com';

const COLLECTIONS = ['groups', 'rules', 'apps', 'appGroups'];

function emptySnapshot(): UseOrgSnapshotResult<never> {
  return {
    rows: [],
    records: [],
    isReading: false,
    complete: true,
    lastFullWalkAt: 1,
    isSyncing: false,
    lastError: null,
    lastStatus: null,
    refresh: vi.fn(),
  } as unknown as UseOrgSnapshotResult<never>;
}

const requested = (): string[] => useOrgSnapshot.mock.calls.map((call) => call[0] as string);

beforeEach(() => {
  useOrgSnapshot.mockReset();
  const handles = new Map<string, UseOrgSnapshotResult<never>>();
  useOrgSnapshot.mockImplementation((collection: string) => {
    const held = handles.get(collection) ?? emptySnapshot();
    handles.set(collection, held);
    return held;
  });
});

async function renderShell({ enabled = true }: { enabled?: boolean } = {}) {
  await act(async () => {
    render(
      <OrgEntityIndexProvider oktaOrigin={ORIGIN} targetTabId={1} enabled={enabled}>
        <HomeTab
          isActive
          targetTabId={1}
          oktaOrigin={ORIGIN}
          onOpenListView={vi.fn()}
          onOpenTab={vi.fn()}
          onScanGroupMfa={vi.fn()}
        />
        <CommandPalette
          isOpen={false}
          onClose={vi.fn()}
          activeTab="home"
          onSelect={vi.fn()}
          targetTabId={1}
          oktaOrigin={ORIGIN}
        />
      </OrgEntityIndexProvider>,
    );
  });
}

describe('OrgEntityIndexProvider', () => {
  it('opens one set of snapshot reads for Home and the palette together', async () => {
    await renderShell();

    expect(requested().sort()).toEqual([...COLLECTIONS].sort());
    for (const collection of COLLECTIONS) {
      expect(requested().filter((name) => name === collection)).toHaveLength(1);
    }
  });

  it('scopes every read to the provider’s origin and tab', async () => {
    await renderShell();

    for (const call of useOrgSnapshot.mock.calls) {
      expect(call[1]).toBe(ORIGIN);
      expect(call[2]).toBe(1);
    }
  });

  it('passes its own enabled through, so a closed palette on a hidden Home syncs nothing', async () => {
    await renderShell({ enabled: false });

    for (const call of useOrgSnapshot.mock.calls) {
      expect(call[3]).toEqual({ enabled: false });
    }
  });
});

describe('useOrgEntityIndex', () => {
  it('throws outside a provider rather than answering from an empty index', () => {
    const Consumer = () => {
      useOrgEntityIndex();
      return null;
    };
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow(/OrgEntityIndexProvider/);
    consoleError.mockRestore();
  });
});
