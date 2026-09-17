import React, { useMemo, useState } from 'react';
import { Badge, EmptyState, Eyebrow, FilterPill, IconButton, Input, Skeleton } from '../shared';
import Icon from '../shared/Icon';
import type { ProfileDisplayConfig } from '../../../shared/storage/profileDisplayStore';
import type { AttributeDescriptor } from './profileAttributes';
import { buildAttributeBlocks } from './profileAttributeBlocks';
import type { ProfileRuleReads } from './profileRuleReads';
import UserProfileAttributeList from './UserProfileAttributeList';
import UserProfilePaneHeader, {
  type ProfileDisplayCustomizeControls,
  type ProfileEditControls,
} from './UserProfilePaneHeader';
import ProfileDisplayEditor from './ProfileDisplayEditor';
import type { AttributeEditCell } from '../../hooks/useProfileEdit';

export interface UserProfilePaneProps {
  attributes: readonly AttributeDescriptor[];
  config: ProfileDisplayConfig;
  ruleReads: ProfileRuleReads | undefined;
  customize?: ProfileDisplayCustomizeControls;
  isLoading?: boolean;
  edit?: ProfileEditControls;
  cells?: Readonly<Record<string, AttributeEditCell>>;
}

function fieldCountLabel(count: number): string {
  return count === 1 ? '1 field' : `${count} fields`;
}

const UserProfilePane: React.FC<UserProfilePaneProps> = ({
  attributes,
  config,
  ruleReads,
  customize,
  isLoading = false,
  edit,
  cells,
}) => {
  const [filter, setFilter] = useState('');
  const [onlyRuleRead, setOnlyRuleRead] = useState(false);

  const isCustomizing = customize?.isCustomizing ?? false;

  const canFilterByRuleRead = ruleReads !== undefined;
  const isOnlyRuleRead = onlyRuleRead && canFilterByRuleRead;

  const beginCustomizing = (): void => {
    setOnlyRuleRead(false);
    customize?.onBegin();
  };

  const blocks = useMemo(
    () =>
      buildAttributeBlocks(attributes, config, ruleReads, { filter, onlyRuleRead: isOnlyRuleRead }),
    [attributes, config, ruleReads, filter, isOnlyRuleRead],
  );

  const shown = blocks.reduce((sum, block) => sum + block.attributes.length, 0);
  const total = new Set(attributes.map((attribute) => attribute.name)).size;
  const readCount = ruleReads
    ? blocks.reduce(
        (sum, block) =>
          sum + block.attributes.filter((attribute) => ruleReads[attribute.name]?.length).length,
        0,
      )
    : undefined;

  const configureActions = customize
    ? [{ label: 'Configure display', onClick: beginCustomizing, variant: 'secondary' as const }]
    : undefined;

  const isFiltered = filter.trim() !== '' || isOnlyRuleRead;
  const clearFilters = (): void => {
    setFilter('');
    setOnlyRuleRead(false);
  };

  return (
    <div>
      <UserProfilePaneHeader
        shown={shown}
        total={total}
        ruleReadCount={readCount}
        customize={customize && { ...customize, onBegin: beginCustomizing }}
        edit={edit}
      />

      <div className="px-(--sp-card) pb-(--sp-card) space-y-(--sp-field)">
        <Input
          size="sm"
          value={filter}
          onChange={setFilter}
          placeholder="Filter attributes…"
          ariaLabel="Filter attributes"
          icon={<Icon type="search" size="sm" />}
          trailingInteractive
          trailing={
            filter ? (
              <IconButton
                label="Clear attribute filter"
                variant="ghost"
                size="sm"
                onClick={() => setFilter('')}
              >
                <Icon type="close" size="sm" />
              </IconButton>
            ) : undefined
          }
        />
        <div className="flex flex-wrap gap-(--sp-inline)">
          <FilterPill active={!isOnlyRuleRead} onClick={() => setOnlyRuleRead(false)}>
            All attributes
          </FilterPill>
          <FilterPill
            active={isOnlyRuleRead}
            onClick={() => setOnlyRuleRead(true)}
            unavailableReason={
              canFilterByRuleRead
                ? undefined
                : 'The group rules have not been read, so which attributes they use is unknown.'
            }
          >
            Used by rules
          </FilterPill>
        </div>
      </div>

      {isCustomizing && customize ? (
        <ProfileDisplayEditor
          attributes={attributes}
          config={config}
          ruleReads={ruleReads}
          filter={filter}
          onCommit={customize.onCommit}
          onCancel={customize.onCancel}
        />
      ) : isLoading ? (
        <div className="px-(--sp-card) pb-(--sp-card)">
          <Skeleton variant="row" size="md" count={4} label="Loading profile attributes" />
        </div>
      ) : blocks.length === 0 ? (
        isFiltered ? (
          <EmptyState
            icon="search"
            title="No attributes match"
            description="Nothing in this profile matches the current filter."
            actions={[{ label: 'Clear filter', onClick: clearFilters, variant: 'secondary' }]}
          />
        ) : (
          <EmptyState
            icon="settings"
            title="No attributes to show"
            description="Every attribute is hidden, or empty on this user and set not to show."
            actions={configureActions}
          />
        )
      ) : (
        <div>
          {blocks.map((block) => (
            <section
              key={block.key}
              aria-label={block.name}
              className="border-t border-neutral-200 p-(--sp-card) first:border-t-0"
            >
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <Eyebrow as="h3">{block.name}</Eyebrow>
                <Badge variant="neutral">{fieldCountLabel(block.attributes.length)}</Badge>
              </div>
              <UserProfileAttributeList
                attributes={block.attributes}
                layout={config.layout}
                showApiNames={config.showApiNames}
                showRuleChips={config.showRuleChips}
                ruleReads={ruleReads}
                cells={cells}
              />
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfilePane;
