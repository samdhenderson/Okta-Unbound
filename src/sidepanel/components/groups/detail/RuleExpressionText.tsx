import React, { useMemo } from 'react';
import { EntityLink } from '../../shared';

export type GroupNameResolver = (groupId: string) => string | undefined;

export interface RuleExpressionTextProps {
  text: string;
  resolveGroupName?: GroupNameResolver;
  className?: string;
}

type ExpressionSegment =
  | { readonly kind: 'text'; readonly text: string }
  | { readonly kind: 'group'; readonly id: string; readonly name: string };

const QUOTED_LITERAL = /"([^"]*)"|'([^']*)'/g;

function segmentExpression(
  text: string,
  resolveGroupName?: GroupNameResolver,
): readonly ExpressionSegment[] {
  if (!resolveGroupName || text.length === 0) return [{ kind: 'text', text }];

  const segments: ExpressionSegment[] = [];
  let cursor = 0;

  for (const match of text.matchAll(QUOTED_LITERAL)) {
    const start = match.index;
    if (start === undefined) continue;
    const id = match[1] ?? match[2] ?? '';
    const name = resolveGroupName(id);
    if (name === undefined) continue;

    if (start > cursor) segments.push({ kind: 'text', text: text.slice(cursor, start) });
    segments.push({ kind: 'group', id, name });
    cursor = start + match[0].length;
  }

  if (cursor < text.length) segments.push({ kind: 'text', text: text.slice(cursor) });
  return segments;
}

const RuleExpressionText: React.FC<RuleExpressionTextProps> = ({
  text,
  resolveGroupName,
  className = '',
}) => {
  const segments = useMemo(
    () => segmentExpression(text, resolveGroupName),
    [text, resolveGroupName],
  );

  return (
    <code className={className}>
      {segments.map((segment, index) =>
        segment.kind === 'text' ? (
          <React.Fragment key={`text-${index}`}>{segment.text}</React.Fragment>
        ) : (
          <EntityLink
            key={`group-${index}`}
            type="group"
            id={segment.id}
            name={segment.name}
            copyId
            copyIdLabel={`Copy group id ${segment.id}`}
            className="align-middle"
          />
        ),
      )}
    </code>
  );
};

export default RuleExpressionText;
