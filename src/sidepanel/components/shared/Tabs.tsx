import React, { useRef } from 'react';
import Icon, { type IconType } from '../shared/Icon';
import StableWidth from './StableWidth';
import Tooltip, { type TooltipTriggerProps } from './Tooltip';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useTabRail } from '../../hooks/useTabRail';

export interface TabItem {
  key: string;
  label: string;
  count?: number;
  countDisplay?: TabCountDisplay;
  icon?: IconType;
}

export type TabCountDisplay = 'always' | 'nonzero';

export type TabsVariant = 'underline' | 'rail';

interface TabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  variant?: TabsVariant;
  ariaLabel?: string;
  className?: string;
}

const HEADING_FONT = { fontFamily: 'var(--font-heading)' };

const listClassesByVariant: Record<TabsVariant, string> = {
  underline:
    'flex items-center gap-1 border-b border-neutral-200 overflow-x-auto overflow-y-hidden',
  rail:
    'relative flex items-center gap-0.5 pb-1.5 overflow-x-auto overflow-y-hidden ' +
    '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden ' +
    'data-[overflow=start]:[mask-image:linear-gradient(to_right,transparent,black_1.5rem)] ' +
    'data-[overflow=end]:[mask-image:linear-gradient(to_left,transparent,black_1.5rem)] ' +
    'data-[overflow=both]:[mask-image:linear-gradient(to_right,transparent,black_1.5rem,black_calc(100%_-_1.5rem),transparent)]',
};

const TAB_BASE = 'relative flex items-center text-xs focus-visible:outline-none';

const RING_FOCUS = 'focus-visible:ring-2 focus-visible:ring-primary';

const BADGE_BASE =
  'inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 text-xs font-bold tabular-nums leading-none';

const BADGE_RESERVE = 'inline-flex min-w-[18px] px-1.5 text-xs leading-none';

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeKey,
  onChange,
  variant = 'underline',
  ariaLabel,
  className = '',
}) => {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const isRail = variant === 'rail';
  const reducedMotion = useReducedMotion();

  const { edge, indicator, sliding } = useTabRail({
    listRef,
    activeKey,
    tabCount: tabs.length,
    reducedMotion,
  });

  const activeIndex = tabs.findIndex((tab) => tab.key === activeKey);
  const anchorIndex = activeIndex === -1 ? 0 : activeIndex;

  const focusTab = (index: number) => {
    const clamped = (index + tabs.length) % tabs.length;
    const tab = tabs[clamped];
    if (!tab) return;
    onChange(tab.key);
    buttonRefs.current[clamped]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        focusTab(index + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        focusTab(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusTab(0);
        break;
      case 'End':
        event.preventDefault();
        focusTab(tabs.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      ref={isRail ? listRef : undefined}
      data-overflow={isRail ? edge : undefined}
      className={`${listClassesByVariant[variant]} ${className}`}
    >
      {tabs.map((tab, index) => {
        const active = tab.key === activeKey;

        const railClasses = `${TAB_BASE} shrink-0 rounded-md p-2.5 transition-colors duration-(--dur-instant) focus-visible:inset-ring-2 focus-visible:inset-ring-primary ${
          active
            ? 'text-primary-text font-semibold'
            : 'font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
        }`;

        const tabClasses = isRail
          ? railClasses
          : `${TAB_BASE} ${RING_FOCUS} gap-1.5 whitespace-nowrap px-3 py-2.5 font-semibold border-b-2 transition-colors duration-(--dur-instant) ${
              active
                ? 'text-primary border-primary'
                : 'text-neutral-600 border-transparent hover:text-neutral-900'
            }`;

        const badgeClasses = active
          ? 'bg-primary-light text-primary-text'
          : 'bg-neutral-100 text-neutral-600';

        const pillClasses = `${BADGE_BASE} ${badgeClasses}`;
        const badge =
          tab.count === undefined ? null : tab.countDisplay === 'nonzero' ? (
            <StableWidth
              reserve={<span className={BADGE_RESERVE}>00</span>}
              align="center"
              className="ml-0.5 shrink-0"
            >
              {tab.count > 0 && <span className={pillClasses}>{tab.count}</span>}
            </StableWidth>
          ) : (
            <span className={`ml-0.5 ${pillClasses}`}>{tab.count}</span>
          );

        const renderTab = (trigger?: TooltipTriggerProps) => (
          <button
            key={tab.key}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={isRail ? tab.label : undefined}
            tabIndex={index === anchorIndex ? 0 : -1}
            onClick={() => onChange(tab.key)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={tabClasses}
            style={HEADING_FONT}
            {...trigger}
          >
            {isRail && tab.icon ? (
              <>
                <span aria-hidden="true" className="flex shrink-0 items-center">
                  <Icon type={tab.icon} size="sm" />
                </span>
                <span
                  className={`grid transition-[grid-template-columns] duration-(--dur-move) ease-standard ${
                    reducedMotion ? '' : 'delay-(--dur-move)'
                  } ${active ? 'grid-cols-[1fr]' : 'grid-cols-[0fr]'}`}
                >
                  <span className="min-w-0 overflow-hidden whitespace-nowrap">
                    <span className="ps-1.5">{tab.label}</span>
                  </span>
                </span>
              </>
            ) : (
              <>
                {tab.icon && (
                  <span aria-hidden="true" className="flex shrink-0 items-center">
                    <Icon type={tab.icon} size="sm" />
                  </span>
                )}
                <span>{tab.label}</span>
              </>
            )}
            {badge}
          </button>
        );

        return isRail ? (
          <Tooltip key={tab.key} label={tab.label}>
            {renderTab}
          </Tooltip>
        ) : (
          renderTab()
        );
      })}
      {isRail && (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-primary ${
            sliding ? 'transition-[left,width] duration-(--dur-move) ease-glide' : ''
          }`}
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
    </div>
  );
};

export default Tabs;
