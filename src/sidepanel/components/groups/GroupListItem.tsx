import React, { useState, useCallback, useMemo, memo } from 'react';
import { Checkbox, IconButton, ListRow, StretchedButton } from '../shared';
import Icon from '../shared/Icon';
import GroupListItemSignal from './GroupListItemSignal';
import GroupListItemDetails from './GroupListItemDetails';
import { summarizeGroupRow } from './groupSourceSummary';
import { useCachedMemberSource } from '../../hooks/useCachedMemberSource';
import type { GroupSummary } from '../../../shared/types';
import { oktaAdminEntityUrl } from '../../../shared/utils/oktaUrl';

const REVEAL_ON_HOVER =
  'opacity-0 transition-opacity duration-(--dur-instant) ' +
  'group-hover/row:opacity-100 group-focus-within/row:opacity-100 ' +
  'focus-within:opacity-100 [@media(hover:none)]:opacity-100';

interface GroupListItemProps {
  group: GroupSummary;
  selected: boolean;
  onToggleSelect: (groupId: string) => void;
  oktaOrigin?: string;
  onOpenDetail?: (group: GroupSummary) => void;
  onAnalyzeSource?: (group: GroupSummary) => void;
  isHighlighted?: boolean;
}

const GroupListItem: React.FC<GroupListItemProps> = memo(
  ({
    group,
    selected,
    onToggleSelect,
    oktaOrigin,
    onOpenDetail,
    onAnalyzeSource,
    isHighlighted = false,
  }) => {
    const [expanded, setExpanded] = useState(false);
    const [everExpanded, setEverExpanded] = useState(false);
    if (expanded && !everExpanded) setEverExpanded(true);
    const breakdown = useCachedMemberSource(group.id);
    const model = useMemo(() => summarizeGroupRow(group, breakdown), [group, breakdown]);

    const detailsId = `group-row-details-${group.id}`;
    const nameId = `group-row-name-${group.id}`;

    React.useEffect(() => {
      if (isHighlighted) setExpanded(true);
    }, [isHighlighted]);

    const handleToggleSelect = useCallback(() => {
      onToggleSelect(group.id);
    }, [onToggleSelect, group.id]);

    const toggleExpanded = useCallback(() => {
      setExpanded((prev) => !prev);
    }, []);

    const handleOpenDetail = useCallback(() => {
      onOpenDetail?.(group);
    }, [onOpenDetail, group]);

    const handleAnalyzeSource = useCallback(() => {
      onAnalyzeSource?.(group);
    }, [onAnalyzeSource, group]);

    const handleOpenInOkta = useCallback(() => {
      const url = oktaAdminEntityUrl(oktaOrigin, 'group', group.id);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    }, [oktaOrigin, group.id]);

    const canAnalyze = Boolean(onAnalyzeSource) && model.source.kind === 'unknown';

    return (
      <ListRow
        density="compact"
        state={isHighlighted ? 'highlighted' : selected ? 'selected' : 'default'}
        flash={isHighlighted}
        className="group/row"
        dataAttributes={{ 'data-group-id': group.id }}
        headerClassName="relative flex items-start gap-(--sp-field)"
        body={
          <div
            id={detailsId}
            className="disclose"
            data-open={expanded}
            inert={!expanded || undefined}
          >
            <div>
              {everExpanded && <GroupListItemDetails group={group} breakdown={breakdown} />}
            </div>
          </div>
        }
      >
        {onOpenDetail && (
          <StretchedButton
            label="View group details"
            describedBy={nameId}
            title={`Open the detail view for ${group.name}`}
            onClick={handleOpenDetail}
          />
        )}

        <div
          className={`relative z-10 flex items-center pt-0.5 ${selected ? '' : REVEAL_ON_HOVER}`}
        >
          <Checkbox
            checked={selected}
            onChange={handleToggleSelect}
            aria-label={`Select ${group.name}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-(--sp-inline)">
            <h3
              id={nameId}
              className="min-w-0 truncate text-sm font-semibold text-neutral-900 group-hover/row:text-primary-text"
            >
              {group.name}
            </h3>

            <span
              className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium ${model.typeBadge.className}`}
            >
              {model.typeBadge.label}
            </span>

            {model.sourceApp && (
              <span
                className="shrink-0 truncate rounded-md border border-primary-highlight bg-primary-light px-2 py-0.5 text-xs font-medium text-primary-text"
                title={`Mastered by ${model.sourceApp}`}
              >
                {model.sourceApp}
              </span>
            )}

            <div className="relative z-10 ml-auto flex shrink-0 items-center gap-0.5">
              {canAnalyze && (
                <span className={REVEAL_ON_HOVER}>
                  <IconButton
                    label="Analyze member source"
                    title={`Analyze where ${group.name}'s ${model.memberCount.toLocaleString()} ${model.memberNoun} came from — reads them all once`}
                    onClick={handleAnalyzeSource}
                    size="sm"
                  >
                    <Icon type="chart" size="sm" />
                  </IconButton>
                </span>
              )}

              {oktaOrigin && (
                <span className={REVEAL_ON_HOVER}>
                  <IconButton label="Open in Okta" onClick={handleOpenInOkta} size="sm">
                    <Icon type="external-link" size="sm" />
                  </IconButton>
                </span>
              )}

              <IconButton
                label={expanded ? 'Collapse' : 'Expand'}
                onClick={toggleExpanded}
                expanded={expanded}
                controls={detailsId}
                size="sm"
              >
                <Icon
                  type="chevron-right"
                  size="sm"
                  className={`transition-transform duration-(--dur-instant) ${expanded ? 'rotate-90' : ''}`}
                />
              </IconButton>
            </div>
          </div>

          <p
            className={`mt-0.5 truncate text-xs ${
              model.identity.kind === 'id' ? 'font-mono text-neutral-500' : 'text-neutral-600'
            }`}
            title={model.identity.title}
          >
            {model.identity.text}
          </p>

          <GroupListItemSignal model={model} />
        </div>
      </ListRow>
    );
  },
  (prev, next) =>
    prev.group.id === next.group.id &&
    prev.group.name === next.group.name &&
    prev.group.description === next.group.description &&
    prev.group.type === next.group.type &&
    prev.group.memberCount === next.group.memberCount &&
    prev.group.ruleCount === next.group.ruleCount &&
    prev.group.usedInRuleCount === next.group.usedInRuleCount &&
    prev.group.sourceAppName === next.group.sourceAppName &&
    prev.group.created === next.group.created &&
    prev.group.lastUpdated === next.group.lastUpdated &&
    prev.group.pushMappings === next.group.pushMappings &&
    prev.selected === next.selected &&
    prev.oktaOrigin === next.oktaOrigin &&
    prev.isHighlighted === next.isHighlighted &&
    prev.onToggleSelect === next.onToggleSelect &&
    prev.onOpenDetail === next.onOpenDetail &&
    prev.onAnalyzeSource === next.onAnalyzeSource,
);

GroupListItem.displayName = 'GroupListItem';

export default GroupListItem;
