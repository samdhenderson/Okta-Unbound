import React, { useMemo, useState } from 'react';
import JumpBar from './home/JumpBar';
import WorkingSet from './home/WorkingSet';
import OrgSnapshotCard from './home/OrgSnapshotCard';
import ReportsCard from './home/ReportsCard';
import { useOktaApi } from '../hooks/useOktaApi';
import { useOrgEntityIndex } from '../hooks/useOrgEntityIndex';
import { useWorkingSet } from '../hooks/useWorkingSet';
import { useOrgFigures } from '../hooks/useOrgFigures';
import { useHomeReports } from '../hooks/useHomeReports';
import { useJumpResolver, type JumpResult } from '../hooks/useJumpResolver';
import { useStaggerReveal } from '../hooks/useStaggerReveal';
import { useEntityNavigation } from '../contexts/NavigationContext';
import { navigationTarget } from './home/jumpDestinations';
import type { OktaIdKind } from '../../shared/utils/oktaId';
import type { WorkingSetRef } from '../../shared/storage/workingSetStore';
import type { ListViewRequest, ListViewTab } from '../listViewRequest';

export interface HomeTabProps {
  isActive: boolean;
  targetTabId: number | null;
  oktaOrigin?: string | null;
  onOpenListView: (request: ListViewRequest) => void;
  onOpenTab: (tab: ListViewTab) => void;
}

const HomeTab: React.FC<HomeTabProps> = ({
  isActive,
  targetTabId,
  oktaOrigin,
  onOpenListView,
  onOpenTab,
}) => {
  const api = useOktaApi({ targetTabId, oktaOrigin });
  const nav = useEntityNavigation();

  const index = useOrgEntityIndex({ oktaOrigin, targetTabId, enabled: isActive });
  const workingSet = useWorkingSet(oktaOrigin);
  const orgFigures = useOrgFigures({
    index,
    enabled: isActive,
    connected: targetTabId !== null,
  });
  const { reports } = useHomeReports({ index });

  const [autoFocus] = useState(() => isActive && document.visibilityState === 'visible');

  const { searchUsers, searchGroups, getUserById, getGroupById, getAppById, getRawGroupRule } = api;

  const searchers = useMemo(() => {
    const built: Partial<Record<OktaIdKind, (query: string) => Promise<JumpResult[]>>> = {};
    if (nav.canNavigateTo('group')) {
      built.group = async (query) =>
        (await searchGroups(query)).map((group) => ({
          kind: 'group' as const,
          id: group.id,
          name: group.name,
          secondary: group.description || undefined,
        }));
    }
    if (nav.canNavigateTo('user')) {
      built.user = async (query) =>
        (await searchUsers(query)).map((user) => ({
          kind: 'user' as const,
          id: user.id,
          name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.login,
          secondary: user.email || user.login,
        }));
    }
    return built;
  }, [nav, searchGroups, searchUsers]);

  const fetchers: Partial<Record<OktaIdKind, (id: string) => Promise<JumpResult | null>>> = {
    group: async (id) => {
      const group = await getGroupById(id);
      return group
        ? {
            kind: 'group',
            id: group.id,
            name: group.name,
            secondary: group.description || undefined,
          }
        : null;
    },
    user: async (id) => {
      const user = await getUserById(id);
      return user
        ? {
            kind: 'user',
            id: user.id,
            name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.login,
            secondary: user.email || user.login,
          }
        : null;
    },
    app: async (id) => {
      const app = await getAppById(id);
      return app ? { kind: 'app', id: app.id, name: app.label || app.name || app.id } : null;
    },
    rule: async (id) => {
      const rule = await getRawGroupRule(id);
      return rule
        ? {
            kind: 'rule',
            id: rule.id,
            name: rule.name || rule.id,
            secondary: rule.status === 'INACTIVE' ? 'Paused' : 'Active',
          }
        : null;
    },
  };

  const jump = useJumpResolver({ index, searchers, fetchers, enabled: isActive });

  const setStaggerRef = useStaggerReveal();

  const handleSelect = (result: JumpResult) => {
    nav.navigateTo({ type: navigationTarget(result.kind), id: result.id });
  };

  const handleOpenEntry = (entry: WorkingSetRef) => {
    nav.navigateTo({ type: entry.kind, id: entry.id });
  };

  return (
    <div className="tab-content active">
      <div
        ref={setStaggerRef}
        data-testid="home-card-stack"
        className="w-full max-w-7xl mx-auto px-(--sp-gutter) py-(--sp-gutter) space-y-(--sp-rung) rise-in-stagger"
      >
        <JumpBar
          jump={jump}
          onSelect={handleSelect}
          canReach={(kind) => nav.canNavigateTo(navigationTarget(kind))}
          oktaOrigin={oktaOrigin}
          autoFocus={autoFocus}
        />

        <WorkingSet
          pinned={workingSet.pinned}
          recent={workingSet.recent}
          onOpen={handleOpenEntry}
          onUnpin={(entry) => workingSet.forget(entry.kind, entry.id)}
          onForget={(entry) => workingSet.forget(entry.kind, entry.id)}
        />

        <OrgSnapshotCard
          boxes={orgFigures.boxes}
          readAt={orgFigures.readAt}
          isRefreshing={orgFigures.isRefreshing}
          onRefresh={orgFigures.refresh}
          canRefresh={orgFigures.canRefresh}
          onOpenTab={onOpenTab}
          onOpenListView={onOpenListView}
        />

        <ReportsCard
          reports={reports}
          onOpenGroup={(id) => nav.navigateTo({ type: 'group', id })}
        />
      </div>
    </div>
  );
};

export default HomeTab;
