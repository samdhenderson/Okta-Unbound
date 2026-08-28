import React from 'react';
import Icon from '../shared/Icon';

export type BreadcrumbsSize = 'sm' | 'md';

export interface BreadcrumbItem {
  key: string;
  label: string;
  onSelect?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  size?: BreadcrumbsSize;
  ariaLabel?: string;
  className?: string;
}

const sizeClasses: Record<BreadcrumbsSize, string> = {
  sm: 'text-xs gap-1',
  md: 'text-sm gap-2',
};

const separatorSize: Record<BreadcrumbsSize, 'sm' | 'md'> = {
  sm: 'sm',
  md: 'md',
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  size = 'sm',
  ariaLabel = 'Breadcrumb',
  className = '',
}) => {
  if (items.length === 0) return null;

  return (
    <nav aria-label={ariaLabel} className={className}>
      <ol className={`flex items-center flex-wrap ${sizeClasses[size]}`}>
        {items.map((item, index) => (
          <li key={item.key} className="flex items-center min-w-0">
            {index > 0 && (
              <span aria-hidden="true" className="flex shrink-0 text-neutral-400">
                <Icon type="chevron-right" size={separatorSize[size]} />
              </span>
            )}
            {item.onSelect ? (
              <button
                type="button"
                onClick={item.onSelect}
                className="max-w-48 truncate rounded-md px-1 font-medium text-neutral-600 transition-colors duration-(--dur-instant) hover:text-neutral-900 hover:underline focus:outline-2 focus:outline-offset-2 focus:outline-primary"
              >
                {item.label}
              </button>
            ) : (
              <span
                aria-current="page"
                className="max-w-48 truncate px-1 font-semibold text-neutral-900"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
