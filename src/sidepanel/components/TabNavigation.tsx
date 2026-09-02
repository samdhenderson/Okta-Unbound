import React from 'react';
import { Button, Tabs, type TabItem } from './shared';
import { RAIL_TAB_DEFS, type TabType } from '../tabs';

export type { TabType } from '../tabs';

export type ShortcutPlatform = 'apple' | 'other';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenCommandPalette: () => void;
  shortcutPlatform?: ShortcutPlatform;
}

const CHORD_GLYPH: Record<ShortcutPlatform, string> = {
  apple: '⌘K',
  other: 'Ctrl K',
};

const CHORD_SPOKEN: Record<ShortcutPlatform, string> = {
  apple: 'Command K',
  other: 'Ctrl K',
};

function isApplePlatform(): boolean {
  return /Mac|iPhone|iPad|iPod/.test(globalThis.navigator.userAgent);
}

const TAB_ITEMS: TabItem[] = RAIL_TAB_DEFS.map(({ id, label, icon }) => ({
  key: id,
  label,
  icon,
}));

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  onOpenCommandPalette,
  shortcutPlatform,
}) => {
  const platform: ShortcutPlatform = shortcutPlatform ?? (isApplePlatform() ? 'apple' : 'other');

  return (
    <nav className="shrink-0 flex items-center bg-white border-b border-neutral-200">
      <Tabs
        tabs={TAB_ITEMS}
        activeKey={activeTab}
        onChange={(key) => onTabChange(key as TabType)}
        variant="rail"
        ariaLabel="Main sections"
        className="min-w-0 flex-1"
      />
      <Button
        variant="ghost"
        size="sm"
        icon="search"
        onClick={onOpenCommandPalette}
        className="shrink-0 mb-1.5 me-(--sp-gutter)"
      >
        <span className="sr-only">Search and jump to a section, {CHORD_SPOKEN[platform]}</span>
        <span aria-hidden="true">{CHORD_GLYPH[platform]}</span>
      </Button>
    </nav>
  );
};

export default TabNavigation;
