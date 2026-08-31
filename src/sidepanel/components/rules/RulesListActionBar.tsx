import React from 'react';
import { ActionBar, type ActionDescriptor } from '../shared';

export type RulesPanel = 'none' | 'duplicates' | 'currentGroup' | 'stats';

interface RulesListActionBarProps {
  search?: React.ReactNode;
  hasRules: boolean;
  isLoading: boolean;
  onLoad: () => void;
  duplicateClusterCount: number;
  hasCurrentGroup: boolean;
  currentGroupRelationCount: number;
  activePanel: RulesPanel;
  onTogglePanel: (panel: RulesPanel) => void;
  onExportRules?: () => void;
}

const RulesListActionBar: React.FC<RulesListActionBarProps> = ({
  search,
  hasRules,
  isLoading,
  onLoad,
  duplicateClusterCount,
  hasCurrentGroup,
  currentGroupRelationCount,
  activePanel,
  onTogglePanel,
  onExportRules,
}) => {
  const panelAction = (
    panel: Exclude<RulesPanel, 'none'>,
    closedLabel: string,
    openLabel: string,
    icon: ActionDescriptor['icon'],
    title: string,
  ): ActionDescriptor => {
    const open = activePanel === panel;
    return {
      id: panel,
      label: open ? openLabel : closedLabel,
      icon,
      onClick: () => onTogglePanel(panel),
      priority: open ? 'pinned' : 'tier',
      title,
    };
  };

  const actions: ActionDescriptor[] = [
    {
      id: 'load',
      label: hasRules ? 'Refresh' : 'Load rules',
      icon: 'refresh',
      variant: 'primary',
      onClick: onLoad,
      disabled: isLoading,
      loading: isLoading,
      title: hasRules
        ? 'Re-fetch every group rule from Okta, bypassing the cache'
        : 'Fetch every group rule in the org',
    },
    ...(onExportRules
      ? [
          {
            id: 'export-rules',
            label: 'Export rules',
            icon: 'download',
            onClick: onExportRules,
            title: 'Export every group rule as CSV (opens the Export tab with a column picker)',
          } satisfies ActionDescriptor,
        ]
      : []),

    ...(duplicateClusterCount > 0
      ? [
          panelAction(
            'duplicates',
            `Duplicates (${duplicateClusterCount})`,
            'Hide duplicates',
            'link',
            `${duplicateClusterCount} set${duplicateClusterCount === 1 ? '' : 's'} of rules share an identical condition`,
          ),
        ]
      : []),
    ...(hasCurrentGroup
      ? [
          panelAction(
            'currentGroup',
            currentGroupRelationCount > 0
              ? `This group (${currentGroupRelationCount})`
              : 'This group',
            'Hide this group',
            'users',
            'Rules that feed, or refer to, the group open in the Okta tab',
          ),
        ]
      : []),
    ...(hasRules
      ? [
          panelAction(
            'stats',
            'Stats',
            'Hide stats',
            'chart',
            'Totals for the loaded rules: active, inactive, conflicting',
          ),
        ]
      : []),
  ];

  return (
    <ActionBar
      ariaLabel="Actions for the rules list"
      actions={actions}
      subRow={search}
      testId="rules-list-action-bar"
    />
  );
};

export default RulesListActionBar;
