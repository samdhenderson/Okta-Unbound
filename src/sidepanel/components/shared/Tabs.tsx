import React, { useRef } from 'react';
import Icon, { type IconType } from '../shared/Icon';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useTabRail } from '../../hooks/useTabRail';

export interface TabItem {
  key: string;
  label: string;
  count?: number;
  icon?: IconType;
}

export type TabsVariant = 'underline' | 'segmented' | 'rail';

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
  segmented: 'flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 p-1',
  underline:
    'flex items-center gap-1 border-b border-neutral-200 overflow-x-auto overflow-y-hidden',
  rail:
    'relative flex items-center gap-0.5 border-b border-neutral-200 overflow-x-auto overflow-y-hidden ' +
    '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden ' +
    'data-[overflow=start]:[mask-image:linear-gradient(to_right,transparent,black_1.5rem)] ' +
    'data-[overflow=end]:[mask-image:linear-gradient(to_left,transparent,black_1.5rem)] ' +
    'data-[overflow=both]:[mask-image:linear-gradient(to_right,transparent,black_1.5rem,black_calc(100%_-_1.5rem),transparent)]',
};

const TAB_BASE =
  'relative flex items-center text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

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
  const isSegmented = variant === 'segmented';
  const isRail = variant === 'rail';
  const reducedMotion = useReducedMotion();

  const { edge, indicator } = useTabRail({
    listRef,
    activeKey,
    tabCount: tabs.length,
    reducedMotion,
  });

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

        const railClasses = `${TAB_BASE} shrink-0 rounded-t-md px-3 py-2.5 transition-colors duration-(--dur-instant) ${
          active ? 'text-primary' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
        }`;

        const tabClasses = isRail
          ? railClasses
          : isSegmented
            ? `${TAB_BASE} flex-1 justify-center gap-1.5 rounded-md px-3 py-1.5 transition-all duration-(--dur-instant) ${
                active
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`
            : `${TAB_BASE} gap-1.5 whitespace-nowrap px-3 py-2.5 border-b-2 transition-colors duration-(--dur-instant) ${
                active
                  ? 'text-primary border-primary'
                  : 'text-neutral-600 border-transparent hover:text-neutral-900'
              }`;

        const badgeClasses = isSegmented
          ? active
            ? 'bg-primary text-white'
            : 'bg-neutral-200 text-neutral-700'
          : active
            ? 'bg-primary-light text-primary-text'
            : 'bg-neutral-100 text-neutral-600';

        return (
          <button
            key={tab.key}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={isRail ? tab.label : undefined}
            title={isRail ? tab.label : undefined}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.key)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={tabClasses}
            style={HEADING_FONT}
          >
            {isRail && tab.icon ? (
              <>
                <span aria-hidden="true" className="flex shrink-0 items-center">
                  <Icon type={tab.icon} size="sm" />
                </span>
                <span
                  className={`grid transition-[grid-template-columns] duration-(--dur-move) ease-standard ${
                    active ? 'grid-cols-[1fr]' : 'grid-cols-[0fr]'
                  }`}
                >
                  <span className="min-w-0 overflow-hidden whitespace-nowrap ps-1.5">
                    {tab.label}
                  </span>
                </span>
              </>
            ) : (
              <span>{tab.label}</span>
            )}
            {tab.count !== undefined && (
              <span
                className={`ml-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none ${badgeClasses}`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
      {isRail && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-primary"
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
    </div>
  );
};

export default Tabs;
