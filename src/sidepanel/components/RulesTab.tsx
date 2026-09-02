import React, { useState, useEffect, useCallback, useRef } from 'react';
import RuleImpactModal from './RuleImpactModal';
import PageHeader from './shared/PageHeader';
import Breadcrumbs from './shared/Breadcrumbs';
import EntityIdentity from './shared/EntityIdentity';
import AlertMessage from './shared/AlertMessage';
import RulesMetaRow from './rules/RulesMetaRow';
import RulesStatsGrid from './rules/RulesStatsGrid';
import RulesFilterPanel, {
  countActiveRuleFilters,
  type RulesFilterType,
} from './rules/RulesFilterPanel';
import RulesSearchRow from './rules/RulesSearchRow';
import RulesListActionBar, { type RulesPanel } from './rules/RulesListActionBar';
import RuleDetailView from './rules/RuleDetailView';
import { ruleIdentity } from './rules/ruleIdentity';
import type { RulesListView } from '../listViewRequest';
import RulesListPanel from './rules/RulesListPanel';
import RulesDuplicatesPanel from './rules/RulesDuplicatesPanel';
import CurrentGroupRuleRelations from './rules/CurrentGroupRuleRelations';
import RuleConsolidationModal from './RuleConsolidationModal';
import type { FormattedRule, GroupRuleStatus, OktaGroupRule } from '../../shared/types';
import { filterRules } from '../../shared/ruleUtils';
import { findMergeableRuleGroups, type MergeableRuleGroup } from '../../shared/rules/consolidation';
import { sortRules, type RuleSortMode } from '../../shared/rules/similarity';
import { countCurrentGroupRuleRelations } from '../../shared/rules/currentGroupRelations';
import { useOktaApi } from '../hooks/useOktaApi';
import type { OperationResult } from '../hooks/useOktaApi/types';
import { useRuleImpact } from '../hooks/useRuleImpact';
import { useRulesData } from '../hooks/useRulesData';
import { useRuleLifecycle } from '../hooks/useRuleLifecycle';
import { useRuleConsolidation } from '../hooks/useRuleConsolidation';
import { useViewStack } from '../hooks/useViewStack';
import { useScrollPreservation } from '../hooks/useScrollPreservation';
import type { RuleImpactInput } from '../hooks/useOktaApi/ruleImpact';
import { TabStateManager, saveRulesTabState } from '../../shared/tabState/tabStateManager';
import type { RulesTabState } from '../../shared/tabState/types';
import { createLogger } from '../../shared/utils/logger';

const log = createLogger('RulesTab');

const targetsGroup = (rule: FormattedRule, groupId?: string): boolean =>
  groupId ? rule.groupIds.includes(groupId) : false;

interface RulesTabProps {
  targetTabId?: number;
  currentGroupId?: string;
  oktaOrigin?: string | null;
  selectedRuleId?: string | null;
  onRuleSelected?: () => void;
  onNavigateToGroup?: (groupId: string) => void;
  onExportRules?: () => void;
  listView?: RulesListView | null;
  onListViewConsumed?: () => void;
  isActive?: boolean;
  scrollRootRef?: React.RefObject<HTMLElement | null>;
}

const IN_FORCE: Record<GroupRuleStatus, boolean> = {
  ACTIVE: true,
  INACTIVE: false,
  INVALID: false,
};

const RulesTab: React.FC<RulesTabProps> = ({
  targetTabId,
  currentGroupId,
  oktaOrigin,
  selectedRuleId,
  onRuleSelected,
  onNavigateToGroup,
  onExportRules,
  listView,
  onListViewConsumed,
  isActive = true,
  scrollRootRef,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<RulesFilterType>('all');
  const [sortMode, setSortMode] = useState<RuleSortMode>('default');
  const [activePanel, setActivePanel] = useState<RulesPanel>('none');
  const [showFilters, setShowFilters] = useState(false);
  const [tierOpen, setTierOpen] = useState(false);
  const [isConfirmingActivate, setIsConfirmingActivate] = useState(false);
  const [restoreAttempted, setRestoreAttempted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusRuleId, setFocusRuleId] = useState<string | null>(null);
  const activeRuleId = selectedRuleId ?? focusRuleId;

  const handleError = useCallback((message: string) => setError(message || null), []);

  const handleResult = useCallback(({ message, type }: OperationResult) => {
    if (type === 'error') setError(message || null);
  }, []);

  const api = useOktaApi({
    targetTabId: targetTabId ?? null,
    oktaOrigin,
    onResult: handleResult,
  });
  const impact = useRuleImpact(api.captureRuleImpact);
  const data = useRulesData({ targetTabId, onError: handleError, currentGroupId, oktaOrigin });
  const { rules, stats, loadRules } = data;
  const lifecycle = useRuleLifecycle({
    targetTabId,
    rules,
    reload: loadRules,
    onError: handleError,
  });
  const consolidation = useRuleConsolidation({
    targetTabId,
    reload: () => loadRules(true),
    onError: handleError,
  });

  const mergeableClusters = React.useMemo<MergeableRuleGroup[]>(
    () =>
      findMergeableRuleGroups(
        rules.map(
          (r) =>
            ({
              id: r.id,
              name: r.name,
              status: r.status,
              type: 'group_rule',
              created: r.created,
              lastUpdated: r.lastUpdated,
              conditions: { expression: { value: r.conditionExpression || '', type: '' } },
              actions: { assignUserToGroups: { groupIds: r.groupIds } },
            }) as OktaGroupRule,
        ),
      ),
    [rules],
  );

  const handleMergeCluster = (cluster: MergeableRuleGroup) => {
    consolidation.openMerge(
      cluster.rules[0].id,
      cluster.rules.map((r) => ({ id: r.id, name: r.name, status: r.status })),
      cluster.unionGroupIds,
    );
  };

  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        const savedState = await TabStateManager.loadTabState<RulesTabState>('rules');
        if (savedState) {
          log.debug('Loaded persisted state from TabStateManager');
          data.hydrate({
            rules: savedState.cachedRules,
            stats: savedState.cachedStats,
            lastFetchTime: savedState.lastFetchTime,
          });
          if (savedState.searchQuery) setSearchQuery(savedState.searchQuery);
          if (savedState.activeFilter) setActiveFilter(savedState.activeFilter);
          if (savedState.sortMode) setSortMode(savedState.sortMode);
        }
      } catch (err) {
        log.error('Failed to load persisted state:', err);
      } finally {
        setRestoreAttempted(true);
      }
    };

    loadPersistedState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isActive) void TabStateManager.markTabVisited('rules');
  }, [isActive]);

  const listViewHandledRef = useRef<RulesListView | null>(null);
  useEffect(() => {
    if (!listView) {
      listViewHandledRef.current = null;
      return;
    }
    if (!restoreAttempted || listViewHandledRef.current === listView) return;
    listViewHandledRef.current = listView;
    setSearchQuery('');
    setActiveFilter(listView);
    onListViewConsumed?.();
  }, [listView, restoreAttempted, onListViewConsumed]);

  const listViewLoadRef = useRef<RulesListView | null>(null);
  useEffect(() => {
    if (!listView) {
      listViewLoadRef.current = null;
      return;
    }
    if (
      restoreAttempted &&
      rules.length === 0 &&
      !data.isLoading &&
      targetTabId != null &&
      listViewLoadRef.current !== listView
    ) {
      listViewLoadRef.current = listView;
      void loadRules(false);
    }
  }, [listView, restoreAttempted, rules.length, data.isLoading, targetTabId, loadRules]);

  const deepLinkLoadRef = useRef<string | null>(null);
  useEffect(() => {
    if (!activeRuleId) {
      deepLinkLoadRef.current = null;
      return;
    }
    if (
      restoreAttempted &&
      rules.length === 0 &&
      !data.isLoading &&
      targetTabId != null &&
      deepLinkLoadRef.current !== activeRuleId
    ) {
      deepLinkLoadRef.current = activeRuleId;
      void loadRules(false);
    }
  }, [activeRuleId, restoreAttempted, rules.length, data.isLoading, targetTabId, loadRules]);

  useEffect(() => {
    if (rules.length > 0) {
      saveRulesTabState({
        cachedRules: rules,
        cachedStats: stats,
        lastFetchTime: data.lastFetchTime,
        searchQuery,
        activeFilter,
        sortMode,
      }).catch((err) => log.error('Failed to persist state:', err));
    }
  }, [rules, stats, data.lastFetchTime, searchQuery, activeFilter, sortMode]);

  const toRuleImpactInput = (rule: FormattedRule): RuleImpactInput => ({
    id: rule.id,
    name: rule.name,
    groupIds: rule.groupIds,
    groupNames: rule.groupNames,
  });

  const handlePreviewImpact = useCallback(
    (rule: FormattedRule) => impact.open(toRuleImpactInput(rule), 'preview'),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see the note above.
    [impact.open],
  );

  const handleRequestDeactivate = useCallback(
    (ruleId: string) => {
      const rule = rules.find((r) => r.id === ruleId);
      if (rule) impact.open(toRuleImpactInput(rule), 'deactivate');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rules, impact.open],
  );

  const handleConfirmDeactivate = () => {
    const ruleId = impact.rule?.id;
    impact.close();
    if (ruleId) void lifecycle.deactivateRule(ruleId);
  };

  const handleConfirmActivate = () => {
    const ruleId = openRule?.id;
    setIsConfirmingActivate(false);
    if (ruleId) void lifecycle.activateRule(ruleId);
  };

  const scopedRules = React.useMemo(
    () =>
      rules.map((r) => {
        const affectsCurrentGroup = targetsGroup(r, currentGroupId);
        return Boolean(r.affectsCurrentGroup) === affectsCurrentGroup
          ? r
          : { ...r, affectsCurrentGroup };
      }),
    [rules, currentGroupId],
  );

  const filteredRules = React.useMemo(() => {
    let result = filterRules(scopedRules, searchQuery);
    switch (activeFilter) {
      case 'active':
        result = result.filter((r) => IN_FORCE[r.status]);
        break;
      case 'paused':
        result = result.filter((r) => !IN_FORCE[r.status]);
        break;
      case 'conflicts':
        result = result.filter((r) => r.conflicts && r.conflicts.length > 0);
        break;
      case 'current-group':
        result = result.filter((r) => targetsGroup(r, currentGroupId));
        break;
    }
    return sortRules(result, sortMode);
  }, [scopedRules, searchQuery, activeFilter, sortMode, currentGroupId]);

  const currentGroupRelationCount = React.useMemo(
    () => countCurrentGroupRuleRelations(rules, currentGroupId),
    [rules, currentGroupId],
  );

  const ruleViewRef = useRef<HTMLDivElement>(null);
  const nav = useViewStack<FormattedRule>({
    rootLabel: 'Group Rules',
    getLabel: (entry) => entry.name,
    getKey: (entry) => entry.id,
    viewRef: ruleViewRef,
  });
  const { push: pushRule, pop: popRule, currentEntry } = nav;

  const captureListScroll = useScrollPreservation(scrollRootRef ?? ruleViewRef, nav.isRoot);

  const openRule = currentEntry
    ? (rules.find((r) => r.id === currentEntry.id) ?? currentEntry)
    : null;

  const identity = openRule ? ruleIdentity(openRule) : null;

  const [tierRung, setTierRung] = useState<string | null>(null);
  const openRuleKey = openRule?.id ?? null;
  if (tierRung !== openRuleKey) {
    setTierRung(openRuleKey);
    setTierOpen(false);
    setIsConfirmingActivate(false);
  }

  const handleOpenRule = useCallback(
    (ruleToOpen: FormattedRule) => {
      captureListScroll();
      pushRule(ruleToOpen);
    },
    [captureListScroll, pushRule],
  );

  const togglePanel = useCallback(
    (panel: RulesPanel) => setActivePanel((prev) => (prev === panel ? 'none' : panel)),
    [],
  );

  const handleLoadOrRefresh = useCallback(() => {
    loadRules(rules.length > 0);
  }, [loadRules, rules.length]);

  const handleLoadFromEmptyState = useCallback(() => {
    loadRules(false);
  }, [loadRules]);

  useEffect(() => {
    if (!activeRuleId) return;
    const target = rules.find((r) => r.id === activeRuleId);
    if (!target) return; // not loaded yet; the loader effect above handles it
    if (currentEntry?.id === activeRuleId) return; // already showing it
    log.debug('Opening rule rung:', activeRuleId);
    captureListScroll();
    pushRule(target);
    onRuleSelected?.();
    setFocusRuleId(null);
  }, [activeRuleId, rules, currentEntry, captureListScroll, pushRule, onRuleSelected]);

  return (
    <div className="tab-content active" style={{ fontFamily: 'var(--font-primary)', padding: 0 }}>
      <PageHeader
        title={identity ? identity.name : 'Group Rules'}
        subtitle={identity ? undefined : 'Analyze group rules and detect potential conflicts'}
        onBack={identity ? popRule : undefined}
        backLabel="Back to rules"
        breadcrumbs={identity ? <Breadcrumbs items={nav.trail} /> : undefined}
        sticky={isActive}
        identityKey={identity?.key}
        identity={identity ? <EntityIdentity rows={identity.rows} /> : undefined}
        badge={
          identity
            ? identity.badge
            : stats.conflicts > 0
              ? { text: `${stats.conflicts} Conflicts`, variant: 'warning' }
              : undefined
        }
      />

      <div
        hidden={!nav.isRoot}
        className={`max-w-7xl mx-auto px-(--sp-gutter) py-(--sp-gutter) space-y-(--sp-rung) ${
          nav.transition === 'pop' ? 'animate-pop-in' : ''
        }`}
      >
        <RulesListActionBar
          search={
            rules.length > 0 ? (
              <RulesSearchRow
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filtersOpen={showFilters}
                onToggleFilters={() => setShowFilters((prev) => !prev)}
                activeFilterCount={countActiveRuleFilters(activeFilter, sortMode)}
              />
            ) : undefined
          }
          hasRules={rules.length > 0}
          isLoading={data.isLoading}
          onLoad={handleLoadOrRefresh}
          duplicateClusterCount={mergeableClusters.length}
          hasCurrentGroup={Boolean(currentGroupId)}
          currentGroupRelationCount={currentGroupRelationCount}
          activePanel={activePanel}
          onTogglePanel={togglePanel}
          onExportRules={onExportRules}
        />

        {rules.length > 0 && showFilters && (
          <RulesFilterPanel
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            conflictsCount={stats.conflicts}
            showCurrentGroup={Boolean(currentGroupId)}
            sortMode={sortMode}
            onSortChange={setSortMode}
          />
        )}

        {activePanel === 'stats' && rules.length > 0 && <RulesStatsGrid stats={stats} />}

        {activePanel === 'duplicates' && mergeableClusters.length > 0 && (
          <RulesDuplicatesPanel
            clusters={mergeableClusters}
            onMerge={handleMergeCluster}
            onFocusRule={setFocusRuleId}
          />
        )}

        {activePanel === 'currentGroup' && (
          <CurrentGroupRuleRelations
            rules={rules}
            currentGroupId={currentGroupId}
            onFocusRule={setFocusRuleId}
          />
        )}

        <RulesMetaRow
          apiCost={data.apiCost}
          lastFetchTime={data.lastFetchTime}
          hasRules={rules.length > 0}
        />

        {error && (
          <AlertMessage
            message={{ text: error, type: 'danger' }}
            onDismiss={() => setError(null)}
          />
        )}

        {lifecycle.actorNotice && (
          <AlertMessage message={lifecycle.actorNotice} onDismiss={lifecycle.dismissActorNotice} />
        )}

        <RulesListPanel
          isLoading={data.isLoading}
          hasRules={rules.length > 0}
          filteredRules={filteredRules}
          onLoad={handleLoadFromEmptyState}
          onOpenRule={handleOpenRule}
          selectedRuleId={activeRuleId}
        />
      </div>

      {openRule && (
        <div
          ref={ruleViewRef}
          tabIndex={-1}
          className="max-w-7xl mx-auto px-(--sp-gutter) py-(--sp-gutter) animate-push-in"
        >
          <RuleDetailView
            rule={openRule}
            oktaOrigin={oktaOrigin}
            onPreviewImpact={
              openRule.groupIds.length > 0 ? () => handlePreviewImpact(openRule) : undefined
            }
            tierOpen={tierOpen}
            onTierOpenChange={setTierOpen}
            isConfirmingActivate={isConfirmingActivate}
            onRequestActivate={() => setIsConfirmingActivate(true)}
            onCancelActivate={() => setIsConfirmingActivate(false)}
            onConfirmActivate={handleConfirmActivate}
            onRequestDeactivate={() => handleRequestDeactivate(openRule.id)}
            onAddTargetGroup={() => consolidation.openAddTarget(openRule)}
            sticky={isActive}
          />
        </div>
      )}

      <RuleImpactModal
        isOpen={impact.rule !== null}
        ruleName={impact.rule?.name ?? ''}
        mode={impact.mode}
        status={impact.status}
        summary={impact.summary}
        error={impact.error}
        progress={impact.progress}
        onClose={impact.close}
        onConfirmDeactivate={handleConfirmDeactivate}
        onNavigateToGroup={
          onNavigateToGroup
            ? (groupId) => {
                impact.close();
                onNavigateToGroup(groupId);
              }
            : undefined
        }
      />

      <RuleConsolidationModal
        phase={consolidation.phase}
        preview={consolidation.preview}
        result={consolidation.result}
        error={consolidation.error}
        actorNotice={consolidation.actorNotice}
        onDismissActorNotice={consolidation.dismissActorNotice}
        searchGroups={api.searchGroups}
        onChooseGroup={consolidation.chooseGroup}
        onExecute={consolidation.execute}
        onClose={consolidation.close}
      />
    </div>
  );
};

export default RulesTab;
