import React from 'react';
import Eyebrow from './Eyebrow';
import AlertMessage from './AlertMessage';
import ClauseLedgerClause from './ClauseLedgerClause';
import type { GroupNameResolver } from './RuleExpressionText';
import type {
  ClauseTreeNode,
  ClauseTruncation,
  ConnectiveNode,
} from '../../../shared/rules/explainExpression';

export interface ClauseLedgerBranchProps {
  node: ConnectiveNode;
  resolveGroupName?: GroupNameResolver;
}

export interface ClauseTreeNodeViewProps {
  node: ClauseTreeNode;
  resolveGroupName?: GroupNameResolver;
}

const CONNECTIVE_LABEL: Record<ConnectiveNode['kind'], string> = {
  and: 'All must match · AND',
  or: 'Any satisfies · OR',
};

const TRUNCATION_TEXT: Record<ClauseTruncation, string> = {
  depth:
    'Part of this condition is nested deeper than this view expands, so some of it is not shown.',
  'clause-cap':
    'This condition has more clauses than this view lists, so some of them are not shown.',
};

function kleeneNote(node: ConnectiveNode): string | undefined {
  if (node.verdict === 'not-evaluated') return undefined;
  if (node.undecidedChildCount === 0) return undefined;
  if (node.decidedByChildIndices.length === 0) return undefined;

  const decidedCount = node.decidedByChildIndices.length;
  const checkWord = node.undecidedChildCount === 1 ? 'check' : 'checks';

  if (node.kind === 'or' && node.verdict === 'pass') {
    const subject =
      decidedCount === 1 ? 'One alternative passes' : `${decidedCount} alternatives pass`;
    return `${subject}, so the OR passes — the unevaluated ${checkWord} cannot change it.`;
  }

  if (node.kind === 'and' && node.verdict === 'fail') {
    const subject =
      decidedCount === 1 ? 'One requirement fails' : `${decidedCount} requirements fail`;
    return `${subject}, so the AND fails — the unevaluated ${checkWord} cannot change it.`;
  }

  return undefined;
}

export const ClauseTreeNodeView: React.FC<ClauseTreeNodeViewProps> = ({
  node,
  resolveGroupName,
}) =>
  node.node === 'leaf' ? (
    <ClauseLedgerClause leaf={node} resolveGroupName={resolveGroupName} />
  ) : (
    <ClauseLedgerBranch node={node} resolveGroupName={resolveGroupName} />
  );

const ClauseLedgerBranch: React.FC<ClauseLedgerBranchProps> = ({ node, resolveGroupName }) => {
  const note = kleeneNote(node);

  return (
    <div className="space-y-2">
      <Eyebrow>{CONNECTIVE_LABEL[node.kind]}</Eyebrow>

      <div className="space-y-2 border-l-2 border-neutral-200 pl-3">
        {node.children.map((child, index) => (
          <ClauseTreeNodeView key={index} node={child} resolveGroupName={resolveGroupName} />
        ))}
      </div>

      {note && (
        <p className="mt-2 border-t border-neutral-100 pt-2 text-xs text-neutral-600">{note}</p>
      )}

      {node.truncation && (
        <AlertMessage message={{ text: TRUNCATION_TEXT[node.truncation], type: 'warning' }} />
      )}
    </div>
  );
};

export default ClauseLedgerBranch;
