import React from 'react';
import RuleLinkRow from './RuleLinkRow';
import { Badge } from '../../shared';
import { outlierValues, type AttributeSummary } from '../../members/memberAnalytics';
import type { AttributeRuleRef } from '../../../../shared/rules/groupAttributeIndex';

export interface AttributeHealthCardProps {
  summary: AttributeSummary;
  rules: AttributeRuleRef[];
  onNavigateToRule?: (ruleId: string) => void;
}

const AttributeHealthCard: React.FC<AttributeHealthCardProps> = ({
  summary,
  rules,
  onNavigateToRule,
}) => {
  const outliers = new Set(outlierValues(summary));
  const values = summary.rows.filter((row) => row.count > 0);

  return (
    <div className="space-y-3 rounded-md border border-neutral-200 bg-white p-4">
      <div className="flex items-baseline justify-between gap-2">
        <code
          className="truncate font-mono text-sm font-semibold text-neutral-900"
          title={summary.label}
        >
          {summary.key}
        </code>
        <span className="flex shrink-0 items-center gap-1.5">
          {outliers.size > 0 && (
            <Badge
              variant="warning"
              title="Some members' values diverge from the dominant one — a likely spelling or casing drift, not a verdict."
            >
              {outliers.size} outlier{outliers.size === 1 ? '' : 's'}
            </Badge>
          )}
          <span className="text-xs text-neutral-500">
            {Math.round(summary.fillRate)}% populated
          </span>
        </span>
      </div>
      <div aria-hidden="true" className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full rounded-full bg-primary" style={{ width: `${summary.fillRate}%` }} />
      </div>
      <p className="text-xs text-neutral-600">
        {summary.distinct.toLocaleString()} distinct value{summary.distinct === 1 ? '' : 's'} across{' '}
        {summary.populated.toLocaleString()} of {summary.total.toLocaleString()} members.
      </p>
      {values.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-neutral-600">Values</h3>
          <ul className="mt-1.5 space-y-1">
            {values.map((row) => (
              <li key={row.value} className="flex items-baseline justify-between gap-2 text-xs">
                <span
                  className={`min-w-0 truncate font-mono ${
                    outliers.has(row.value) ? 'text-warning-text' : 'text-neutral-700'
                  }`}
                  title={outliers.has(row.value) ? 'Diverges from the dominant value' : undefined}
                >
                  {outliers.has(row.value) && (
                    <span className="me-1 font-sans font-medium">Outlier:</span>
                  )}
                  {row.label}
                </span>
                <span className="shrink-0 tabular-nums text-neutral-500">
                  {row.count.toLocaleString()} ({Math.round(row.pct)}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {rules.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-neutral-600">
            Depended on by {rules.length} rule{rules.length === 1 ? '' : 's'}
          </h3>
          <ul className="mt-1.5 space-y-1.5">
            {rules.map((rule) => (
              <li key={rule.ruleId}>
                <RuleLinkRow
                  name={rule.ruleName}
                  onSelect={onNavigateToRule ? () => onNavigateToRule(rule.ruleId) : undefined}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AttributeHealthCard;
