import React from 'react';
import type {
  ComparisonOperator,
  LeafPredicate,
  SubjectDescription,
  SubjectTransform,
} from '../../../shared/rules/explainExpression';
import type { RuleExprValue } from '../../../shared/ruleEvaluator';
import { formatRuleValue } from './ruleValueText';

const TRANSFORM_PARENTHETICAL: Partial<Record<SubjectTransform, string>> = {
  toLowerCase: 'lowercased',
  toUpperCase: 'uppercased',
  removeSpaces: 'spaces removed',
  toCsvString: 'joined as text',
};

const TRANSFORM_PREFIX: Partial<Record<SubjectTransform, string>> = {
  len: 'length of',
  size: 'count of',
};

const OPERATOR_WORDS: Record<ComparisonOperator, string> = {
  eq: 'equals',
  ne: 'does not equal',
  lt: 'is less than',
  lte: 'is at most',
  gt: 'is greater than',
  gte: 'is at least',
};

function attributeDisplayName(path: string): string {
  const dotted = /^user\.(.+)$/.exec(path);
  if (dotted?.[1]) return dotted[1];
  const computed = /^user\[(".*")\]$/.exec(path);
  if (computed?.[1]) {
    try {
      const parsed: unknown = JSON.parse(computed[1]);
      if (typeof parsed === 'string') return parsed;
    } catch {
      // Fall through: an unparseable key is printed as written rather than guessed at.
    }
  }
  return path;
}

const OperandText: React.FC<{ value: RuleExprValue }> = ({ value }) => (
  <span className="font-mono text-xs text-neutral-700">{formatRuleValue(value)}</span>
);

const SubjectText: React.FC<{ subject: SubjectDescription }> = ({ subject }) => {
  const prefixes = [...subject.transforms]
    .reverse()
    .map((transform) => TRANSFORM_PREFIX[transform])
    .filter((word): word is string => word !== undefined);
  const parentheticals = subject.transforms
    .map((transform) => TRANSFORM_PARENTHETICAL[transform])
    .filter((word): word is string => word !== undefined);

  return (
    <>
      {prefixes.length > 0 && `${prefixes.join(' ')} `}
      <b className="font-semibold">{attributeDisplayName(subject.path)}</b>
      {parentheticals.length > 0 && ` (${parentheticals.join(', ')})`}
    </>
  );
};

function membershipVerb(form: LeafPredicate['form'], negated: boolean): string {
  switch (form) {
    case 'starts-with':
      return negated ? 'does not start with' : 'starts with';
    case 'ends-with':
      return negated ? 'does not end with' : 'ends with';
    case 'array-contains':
      return negated ? 'does not include' : 'includes';
    default:
      return negated ? 'does not contain' : 'contains';
  }
}

const PhraseBody: React.FC<{ predicate: LeafPredicate }> = ({ predicate }) => {
  switch (predicate.form) {
    case 'compare':
      return (
        <>
          <SubjectText subject={predicate.subject} /> {OPERATOR_WORDS[predicate.operator]}{' '}
          <OperandText value={predicate.operand} />
        </>
      );
    case 'compare-subjects':
      return (
        <>
          <SubjectText subject={predicate.left} /> {OPERATOR_WORDS[predicate.operator]}{' '}
          <SubjectText subject={predicate.right} />
        </>
      );
    case 'contains':
    case 'starts-with':
    case 'ends-with':
    case 'array-contains':
      return (
        <>
          <SubjectText subject={predicate.subject} />{' '}
          {membershipVerb(predicate.form, predicate.negated)}{' '}
          <OperandText value={predicate.operand} />
        </>
      );
    case 'empty':
      return (
        <>
          <SubjectText subject={predicate.subject} />{' '}
          {predicate.negated ? 'is not empty' : 'is empty'}
        </>
      );
    case 'boolean-attribute':
      return (
        <>
          <SubjectText subject={predicate.subject} /> {predicate.negated ? 'is false' : 'is true'}
        </>
      );
  }
};

export interface ClausePhraseProps {
  predicate: LeafPredicate;
  className?: string;
}

const ClausePhrase: React.FC<ClausePhraseProps> = ({ predicate, className = '' }) => (
  <span className={`text-xs break-words text-neutral-900 ${className}`.trim()}>
    <PhraseBody predicate={predicate} />
  </span>
);

export default ClausePhrase;
