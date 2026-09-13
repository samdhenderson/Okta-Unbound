import React, { useState, useEffect, useCallback, useMemo, useRef, lazy } from 'react';
import ContextBar from './components/ContextBar';
import AlertMessage from './components/shared/AlertMessage';
import PageHeader from './components/shared/PageHeader';
import { MODAL_LAYER_ID } from './components/shared/Modal';
import TabNavigation from './components/TabNavigation';
import TabPanel from './components/TabPanel';
import CommandPalette from './components/CommandPalette';
import { useCommandPalette } from './hooks/useCommandPalette';
import { migrateLegacyTabId, type TabType } from './tabs';
import HomeTab from './components/HomeTab';
import type { ExportRequest } from './components/export';
import type { GroupDetailTab } from './components/groups/detail/GroupDetailView';
import { viewFor, type ListViewRequest, type ListViewTab } from './listViewRequest';
import ActivityBar from './components/ActivityBar';

const RulesTab = lazy(() => import('./components/RulesTab'));
const UsersTab = lazy(() => import('./components/UsersTab'));
const GroupsTab = lazy(() => import('./components/GroupsTab'));
const AppsTab = lazy(() => import('./components/AppsTab'));
const AuthPoliciesTab = lazy(() => import('./components/AuthPoliciesTab'));
const ExportTab = lazy(() => import('./components/export').then((m) => ({ default: m.ExportTab })));
const ApiExplorerTab = lazy(() => import('./components/ApiExplorerTab'));
const AuditLogViewer = lazy(() => import('./components/AuditLogViewer'));
const SelectionTab = lazy(() => import('./components/selection/SelectionTab'));
import { useGroupContext } from './hooks/useGroupContext';
import { useOktaPageContext } from './hooks/useOktaPageContext';
import { useSessionExpiry } from './hooks/useSessionExpiry';
import { useAppRefresh } from './hooks/useRefreshSubject';
import { useEntityHandoff } from './hooks/useEntityHandoff';
import { selectionStore } from './selection/selectionStore';
import type { JumpKind } from './hooks/useJumpResolver';
import { SchedulerProvider } from './contexts/SchedulerContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { OrgEntityIndexProvider } from './contexts/OrgEntityIndexContext';
const SELECTED_TAB_KEY = 'okta_unbound_selected_tab';

const RETIRED_STORAGE_KEYS = ['okta_unbound_pinned_context', 'okta_unbound_group_collections'];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [groupNav, setGroupNav] = useState<{ id: string; pane?: GroupDetailTab } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [exportRequest, setExportRequest] = useState<ExportRequest | null>(null);
  const [listViewRequest, setListViewRequest] = useState<ListViewRequest | null>(null);
  const [mountedTabs, setMountedTabs] = useState<ReadonlySet<TabType>>(
    () => new Set<TabType>(['home']),
  );
  useEffect(() => {
    setMountedTabs((prev) => (prev.has(activeTab) ? prev : new Set(prev).add(activeTab)));
  }, [activeTab]);

  const scrollRootRef = useRef<HTMLDivElement>(null);

  const jumpPalette = useCommandPalette();

  const page = useOktaPageContext();
  const { groupInfo, connectionStatus, targetTabId, error, isLoading, oktaOrigin } =
    useGroupContext(page);

  useEffect(() => {
    chrome.storage.local.remove(RETIRED_STORAGE_KEYS);
  }, []);

  useEffect(() => {
    selectionStore.setOrigin(oktaOrigin ?? null);
  }, [oktaOrigin]);

  const tabContext = {
    targetTabId,
    currentGroupId: groupInfo?.groupId,
    oktaOrigin,
  };

  const entityName =
    page.pageType === 'group'
      ? (page.groupInfo?.groupName ?? undefined)
      : page.pageType === 'user'
        ? (page.userInfo?.userName ?? undefined)
        : page.pageType === 'app'
          ? (page.appInfo?.appName ?? undefined)
          : page.pageType === 'policy'
            ? (page.policyInfo?.policyName ?? undefined)
            : undefined;

  const refetchPageContext = page.refetch;
  const handleRefreshAll = useCallback(() => {
    void refetchPageContext();
  }, [refetchPageContext]);

  const { subjectName: refreshSubjectName, refresh: handleRefresh } =
    useAppRefresh(refetchPageContext);

  const handleReconnect = () => {
    if (targetTabId != null) {
      chrome.tabs.reload(targetTabId, {}, () => {
        void chrome.runtime.lastError; // tab may be gone; ignore
        handleRefreshAll();
      });
    } else {
      handleRefreshAll();
    }
  };

  useEffect(() => {
    chrome.storage.local.get([SELECTED_TAB_KEY], (result) => {
      if (result[SELECTED_TAB_KEY]) {
        const savedTab = result[SELECTED_TAB_KEY] as string;
        const migratedTab = migrateLegacyTabId(savedTab);

        setActiveTab(migratedTab);
        if (migratedTab !== savedTab) {
          chrome.storage.local.set({ [SELECTED_TAB_KEY]: migratedTab });
        }
      }
    });
  }, []);

  const handleTabChange = (tab: TabType, selectedRuleId?: string) => {
    setActiveTab(tab);
    chrome.storage.local.set({ [SELECTED_TAB_KEY]: tab });

    if (tab === 'rules' && selectedRuleId) {
      setSelectedRuleId(selectedRuleId);
    }
  };

  const handleOpenSelection = () => {
    handleTabChange('selection');
  };

  const handleNavigateToRule = useCallback((ruleId: string) => {
    setSelectedRuleId(ruleId);
    setActiveTab('rules');
    chrome.storage.local.set({ [SELECTED_TAB_KEY]: 'rules' });
  }, []);

  const handleNavigateToGroup = useCallback((groupId: string, pane?: GroupDetailTab) => {
    setGroupNav({ id: groupId, pane });
    setActiveTab('groups');
    chrome.storage.local.set({ [SELECTED_TAB_KEY]: 'groups' });
  }, []);

  const handleNavigateToUser = useCallback((userId: string) => {
    setSelectedUserId(userId);
    setActiveTab('users');
    chrome.storage.local.set({ [SELECTED_TAB_KEY]: 'users' });
  }, []);

  const handleNavigateToApp = useCallback((appId: string) => {
    setSelectedAppId(appId);
    setActiveTab('apps');
    chrome.storage.local.set({ [SELECTED_TAB_KEY]: 'apps' });
  }, []);

  const handleNavigateToPolicy = useCallback((policyId: string) => {
    setSelectedPolicyId(policyId);
    setActiveTab('policies');
    chrome.storage.local.set({ [SELECTED_TAB_KEY]: 'policies' });
  }, []);

  const navigationHandlers = useMemo(
    () => ({
      rule: handleNavigateToRule,
      group: handleNavigateToGroup,
      user: handleNavigateToUser,
      app: handleNavigateToApp,
      policy: handleNavigateToPolicy,
    }),
    [
      handleNavigateToRule,
      handleNavigateToGroup,
      handleNavigateToUser,
      handleNavigateToApp,
      handleNavigateToPolicy,
    ],
  );

  const canNavigateToKind = useCallback(
    (kind: JumpKind) => typeof navigationHandlers[kind] === 'function',
    [navigationHandlers],
  );
  const navigateToKind = useCallback(
    (kind: JumpKind, id: string) => navigationHandlers[kind]?.(id),
    [navigationHandlers],
  );
  const handoff = useEntityHandoff({
    page,
    canNavigateTo: canNavigateToKind,
    navigateTo: navigateToKind,
  });

  const handleNavigateToExport = (request: ExportRequest) => {
    setExportRequest(request);
    setActiveTab('export');
    chrome.storage.local.set({ [SELECTED_TAB_KEY]: 'export' });
  };

  const handleExportGroup = (groupId: string, groupName: string) =>
    handleNavigateToExport({
      descriptorId: 'group-memberships',
      contextId: groupId,
      contextLabel: groupName,
    });

  const handleExportRules = () => handleNavigateToExport({ descriptorId: 'group-rules' });

  const handleOpenListView = useCallback((request: ListViewRequest) => {
    setListViewRequest(request);
    setActiveTab(request.tab);
    chrome.storage.local.set({ [SELECTED_TAB_KEY]: request.tab });
  }, []);

  const clearListViewRequest = useCallback(() => setListViewRequest(null), []);

  const handleOpenTab = useCallback((tab: ListViewTab) => {
    setListViewRequest(null);
    setActiveTab(tab);
    chrome.storage.local.set({ [SELECTED_TAB_KEY]: tab });
  }, []);

  const renderTabPanel = (tab: TabType, content: (isActive: boolean) => React.ReactNode) => {
    if (!mountedTabs.has(tab)) return null;
    const isActive = tab === activeTab;
    return (
      <TabPanel isActive={isActive} scrollRef={scrollRootRef}>
        {content(isActive)}
      </TabPanel>
    );
  };

  return (
    <SchedulerProvider>
      <NavigationProvider handlers={navigationHandlers}>
        <OrgEntityIndexProvider
          oktaOrigin={tabContext.oktaOrigin ?? null}
          targetTabId={tabContext.targetTabId ?? null}
          enabled={activeTab === 'home' || jumpPalette.isOpen}
        >
          <div className="flex flex-col h-screen overflow-hidden bg-canvas">
            <ContextBar
              pageType={page.pageType}
              entityName={entityName}
              connectionStatus={connectionStatus}
              isLoading={isLoading}
              error={error}
              onRefresh={handleRefresh}
              refreshSubjectName={refreshSubjectName}
              onReconnect={handleReconnect}
              handoff={handoff.offer}
              onAcceptHandoff={handoff.accept}
              onDismissHandoff={handoff.dismiss}
              onOpenSelection={handleOpenSelection}
            />

            <SessionExpiryNotice targetTabId={tabContext.targetTabId ?? null} />

            <TabNavigation
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onOpenCommandPalette={jumpPalette.open}
            />

            <div
              ref={scrollRootRef}
              data-testid="app-scroll-root"
              className="flex flex-col flex-1 min-h-0 overflow-y-auto [overflow-anchor:none] pb-[var(--activity-h,36px)]"
            >
              {renderTabPanel('home', (isActive) => (
                <HomeTab
                  isActive={isActive}
                  targetTabId={tabContext.targetTabId ?? null}
                  oktaOrigin={tabContext.oktaOrigin ?? undefined}
                  onOpenListView={handleOpenListView}
                  onOpenTab={handleOpenTab}
                  onScanGroupMfa={(id) => handleNavigateToGroup(id, 'insights')}
                />
              ))}
              {renderTabPanel('rules', (isActive) => (
                <RulesTab
                  isActive={isActive}
                  targetTabId={tabContext.targetTabId ?? undefined}
                  currentGroupId={tabContext.currentGroupId}
                  oktaOrigin={tabContext.oktaOrigin ?? undefined}
                  selectedRuleId={selectedRuleId}
                  onRuleSelected={() => setSelectedRuleId(null)}
                  onNavigateToGroup={handleNavigateToGroup}
                  onExportRules={handleExportRules}
                  scrollRootRef={scrollRootRef}
                  listView={viewFor(listViewRequest, 'rules')}
                  onListViewConsumed={clearListViewRequest}
                />
              ))}
              {renderTabPanel('users', (isActive) => (
                <UsersTab
                  isActive={isActive}
                  targetTabId={tabContext.targetTabId ?? undefined}
                  currentGroupId={tabContext.currentGroupId}
                  selectedUserId={selectedUserId}
                  onUserSelected={() => setSelectedUserId(null)}
                />
              ))}
              {renderTabPanel('groups', (isActive) => (
                <GroupsTab
                  isActive={isActive}
                  scrollRootRef={scrollRootRef}
                  targetTabId={tabContext.targetTabId ?? null}
                  oktaOrigin={tabContext.oktaOrigin ?? undefined}
                  onNavigateToRule={handleNavigateToRule}
                  selectedGroupId={groupNav?.id ?? null}
                  selectedGroupPane={groupNav?.pane}
                  onGroupSelected={() => setGroupNav(null)}
                  onExportGroup={handleExportGroup}
                  listView={viewFor(listViewRequest, 'groups')}
                  onListViewConsumed={clearListViewRequest}
                />
              ))}
              {renderTabPanel('apps', (isActive) => (
                <AppsTab
                  isActive={isActive}
                  targetTabId={tabContext.targetTabId ?? null}
                  oktaOrigin={tabContext.oktaOrigin ?? undefined}
                  listView={viewFor(listViewRequest, 'apps')}
                  onListViewConsumed={clearListViewRequest}
                  selectedAppId={selectedAppId}
                  onAppSelected={() => setSelectedAppId(null)}
                />
              ))}
              {renderTabPanel('policies', (isActive) => (
                <AuthPoliciesTab
                  isActive={isActive}
                  targetTabId={tabContext.targetTabId ?? undefined}
                  oktaOrigin={tabContext.oktaOrigin ?? undefined}
                  selectedPolicyId={selectedPolicyId}
                  onPolicySelected={() => setSelectedPolicyId(null)}
                />
              ))}
              {renderTabPanel('export', (isActive) => (
                <ExportTab
                  isActive={isActive}
                  targetTabId={tabContext.targetTabId ?? undefined}
                  oktaOrigin={tabContext.oktaOrigin ?? undefined}
                  exportRequest={exportRequest}
                  onExportRequestConsumed={() => setExportRequest(null)}
                />
              ))}
              {renderTabPanel('explorer', () => (
                <ApiExplorerTab
                  targetTabId={tabContext.targetTabId ?? null}
                  oktaOrigin={tabContext.oktaOrigin ?? undefined}
                />
              ))}
              {renderTabPanel('history', (isActive) => (
                <div
                  className="tab-content active"
                  style={{ fontFamily: 'var(--font-primary)', padding: 0 }}
                >
                  <PageHeader title="Audit Log" subtitle="View history of actions performed" />
                  <div className="max-w-7xl mx-auto px-6 py-6">
                    <AuditLogViewer
                      isActive={isActive}
                      targetTabId={tabContext.targetTabId ?? null}
                    />
                  </div>
                </div>
              ))}
              {renderTabPanel('selection', (isActive) => (
                <SelectionTab
                  isActive={isActive}
                  oktaOrigin={tabContext.oktaOrigin ?? undefined}
                  targetTabId={tabContext.targetTabId ?? null}
                />
              ))}

              <ActivityBar />
            </div>
          </div>

          <CommandPalette
            isOpen={jumpPalette.isOpen}
            onClose={jumpPalette.close}
            activeTab={activeTab}
            onSelect={handleTabChange}
            targetTabId={tabContext.targetTabId ?? null}
            oktaOrigin={tabContext.oktaOrigin}
          />

          <div id={MODAL_LAYER_ID} />
        </OrgEntityIndexProvider>
      </NavigationProvider>
    </SchedulerProvider>
  );
};

const SessionExpiryNotice: React.FC<{ targetTabId: number | null }> = ({ targetTabId }) => {
  const expired = useSessionExpiry(targetTabId);
  if (!expired) return null;

  return (
    <div className="px-(--sp-gutter) pt-(--sp-card)">
      <AlertMessage
        message={{
          type: 'danger',
          text: 'Your Okta session has expired. Sign in again in the Okta tab — the panel has stopped sending requests and picks up again on its own once Okta answers.',
        }}
      />
    </div>
  );
};

export default App;
