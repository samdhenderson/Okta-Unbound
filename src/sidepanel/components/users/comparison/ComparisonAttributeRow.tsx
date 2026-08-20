import React from 'react';
import { Badge } from '../../shared';
import ProfileEditCell from '../ProfileEditCell';
import type { AttributeDescriptor } from '../profileAttributes';
import type { AttributeParityRow, AttributeVerdict } from './attributeParity';
import type { AttributeEditCell } from '../../../hooks/useProfileEdit';

export interface ComparisonAttributeRowProps {
  row: AttributeParityRow;
  contextName: string;
  comparedName: string;
  showApiNames: boolean;
  readers?: readonly string[];
  contextCell?: AttributeEditCell;
  comparedCell?: AttributeEditCell;
}

const ruleChipLabel = (count: number): string => (count === 1 ? '1 rule' : `${count} rules`);

function markerFor(
  verdict: AttributeVerdict,
  contextName: string,
  comparedName: string,
): { glyph: string; label: string; matched: boolean } {
  switch (verdict) {
    case 'same':
      return { glyph: '=', label: 'Both users have the same value', matched: true };
    case 'bothEmpty':
      return { glyph: '=', label: 'Neither user has a value', matched: true };
    case 'onlyContext':
      return { glyph: '≠', label: `Only ${contextName} has a value`, matched: false };
    case 'onlyCompared':
      return { glyph: '≠', label: `Only ${comparedName} has a value`, matched: false };
    default:
      return { glyph: '≠', label: 'The two users have different values', matched: false };
  }
}

const cellAttribute = (row: AttributeParityRow, value: string): AttributeDescriptor => ({
  key: row.key,
  name: row.name,
  label: row.label,
  kind: row.kind,
  value,
  raw: undefined,
  isEmpty: value === '',
});

const ValueCell: React.FC<{
  userName: string;
  row: AttributeParityRow;
  value: string;
  cell?: AttributeEditCell;
}> = ({ userName, row, value, cell }) => (
  <span
    className="flex min-h-9 min-w-0 flex-col justify-center gap-0.5 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1"
    title={cell ? undefined : value === '' ? `${userName} has no value for this attribute` : value}
  >
    <span className="truncate text-xs text-neutral-500">{userName}</span>
    {cell ? (
      <ProfileEditCell
        attribute={cellAttribute(row, value)}
        editability={cell.editability}
        draft={cell.draft}
        editing
        onChange={cell.onChange}
        invalid={cell.invalid}
      />
    ) : value === '' ? (
      <span className="text-xs text-neutral-400 italic">— not set</span>
    ) : (
      <span className="min-w-0 text-sm break-words text-pretty text-neutral-900">{value}</span>
    )}
  </span>
);

function hypothetical(contextValue: string, comparedValue: string): string {
  if (contextValue === comparedValue) {
    return contextValue === ''
      ? 'Saving would leave neither user with a value here.'
      : 'Saving would make the two values match.';
  }
  return 'The two values would still differ after saving.';
}

const EditedBadge: React.FC<{ userName: string; wouldBe: string }> = ({ userName, wouldBe }) => (
  <Badge
    variant="warning"
    title={`${userName} has an unsaved change to this attribute. The marker still describes what Okta holds today. ${wouldBe}`}
  >
    Edited<span className="sr-only">: {userName}</span>
  </Badge>
);

const ComparisonAttributeRow: React.FC<ComparisonAttributeRowProps> = ({
  row,
  contextName,
  comparedName,
  showApiNames,
  readers,
  contextCell,
  comparedCell,
}) => {
  const marker = markerFor(row.verdict, contextName, comparedName);
  const wouldBe = hypothetical(
    contextCell?.draft ?? row.contextValue,
    comparedCell?.draft ?? row.comparedValue,
  );

  return (
    <li className="flex flex-col gap-1.5 px-3 py-2 hover:bg-neutral-50/70">
      <span className="flex min-w-0 flex-wrap items-center gap-1.5">
        <span
          className={`min-w-0 truncate text-sm text-neutral-800 ${showApiNames ? 'font-mono' : ''}`}
          title={showApiNames ? row.label : row.name}
        >
          {showApiNames ? row.name : row.label}
        </span>
        {readers && readers.length > 0 && (
          <Badge variant="primary" title={`Read by: ${readers.join(', ')}`}>
            {ruleChipLabel(readers.length)}
          </Badge>
        )}
        {row.hiddenByConfig && (
          <Badge
            variant="neutral"
            title="Your display configuration hides this attribute. It is shown here because the two users differ on it."
          >
            Hidden
          </Badge>
        )}
        {contextCell?.dirty && <EditedBadge userName={contextName} wouldBe={wouldBe} />}
        {comparedCell?.dirty && <EditedBadge userName={comparedName} wouldBe={wouldBe} />}
      </span>

      <span className="grid grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)] items-stretch gap-2">
        <ValueCell userName={contextName} row={row} value={row.contextValue} cell={contextCell} />
        <span
          role="img"
          aria-label={marker.label}
          title={marker.label}
          className={`flex min-h-9 items-center justify-center rounded-md border font-mono text-sm font-bold ${
            marker.matched
              ? 'border-success-light bg-success-light text-success-text'
              : 'border-warning-light bg-warning-light text-warning-text'
          }`}
        >
          {marker.glyph}
        </span>
        <ValueCell
          userName={comparedName}
          row={row}
          value={row.comparedValue}
          cell={comparedCell}
        />
      </span>
    </li>
  );
};

export default ComparisonAttributeRow;
