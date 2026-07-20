import React, { useState, useEffect, useCallback } from 'react';
import RuleImpactModal from './RuleImpactModal';
import PageHeader from './shared/PageHeader';
import Button from './shared/Button';
import AlertMessage from './shared/AlertMessage';
import RulesMetaRow from './rules/RulesMetaRow';
import RulesStatsGrid from './rules/RulesStatsGrid';
import RulesToolbar, { type RulesFilterType } from './rules/RulesToolbar';
import RulesListPanel from './rules/RulesListPanel';
import RulesMergeBanner from './rules/RulesMergeBanner';
import RuleConsolidationModal from './RuleConsolidationModal';
import type { FormattedRule, OktaGroupRule } from '../../shared/types';
import { filterRules } from '../../shared/ruleUtils';
import { findMergeableRuleGroups, type MergeableRuleGroup } from '../../shared/rules/consolidation';
import { sortRules, type RuleSortMode } from '../../shared/rules/similarity';
import { useOktaApi } from '../hooks/useOktaApi';
import { useRuleImpact } from '../hooks/useRuleImpact';
import { useRulesData } from '../hooks/useRulesData';
import { useRuleLifecycle } from '../hooks/useRuleLifecycle';
import { useRuleConsolidation } from '../hooks/useRuleConsolidation';
import type { RuleImpactInput } from '../hooks/useOktaApi/ruleImpact';
import { TabStateManager, saveRulesTabState } from '../../shared/tabState/tabStateManager';
import type { RulesTabState } from '../../shared/tabState/types';
import { createLogger } from '../../shared/utils/logger';

const log = createLogger('RulesTab');

interface RulesTabProps {
  targetTabId?: number;
  currentGroupId?: string;
  oktaOrigin?: string | null;
  selectedRuleId?: string | null;
  onRuleSelected?: () => void;
  onNavigateToGroup?: (groupId: string) => void;
}

const RulesTab: React.FC<RulesTabProps> = ({
  targetTabId,
  currentGroupId,
  oktaOrigin,
  selectedRuleId,
  onRuleSelected,
  onNavigateToGroup,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<RulesFilterType>('all');
  const [sortMode, setSortMode] = useState<RuleSortMode>('default');
  const [error, setError] = useState<string | null>(null);
  const [focusRuleId, setFocusRuleId] = useState<string | null>(null);
  const activeRuleId = selectedRuleId ?? focusRuleId;

  const handleError = useCallback((message: string) => setError(message || null), []);

  const api = useOktaApi({ targetTabId: targetTabId ?? null, onResult: handleError });
  const impact = useRuleImpact(api.captureRuleImpact);
  const data = useRulesData({ targetTabId, onError: handleError, currentGroupId });
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
          if (savedState.scrollPosition) {
            setTimeout(() => window.scrollTo(0, savedState.scrollPosition), 100);
          }
        }
      } catch (err) {
        log.error('Failed to load persisted state:', err);
      }
    };

    loadPersistedState();
    TabStateManager.markTabVisited('rules');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeRuleId && rules.length > 0) {
      log.debug('Navigating to rule:', activeRuleId);
      const ruleElement = document.querySelector(`[data-rule-id="${activeRuleId}"]`);
      if (ruleElement) {
        ruleElement.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
        const t = setTimeout(() => {
          onRuleSelected?.();
          setFocusRuleId(null);
        }, 2000);
        return () => clearTimeout(t);
      } else {
        log.warn('Rule not found in DOM:', activeRuleId);
      }
    }
  }, [activeRuleId, rules, onRuleSelected]);

  useEffect(() => {
    if (rules.length > 0) {
      saveRulesTabState({
        cachedRules: rules,
        cachedStats: stats,
        lastFetchTime: data.lastFetchTime,
        searchQuery,
        activeFilter,
        sortMode,
        scrollPosition: window.scrollY,
      }).catch((err) => log.error('Failed to persist state:', err));
    }
  }, [rules, stats, data.lastFetchTime, searchQuery, activeFilter, sortMode]);

  useEffect(() => {
    const handleScroll = () => TabStateManager.updateScrollPosition('rules', window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toRuleImpactInput = (rule: FormattedRule): RuleImpactInput => ({
    id: rule.id,
    name: rule.name,
    groupIds: rule.groupIds,
    groupNames: rule.groupNames,
  });

  const handlePreviewImpact = (rule: FormattedRule) =>
    impact.open(toRuleImpactInput(rule), 'preview');

  const handleRequestDeactivate = (ruleId: string) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (rule) impact.open(toRuleImpactInput(rule), 'deactivate');
  };

  const handleConfirmDeactivate = () => {
    const ruleId = impact.rule?.id;
    impact.close();
    if (ruleId) void lifecycle.deactivateRule(ruleId);
  };

  const filteredRules = React.useMemo(() => {
    let result = filterRules(rules, searchQuery);
    switch (activeFilter) {
      case 'active':
        result = result.filter((r) => r.status === 'ACTIVE');
        break;
      case 'conflicts':
        result = result.filter((r) => r.conflicts && r.conflicts.length > 0);
        break;
      case 'current-group':
        result = result.filter((r) => r.affectsCurrentGroup);
        break;
    }
    return sortRules(result, sortMode);
  }, [rules, searchQuery, activeFilter, sortMode]);

  return (
    <div className="tab-content active" style={{ fontFamily: 'var(--font-primary)', padding: 0 }}>
      <PageHeader
        title="Group Rules"
        subtitle="Analyze group rules and detect potential conflicts"
        badge={
          stats.conflicts > 0
            ? { text: `${stats.conflicts} Conflicts`, variant: 'warning' }
            : undefined
        }
        actions={
          <Button
            variant={rules.length > 0 ? 'secondary' : 'primary'}
            icon="refresh"
            onClick={() => loadRules(rules.length > 0)}
            disabled={data.isLoading}
            loading={data.isLoading}
          >
            {rules.length > 0 ? 'Refresh' : 'Load Rules'}
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
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

        {rules.length > 0 && <RulesStatsGrid stats={stats} />}

        {rules.length > 0 && (
          <RulesMergeBanner
            clusters={mergeableClusters}
            onMerge={handleMergeCluster}
            onFocusRule={setFocusRuleId}
          />
        )}

        {rules.length > 0 && (
          <RulesToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            conflictsCount={stats.conflicts}
            showCurrentGroup={Boolean(currentGroupId)}
            sortMode={sortMode}
            onSortChange={setSortMode}
          />
        )}

        <RulesListPanel
          isLoading={data.isLoading}
          hasRules={rules.length > 0}
          filteredRules={filteredRules}
          onLoad={() => loadRules(false)}
          onActivate={lifecycle.activateRule}
          onDeactivate={handleRequestDeactivate}
          onPreviewImpact={handlePreviewImpact}
          onAddTargetGroup={consolidation.openAddTarget}
          oktaOrigin={oktaOrigin}
          selectedRuleId={activeRuleId}
        />
      </div>

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
        searchGroups={api.searchGroups}
        onChooseGroup={consolidation.chooseGroup}
        onExecute={consolidation.execute}
        onClose={consolidation.close}
      />
    </div>
  );
};

export default RulesTab;
