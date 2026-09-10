import React from 'react';
import { Tabs } from '../../shared';
import type { TabItem } from '../../shared';
import type { TabKey } from './comparisonAnalytics';

interface ComparisonTabBarProps {
  activeTab: TabKey;
  onChange: (t: TabKey) => void;
}

type ComparisonTab = TabItem & { key: TabKey };

const isTabKey = (tabs: ComparisonTab[], key: string): key is TabKey =>
  tabs.some((tab) => tab.key === key);

const ComparisonTabBar: React.FC<ComparisonTabBarProps> = ({ activeTab, onChange }) => {
  const tabs: ComparisonTab[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'groups', label: 'Groups' },
    { key: 'apps', label: 'Apps' },
    { key: 'attributes', label: 'Attributes' },
  ];

  return (
    <Tabs
      tabs={tabs}
      activeKey={activeTab}
      onChange={(key) => {
        if (isTabKey(tabs, key)) onChange(key);
      }}
      ariaLabel="Comparison sections"
    />
  );
};

export default ComparisonTabBar;
