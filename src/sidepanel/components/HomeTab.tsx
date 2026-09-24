import React, { useState } from 'react';
import JumpBar from './home/JumpBar';
import WorkingSet from './home/WorkingSet';
import OrgSnapshotCard from './home/OrgSnapshotCard';
import ReportsCard from './home/ReportsCard';
import GuideLinkRow from './home/GuideLinkRow';
import { useOktaApi } from '../hooks/useOktaApi';
import { useWorkingSet } from '../hooks/useWorkingSet';
import { useOrgFigures } from '../hooks/useOrgFigures';
import { useHomeReports } from '../hooks/useHomeReports';
import { useJumpResolver, type JumpResult } from '../hooks/useJumpResolver';
import { useEntitySearchSources } from '../hooks/useEntitySearchSources';
import { useStaggerReveal } from '../hooks/useStaggerReveal';
import { useEntityNavigation } from '../contexts/NavigationContext';
import { useOrgEntityIndex } from '../contexts/OrgEntityIndexContext';
import { navigationTarget } from './home/jumpDestinations';
import type { WorkingSetRef } from '../../shared/storage/workingSetStore';
import type { ListViewRequest, ListViewTab } from '../listViewRequest';
import { openGuide } from '../../shared/guide';

export interface HomeTabProps {
  isActive: boolean;
  targetTabId: number | null;
  oktaOrigin?: string | null;
  onOpenListView: (request: ListViewRequest) => void;
  onOpenTab: (tab: ListViewTab) => void;
  onScanGroupMfa: (groupId: string) => void;
}

const HOME_JUMP_KINDS = ['group', 'user'] as const;

const HomeTab: React.FC<HomeTabProps> = ({
  isActive,
  targetTabId,
  oktaOrigin,
  onOpenListView,
  onOpenTab,
  onScanGroupMfa,
}) => {
  const api = useOktaApi({ targetTabId, oktaOrigin });
  const nav = useEntityNavigation();

  const index = useOrgEntityIndex();
  const workingSet = useWorkingSet(oktaOrigin);
  const orgFigures = useOrgFigures({
    index,
    enabled: isActive,
    connected: targetTabId !== null,
  });
  const { reports, groupChoices, groupChoicesStatus } = useHomeReports({ index });

  const [autoFocus] = useState(() => isActive && document.visibilityState === 'visible');

  const { searchers, fetchers } = useEntitySearchSources({ api, index, kinds: HOME_JUMP_KINDS });

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
          groupChoices={groupChoices}
          groupChoicesStatus={groupChoicesStatus}
          onScanGroupMfa={onScanGroupMfa}
        />

        <GuideLinkRow onOpenGuide={() => void openGuide('welcome')} />
      </div>
    </div>
  );
};

export default HomeTab;
