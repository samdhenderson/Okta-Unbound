import React from 'react';
import { Tabs } from './shared';
import { TAB_DEFS, type TabType } from '../tabs';

export type { TabType } from '../tabs';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TAB_ITEMS = TAB_DEFS.map(({ id, label }) => ({ key: id, label }));

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => (
  <nav className="sticky top-0 z-40 bg-white">
    <Tabs
      tabs={TAB_ITEMS}
      activeKey={activeTab}
      onChange={(key) => onTabChange(key as TabType)}
      variant="underline"
      ariaLabel="Main sections"
    />
  </nav>
);

export default TabNavigation;
