import React, { useLayoutEffect, useRef } from 'react';
import UserComparisonView from './UserComparisonView';
import { useUserComparison } from '../../hooks/useUserComparison';
import { useScrollPreservation } from '../../hooks/useScrollPreservation';
import type { OktaUser, GroupMembership } from '../../../shared/types';

function findScrollContainer(node: HTMLElement | null): HTMLElement | null {
  for (let el = node?.parentElement ?? null; el; el = el.parentElement) {
    const { overflowY } = window.getComputedStyle(el);
    if (overflowY === 'auto' || overflowY === 'scroll') return el;
  }
  return null;
}

export interface UserComparisonPanelProps {
  isActive: boolean;
  searchEnabled: boolean;
  contextUser: OktaUser;
  contextGroups: GroupMembership[];
  oktaOrigin?: string | null;
  targetTabId: number;
  onGroupsChanged: () => void;
  onContextUserUpdated?: (user: OktaUser) => void;
}

const UserComparisonPanel: React.FC<UserComparisonPanelProps> = ({
  isActive,
  searchEnabled,
  contextUser,
  contextGroups,
  oktaOrigin,
  targetTabId,
  onGroupsChanged,
  onContextUserUpdated,
}) => {
  const comparison = useUserComparison({
    isActive,
    searchEnabled,
    contextUser,
    contextGroups,
    targetTabId,
    oktaOrigin,
    onGroupsChanged,
    onContextUserUpdated,
  });

  const anchorRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    scrollRef.current = findScrollContainer(anchorRef.current);
  }, []);
  useScrollPreservation(scrollRef, isActive && searchEnabled);

  return (
    <div ref={anchorRef}>
      <UserComparisonView
        contextUser={contextUser}
        comparison={comparison}
        oktaOrigin={oktaOrigin}
      />
    </div>
  );
};

export default UserComparisonPanel;
