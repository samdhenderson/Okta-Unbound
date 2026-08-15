import React, { useRef } from 'react';
import { Tabs, type TabItem } from './shared';
import { TAB_DEFS, type TabType } from '../tabs';
import { usePublishedHeight } from '../hooks/usePublishedHeight';

export type { TabType } from '../tabs';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TAB_ITEMS: TabItem[] = TAB_DEFS.map(({ id, label, icon }) => ({ key: id, label, icon }));

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const railRef = useRef<HTMLElement>(null);

  usePublishedHeight(railRef, '--rail-h');

  return (
    <nav ref={railRef} className="sticky top-0 z-40 bg-white">
      <Tabs
        tabs={TAB_ITEMS}
        activeKey={activeTab}
        onChange={(key) => onTabChange(key as TabType)}
        variant="rail"
        ariaLabel="Main sections"
      />
    </nav>
  );
};

export default TabNavigation;
