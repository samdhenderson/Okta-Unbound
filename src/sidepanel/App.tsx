import React, { useState, useEffect, useCallback, useMemo, useRef, lazy } from 'react';
import ContextBar from './components/ContextBar';
import PageHeader from './components/shared/PageHeader';
import TabNavigation from './components/TabNavigation';
import TabPanel from './components/TabPanel';
import TabJumpPalette from './components/TabJumpPalette';
import { useCommandPalette } from './hooks/useCommandPalette';
import { migrateLegacyTabId, type TabType } from './tabs';
import OverviewTab from './components/OverviewTab';
import type { ExportRequest } from './components/export';
import ActivityBar from './components/ActivityBar';

const RulesTab = lazy(() => import('./components/RulesTab'));
const UsersTab = lazy(() => import('./components/UsersTab'));
const GroupsTab = lazy(() => import('./components/GroupsTab'));
const AppsTab = lazy(() => import('./components/AppsTab'));
const AuthPoliciesTab = lazy(() => import('./components/AuthPoliciesTab'));
const ExportTab = lazy(() => import('./components/export').then((m) => ({ default: m.ExportTab })));
const AuditLogViewer = lazy(() => import('./components/AuditLogViewer'));
import { useGroupContext } from './hooks/useGroupContext';
import { useOktaPageContext } from './hooks/useOktaPageContext';
import { SchedulerProvider } from './contexts/SchedulerContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { deriveTabContext, revalidatePinnedContext, type PinnedContext } from './pinContext';

const SELECTED_TAB_KEY = 'okta_unbound_selected_tab';
const PINNED_CONTEXT_KEY = 'okta_unbound_pinned_context';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [exportRequest, setExportRequest] = useState<ExportRequest | null>(null);
  const [scopeRulesToGroupId, setScopeRulesToGroupId] = useState<string | null>(null);
  const [pinned, setPinned] = useState<PinnedContext | null>(null);
  const isPinned = pinned !== null;
  const [mountedTabs, setMountedTabs] = useState<ReadonlySet<TabType>>(
    () => new Set<TabType>(['overview']),
  );
  useEffect(() => {
    setMountedTabs((prev) => (prev.has(activeTab) ? prev : new Set(prev).add(activeTab)));
  }, [activeTab]);

  const scrollRootRef = useRef<HTMLDivElement>(null);

  const jumpPalette = useCommandPalette();

  const {
    groupInfo,
    connectionStatus,
    targetTabId,
    error,
    isLoading,
    oktaOrigin,
    refetch: refetchGroupContext,
  } = useGroupContext();
  const page = useOktaPageContext(activeTab === 'overview' && !isPinned);

  useEffect(() => {
    chrome.storage.local.get([PINNED_CONTEXT_KEY], (result) => {
      const saved = result[PINNED_CONTEXT_KEY] as PinnedContext | undefined;
      if (!saved) return;
      void revalidatePinnedContext(saved).then((revalidated) => {
        if (!revalidated) {
          chrome.storage.local.remove(PINNED_CONTEXT_KEY);
          return;
        }
        setPinned(revalidated);
        if (revalidated.targetTabId !== saved.targetTabId) {
          chrome.storage.local.set({ [PINNED_CONTEXT_KEY]: revalidated });
        }
      });
    });
  }, []);

  const isLivePinnable = page.pageType === 'group' || page.pageType === 'user';
  const effective = pinned
    ? {
        pageType: pinned.pageType,
        groupInfo: pinned.groupInfo,
        userInfo: pinned.userInfo,
        targetTabId: pinned.targetTabId as number | null,
        oktaOrigin: pinned.oktaOrigin,
        connectionStatus,
        error,
        isLoading: false,
      }
    : {
        pageType: page.pageType,
        groupInfo: page.groupInfo,
        userInfo: page.userInfo,
        targetTabId: page.targetTabId,
        oktaOrigin: page.oktaOrigin,
        connectionStatus: page.connectionStatus,
        error: page.error,
        isLoading: page.isLoading,
      };

  const tabContext = deriveTabContext(pinned, { targetTabId, groupInfo, oktaOrigin });

  const entityName =
    effective.pageType === 'group'
      ? (effective.groupInfo?.groupName ?? undefined)
      : effective.pageType === 'user'
        ? (effective.userInfo?.userName ?? undefined)
        : effective.pageType === 'app'
          ? (page.appInfo?.appName ?? undefined)
          : effective.pageType === 'policy'
            ? (page.policyInfo?.policyName ?? undefined)
            : undefined;
  const entityId =
    effective.pageType === 'group'
      ? (effective.groupInfo?.groupId ?? undefined)
      : effective.pageType === 'user'
        ? (effective.userInfo?.userId ?? undefined)
        : effective.pageType === 'app'
          ? (page.appInfo?.appId ?? undefined)
          : effective.pageType === 'policy'
            ? (page.policyInfo?.policyId ?? undefined)
            : undefined;

  const handleTogglePin = () => {
    if (pinned) {
      setPinned(null);
      chrome.storage.local.remove(PINNED_CONTEXT_KEY);
      return;
    }
    if (isLivePinnable && page.targetTabId != null) {
      const snapshot: PinnedContext = {
        pageType: page.pageType as 'group' | 'user',
        groupInfo: page.groupInfo,
        userInfo: page.userInfo,
        targetTabId: page.targetTabId,
        oktaOrigin: page.oktaOrigin,
      };
      setPinned(snapshot);
      chrome.storage.local.set({ [PINNED_CONTEXT_KEY]: snapshot });
    }
  };

  const refetchPageContext = page.refetch;
  const handleRefreshAll = useCallback(() => {
    void refetchGroupContext();
    void refetchPageContext();
  }, [refetchGroupContext, refetchPageContext]);

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

  const handleNavigateToRule = useCallback((ruleId: string) => {
    setSelectedRuleId(ruleId);
    setActiveTab('rules');
    chrome.storage.local.set({ [SELECTED_TAB_KEY]: 'rules' });
  }, []);

  const handleNavigateToGroup = useCallback((groupId: string) => {
    setSelectedGroupId(groupId);
    setActiveTab('groups');
    chrome.storage.local.set({ [SELECTED_TAB_KEY]: 'groups' });
  }, []);

  const handleNavigateToUser = useCallback((userId: string) => {
    setSelectedUserId(userId);
    setActiveTab('users');
    chrome.storage.local.set({ [SELECTED_TAB_KEY]: 'users' });
  }, []);

  const navigationHandlers = useMemo(
    () => ({
      rule: handleNavigateToRule,
      group: handleNavigateToGroup,
      user: handleNavigateToUser,
    }),
    [handleNavigateToRule, handleNavigateToGroup, handleNavigateToUser],
  );

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

  const handleExportApp = (descriptorId: string, appId: string, appName: string) =>
    handleNavigateToExport({ descriptorId, contextId: appId, contextLabel: appName });

  const handleViewGroupRules = (groupId: string) => {
    setScopeRulesToGroupId(groupId);
    setActiveTab('rules');
    chrome.storage.local.set({ [SELECTED_TAB_KEY]: 'rules' });
  };

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
        <div
          ref={scrollRootRef}
          data-testid="app-scroll-root"
          className="flex flex-col h-screen overflow-y-auto [overflow-anchor:none] pb-14 bg-canvas"
        >
          <ContextBar
            pageType={effective.pageType}
            entityName={entityName}
            entityId={entityId}
            connectionStatus={connectionStatus}
            isLoading={isLoading}
            error={error}
            isPinned={isPinned}
            canPin={isLivePinnable}
            liveContextChanged={isPinned && page.resyncPending}
            onTogglePin={handleTogglePin}
            onRefresh={handleRefreshAll}
            onReconnect={handleReconnect}
          />

          <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

          {renderTabPanel('overview', () => (
            <OverviewTab
              onTabChange={handleTabChange}
              pageType={effective.pageType}
              groupInfo={effective.groupInfo}
              userInfo={effective.userInfo}
              appInfo={page.appInfo ?? null}
              policyInfo={page.policyInfo ?? null}
              connectionStatus={effective.connectionStatus}
              targetTabId={effective.targetTabId}
              error={effective.error}
              isLoading={effective.isLoading}
              oktaOrigin={effective.oktaOrigin}
              onRetry={handleRefreshAll}
              onViewAllGroups={() => {
                if (effective.userInfo) handleNavigateToUser(effective.userInfo.userId);
              }}
              onExportGroup={handleExportGroup}
              onExportApp={handleExportApp}
              onViewGroupRules={handleViewGroupRules}
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
              scopeToGroupId={scopeRulesToGroupId}
              onScopeConsumed={() => setScopeRulesToGroupId(null)}
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
              targetTabId={tabContext.targetTabId ?? null}
              oktaOrigin={tabContext.oktaOrigin ?? undefined}
              onNavigateToRule={handleNavigateToRule}
              selectedGroupId={selectedGroupId}
              onGroupSelected={() => setSelectedGroupId(null)}
              onExportGroup={handleExportGroup}
            />
          ))}
          {renderTabPanel('apps', (isActive) => (
            <AppsTab
              isActive={isActive}
              targetTabId={tabContext.targetTabId ?? null}
              oktaOrigin={tabContext.oktaOrigin ?? undefined}
            />
          ))}
          {renderTabPanel('policies', (isActive) => (
            <AuthPoliciesTab
              isActive={isActive}
              targetTabId={tabContext.targetTabId ?? undefined}
              oktaOrigin={tabContext.oktaOrigin ?? undefined}
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
          {renderTabPanel('history', () => (
            <div
              className="tab-content active"
              style={{ fontFamily: 'var(--font-primary)', padding: 0 }}
            >
              <PageHeader title="Audit Log" subtitle="View history of actions performed" />
              <div className="max-w-7xl mx-auto px-6 py-6">
                <AuditLogViewer />
              </div>
            </div>
          ))}

          <ActivityBar />
        </div>

        <TabJumpPalette
          isOpen={jumpPalette.isOpen}
          onClose={jumpPalette.close}
          activeTab={activeTab}
          onSelect={handleTabChange}
        />
      </NavigationProvider>
    </SchedulerProvider>
  );
};

export default App;
