import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import UserComparisonPanel from './UserComparisonPanel';
import { DEFAULT_PROFILE_DISPLAY_CONFIG } from '../../../shared/storage/profileDisplayStore';
import type { UserComparisonState } from '../../hooks/useUserComparison';
import type { OktaUser } from '../../../shared/types';

vi.mock('../../hooks/useUserComparison', () => ({
  useUserComparison: () => comparisonState(),
}));

const contextUser: OktaUser = {
  id: 'ctx-1',
  status: 'ACTIVE',
  profile: {
    login: 'alice@example.com',
    email: 'alice@example.com',
    firstName: 'Alice',
    lastName: 'Context',
  },
};

const idleSide = (
  key: 'context' | 'compared',
): UserComparisonState['attributeEdit']['context'] => ({
  key,
  userName: 'Alice Context',
  cells: {},
  isEditing: false,
  isSaving: false,
  hasChanges: false,
  hasInvalid: false,
  canEdit: false,
  begin: vi.fn(),
  cancel: vi.fn(),
  requestSave: vi.fn(),
});

function comparisonState(): UserComparisonState {
  return {
    comparedUser: null,
    searchQuery: '',
    setSearchQuery: vi.fn(),
    searchResults: [],
    isSearching: false,
    activeTab: 'overview',
    setActiveTab: vi.fn(),
    groupBuckets: { onlyCompared: [], shared: [], onlyContext: [] },
    appBuckets: { onlyCompared: [], shared: [], onlyContext: [] },
    causes: undefined,
    groupDiffCount: 0,
    appDiffCount: 0,
    attributeParity: { rows: [], hiddenRows: [], hiddenDifferences: 0, differenceCount: 0 },
    attributeDiffCount: 0,
    attributeConfig: DEFAULT_PROFILE_DISPLAY_CONFIG,
    attributeRuleReads: {},
    attributeEdit: {
      context: idleSide('context'),
      compared: idleSide('compared'),
      pendingSave: null,
    },
    groupSimilarity: 0,
    appSimilarity: 0,
    overallSimilarity: 0,
    similarityScope: 'both',
    appsIncomplete: false,
    isLoading: false,
    loadError: null,
    addingGroupId: null,
    addError: null,
    setAddError: vi.fn(),
    addToContext: vi.fn(),
    addToCompared: vi.fn(),
    contextName: 'Alice Context',
    comparedName: '',
    resolveGroupName: () => undefined,
    selectUser: vi.fn(),
    changeUser: vi.fn(),
  };
}

const Harness: React.FC<{ onScreen: boolean }> = ({ onScreen }) => (
  <div data-testid="scroller" style={{ overflowY: 'auto' }}>
    <div className={onScreen ? '' : 'hidden'}>
      <UserComparisonPanel
        isActive={onScreen}
        searchEnabled={onScreen}
        contextUser={contextUser}
        contextGroups={[]}
        targetTabId={1}
        onGroupsChanged={vi.fn()}
      />
    </div>
  </div>
);

function scroller(): HTMLElement {
  const node = screen.getByTestId('scroller');
  if (!Object.getOwnPropertyDescriptor(node, 'scrollTop')) {
    Object.defineProperty(node, 'scrollTop', { value: 0, writable: true, configurable: true });
  }
  return node;
}

function scrollTo(node: HTMLElement, top: number) {
  node.scrollTop = top;
  fireEvent.scroll(node);
}

describe('UserComparisonPanel scroll preservation', () => {
  it('opens at the top when pushed onto a scroller the previous rung left part-way down', () => {
    const { rerender } = render(<Harness onScreen={false} />);
    const node = scroller();

    node.scrollTop = 800;

    rerender(<Harness onScreen={true} />);

    expect(node.scrollTop).toBe(0);
  });

  it('returns to the offset the comparison was left at, not the one the other rung left', () => {
    const { rerender } = render(<Harness onScreen={false} />);
    const node = scroller();

    rerender(<Harness onScreen={true} />);
    scrollTo(node, 240);

    rerender(<Harness onScreen={false} />);
    scrollTo(node, 900);

    rerender(<Harness onScreen={true} />);

    expect(node.scrollTop).toBe(240);
  });
});
