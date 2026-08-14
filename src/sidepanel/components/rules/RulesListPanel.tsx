import React from 'react';
import { useStaggerReveal } from '../../hooks/useStaggerReveal';
import RuleCard from '../RuleCard';
import EmptyState from '../shared/EmptyState';
import ScrollableList from '../shared/ScrollableList';
import type { FormattedRule } from '../../../shared/types';

interface RulesListPanelProps {
  isLoading: boolean;
  hasRules: boolean;
  filteredRules: FormattedRule[];
  onLoad: () => void;
  onActivate: (ruleId: string) => void;
  onDeactivate: (ruleId: string) => void;
  onPreviewImpact: (rule: FormattedRule) => void;
  onAddTargetGroup: (rule: FormattedRule) => void;
  oktaOrigin?: string | null;
  selectedRuleId?: string | null;
}

const RulesListPanel: React.FC<RulesListPanelProps> = ({
  isLoading,
  hasRules,
  filteredRules,
  onLoad,
  onActivate,
  onDeactivate,
  onPreviewImpact,
  onAddTargetGroup,
  oktaOrigin,
  selectedRuleId,
}) => {
  const setStaggerRef = useStaggerReveal();

  return (
    <div className="min-h-[400px]">
      <ScrollableList
        loading={isLoading}
        loadingMessage={selectedRuleId ? 'Loading requested rule…' : 'Loading rules...'}
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
          <div ref={setStaggerRef} className="space-y-3 rise-in-stagger">
            {filteredRules.map((rule) => (
              <div key={rule.id} data-rule-id={rule.id}>
                <RuleCard
                  rule={rule}
                  onActivate={onActivate}
                  onDeactivate={onDeactivate}
                  onPreviewImpact={onPreviewImpact}
                  onAddTargetGroup={onAddTargetGroup}
                  oktaOrigin={oktaOrigin}
                  isHighlighted={selectedRuleId === rule.id}
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
