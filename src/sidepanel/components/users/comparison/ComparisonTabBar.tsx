import React from 'react';
import { Tabs } from '../../shared';
import type { TabItem } from '../../shared';
import type { IconType } from '../../shared/Icon';
import type { TabKey } from './comparisonAnalytics';

interface ComparisonTabBarProps {
  activeTab: TabKey;
  onChange: (t: TabKey) => void;
  groupDiff: number;
  appDiff: number;
  attributeDiff: number;
}

type ComparisonTab = TabItem & {
  key: TabKey;
  icon: Extract<IconType, 'chart' | 'users' | 'app' | 'list'>;
};

const isTabKey = (tabs: ComparisonTab[], key: string): key is TabKey =>
  tabs.some((tab) => tab.key === key);

const ComparisonTabBar: React.FC<ComparisonTabBarProps> = ({
  activeTab,
  onChange,
  groupDiff,
  appDiff,
  attributeDiff,
}) => {
  const tabs: ComparisonTab[] = [
    { key: 'overview', label: 'Overview', icon: 'chart' },
    { key: 'groups', label: 'Groups', icon: 'users', count: groupDiff, countDisplay: 'nonzero' },
    { key: 'apps', label: 'Apps', icon: 'app', count: appDiff, countDisplay: 'nonzero' },
    {
      key: 'attributes',
      label: 'Attributes',
      icon: 'list',
      count: attributeDiff,
      countDisplay: 'nonzero',
    },
  ];

  return (
    <Tabs
      tabs={tabs}
      activeKey={activeTab}
      onChange={(key) => {
        if (isTabKey(tabs, key)) onChange(key);
      }}
      variant="segmented"
      wrap
      ariaLabel="Comparison sections"
    />
  );
};

export default ComparisonTabBar;
