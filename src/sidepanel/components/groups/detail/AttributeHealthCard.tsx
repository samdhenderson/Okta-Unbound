import React, { useId, useState } from 'react';
import RuleLinkRow from './RuleLinkRow';
import AttributeSpreadBar from './AttributeSpreadBar';
import { spreadSegments } from './attributeSpread';
import { Badge, Button, ListRow, StretchedButton, type BadgeVariant } from '../../shared';
import Icon from '../../shared/Icon';
import {
  attributeTailCount,
  outlierValues,
  NONE_VALUE,
  type AttributeSignal,
  type AttributeSignalKind,
  type AttributeSummary,
} from '../../members/memberAnalytics';
import type { AttributeRuleRef } from '../../../../shared/rules/groupAttributeIndex';

const SIGNAL_VARIANT: Record<AttributeSignalKind, BadgeVariant> = {
  drift: 'warning',
  tail: 'neutral',
  rule: 'primary',
};

export interface AttributeHealthCardProps {
  summary: AttributeSummary;
  signals?: readonly AttributeSignal[];
  rules: AttributeRuleRef[];
  onNavigateToRule?: (ruleId: string) => void;
  onShowOther?: () => void;
  defaultExpanded?: boolean;
}

const AttributeHealthCard: React.FC<AttributeHealthCardProps> = ({
  summary,
  signals = [],
  rules,
  onNavigateToRule,
  onShowOther,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const bodyId = useId();
  const titleId = useId();

  const outliers = new Set(outlierValues(summary));
  const segments = spreadSegments(summary.rows);
  const blanks = summary.rows.find((row) => row.value === NONE_VALUE);
  const tailCount = attributeTailCount(summary);

  return (
    <ListRow
      headerClassName="relative"
      body={
        <div id={bodyId} className="disclose" data-open={expanded} inert={!expanded || undefined}>
          <div>
            <div className="space-y-3 border-t border-neutral-100 px-(--sp-card) pb-(--sp-card) pt-3">
              {segments.length > 0 && (
                <ul className="space-y-1">
                  {segments.map(({ row, background }) => (
                    <li
                      key={row.value}
                      className="flex items-center justify-between gap-(--sp-inline) text-xs"
                    >
                      <span className="flex min-w-0 items-center gap-(--sp-inline)">
                        <span
                          aria-hidden="true"
                          className="size-2 shrink-0 rounded-xs"
                          style={{ background }}
                        />
                        <span
                          className={`min-w-0 truncate font-mono ${
                            outliers.has(row.value) ? 'text-warning-text' : 'text-neutral-700'
                          }`}
                          title={
                            outliers.has(row.value) ? 'Diverges from the dominant value' : row.label
                          }
                        >
                          {outliers.has(row.value) && (
                            <span className="me-1 font-sans font-medium">Outlier:</span>
                          )}
                          {row.label}
                        </span>
                      </span>
                      <span className="shrink-0 tabular-nums text-neutral-500">
                        {row.count.toLocaleString()} ({Math.round(row.pct)}%)
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {blanks && blanks.count > 0 && (
                <p className="border-t border-neutral-100 pt-2 text-xs text-neutral-500">
                  Blank in {blanks.count.toLocaleString()} of {summary.total.toLocaleString()}{' '}
                  members ({Math.round(blanks.pct)}%) — not a value.
                </p>
              )}

              {onShowOther && tailCount > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  icon="chevron-right"
                  iconPosition="right"
                  onClick={onShowOther}
                >
                  Show all {summary.distinct.toLocaleString()} values
                </Button>
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
                          onSelect={
                            onNavigateToRule ? () => onNavigateToRule(rule.ruleId) : undefined
                          }
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      }
    >
      <StretchedButton
        label={`${expanded ? 'Hide' : 'Show'} the value breakdown for ${summary.key}`}
        describedBy={titleId}
        expanded={expanded}
        controls={bodyId}
        onClick={() => setExpanded((open) => !open)}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-(--sp-inline)">
          <code
            id={titleId}
            className="truncate font-mono text-sm font-semibold text-neutral-900"
            title={summary.label}
          >
            {summary.key}
          </code>
          <Icon
            type="chevron-right"
            size="sm"
            aria-hidden="true"
            className={`shrink-0 text-neutral-400 transition-transform duration-(--dur-quick) ${
              expanded ? 'rotate-90' : ''
            }`}
          />
        </div>

        {signals.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {signals.map((signal) => (
              <li key={signal.kind}>
                <Badge variant={SIGNAL_VARIANT[signal.kind]} title={signal.description}>
                  {signal.label}
                </Badge>
              </li>
            ))}
          </ul>
        )}

        <AttributeSpreadBar rows={summary.rows} />

        <p className="text-xs text-neutral-600">
          {summary.distinct.toLocaleString()} value{summary.distinct === 1 ? '' : 's'} ·{' '}
          {Math.round(summary.fillRate)}% populated
        </p>
      </div>
    </ListRow>
  );
};

export default AttributeHealthCard;
