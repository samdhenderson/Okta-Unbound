import React from 'react';
import RuleCard from '../RuleCard';
import LoadingSpinner from '../shared/LoadingSpinner';
import EmptyState from '../shared/EmptyState';
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
}) => (
  <div className="min-h-[400px]">
    {isLoading ? (
      <LoadingSpinner
        size="lg"
        message={selectedRuleId ? 'Loading requested rule…' : 'Loading rules...'}
        centered
      />
    ) : !hasRules ? (
      <EmptyState
        icon="list"
        title="No Rules Loaded"
        description='Click "Load Rules" to analyze your Okta group rules'
        actions={[{ label: 'Load Rules', onClick: onLoad, variant: 'primary' }]}
      />
    ) : filteredRules.length === 0 ? (
      <EmptyState
        icon="search"
        title="No Matching Rules"
        description="No rules match your search or filter criteria"
      />
    ) : (
      <div className="space-y-3">
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
  </div>
);

export default RulesListPanel;
