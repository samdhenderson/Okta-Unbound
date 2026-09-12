import React from 'react';
import RuleExpressionText, { type GroupNameResolver } from './RuleExpressionText';
import { UNEVALUABLE_REASON_TEXT } from '../../../shared/rules/unevaluableReasonText';
import type { RuleMatchResult } from '../../../shared/ruleEvaluator';

export interface RawExpressionWellProps {
  expression: string;
  result?: RuleMatchResult;
  resolveGroupName?: GroupNameResolver;
}

function resolvedValueText(result: RuleMatchResult): string {
  if (result.outcome === 'match') return 'true';
  if (result.outcome === 'no-match') return 'false';
  return UNEVALUABLE_REASON_TEXT[result.reasonCode];
}

const RawExpressionWell: React.FC<RawExpressionWellProps> = ({
  expression,
  result,
  resolveGroupName,
}) => {
  const unevaluable = result?.outcome === 'unevaluable';

  return (
    <div className="bg-canvas overflow-x-auto rounded-md p-(--sp-card)">
      <RuleExpressionText text={expression} resolveGroupName={resolveGroupName} />
      {result && (
        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-neutral-600">
          <span className="font-medium">Resolved value</span>
          <span className={`font-mono ${unevaluable ? '' : 'text-neutral-900'}`}>
            {resolvedValueText(result)}
          </span>
        </div>
      )}
    </div>
  );
};

export default RawExpressionWell;
