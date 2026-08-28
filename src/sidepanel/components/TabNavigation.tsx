import React from 'react';
import { Tabs, type TabItem } from './shared';
import { TAB_DEFS, type TabType } from '../tabs';

export type { TabType } from '../tabs';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TAB_ITEMS: TabItem[] = TAB_DEFS.map(({ id, label, icon }) => ({ key: id, label, icon }));

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => (
  <nav className="shrink-0 bg-white border-b border-neutral-200">
    <Tabs
      tabs={TAB_ITEMS}
      activeKey={activeTab}
      onChange={(key) => onTabChange(key as TabType)}
      variant="rail"
      ariaLabel="Main sections"
    />
  </nav>
);

export default TabNavigation;
