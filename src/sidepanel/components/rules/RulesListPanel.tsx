import React from 'react';
import { useStaggerReveal } from '../../hooks/useStaggerReveal';
import RuleCard from '../RuleCard';
import EmptyState from '../shared/EmptyState';
import ScrollableList from '../shared/ScrollableList';
import Skeleton from '../shared/Skeleton';
import type { FormattedRule } from '../../../shared/types';

interface RulesListPanelProps {
  isLoading: boolean;
  hasRules: boolean;
  filteredRules: FormattedRule[];
  onLoad: () => void;
  onOpenRule: (rule: FormattedRule) => void;
  selectedRuleId?: string | null;
  selectedRuleIds: Set<string>;
  onToggleSelect: (ruleId: string) => void;
}

const RulesListPanel: React.FC<RulesListPanelProps> = ({
  isLoading,
  hasRules,
  filteredRules,
  onLoad,
  onOpenRule,
  selectedRuleId,
  selectedRuleIds,
  onToggleSelect,
}) => {
  const setStaggerRef = useStaggerReveal();

  const loadingMessage = selectedRuleId ? 'Loading requested rule…' : 'Loading rules...';

  return (
    <div className="min-h-[400px]">
      <ScrollableList
        loading={isLoading}
        loadingMessage={loadingMessage}
        skeleton={<Skeleton variant="row" size="lg" count={6} label={loadingMessage} />}
        fillAvailable={false}
        testId="rules-list"
        emptyState={
          !hasRules ? (
            <EmptyState
              icon="list"
              title="No Rules Loaded"
              description='Click "Load Rules" to analyze your Okta group rules'
              actions={[{ label: 'Load Rules', onClick: onLoad, variant: 'primary' }]}
            />
          ) : (
            <EmptyState
              icon="search"
              title="No Matching Rules"
              description="No rules match your search or filter criteria"
            />
          )
        }
      >
        {filteredRules.length > 0 && (
          <div ref={setStaggerRef} className="space-y-(--sp-rung) rise-in-stagger">
            {filteredRules.map((rule) => (
              <div key={rule.id} data-rule-id={rule.id}>
                <RuleCard
                  rule={rule}
                  onOpenRule={onOpenRule}
                  isHighlighted={selectedRuleId === rule.id}
                  selected={selectedRuleIds.has(rule.id)}
                  onToggleSelect={onToggleSelect}
                />
              </div>
            ))}
          </div>
        )}
      </ScrollableList>
    </div>
  );
};

export default RulesListPanel;
