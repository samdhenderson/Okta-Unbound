import React from 'react';
import Icon from '../../shared/Icon';
import { StableWidth } from '../../shared';
import type { IconType } from '../../shared/Icon';
import type { TabKey } from './comparisonAnalytics';

interface ComparisonTabBarProps {
  activeTab: TabKey;
  onChange: (t: TabKey) => void;
  groupDiff: number;
  appDiff: number;
  attributeDiff: number;
}

type ComparisonTab = {
  key: TabKey;
  label: string;
  icon: Extract<IconType, 'chart' | 'users' | 'app' | 'list'>;
  badge?: number;
};

const ComparisonTabBar: React.FC<ComparisonTabBarProps> = ({
  activeTab,
  onChange,
  groupDiff,
  appDiff,
  attributeDiff,
}) => {
  const tabs: ComparisonTab[] = [
    { key: 'overview', label: 'Overview', icon: 'chart' },
    { key: 'groups', label: 'Groups', icon: 'users', badge: groupDiff },
    { key: 'apps', label: 'Apps', icon: 'app', badge: appDiff },
    { key: 'attributes', label: 'Attributes', icon: 'list', badge: attributeDiff },
  ];

  return (
    <div
      role="tablist"
      className="grid grid-cols-2 items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 p-1 sm:grid-cols-4"
    >
      {tabs.map((t) => {
        const active = activeTab === t.key;
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.key)}
            className={`press press-subtle relative flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
              active
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <Icon type={t.icon} size="sm" />
            <span>{t.label}</span>
            {t.badge !== undefined && (
              <StableWidth
                reserve={
                  <span className="inline-flex min-w-[18px] px-1.5 text-xs leading-none">00</span>
                }
                align="center"
                className="ml-0.5 shrink-0"
              >
                {t.badge > 0 && (
                  <span
                    className={`inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 text-xs font-medium tabular-nums leading-none ${
                      active ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </StableWidth>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ComparisonTabBar;
