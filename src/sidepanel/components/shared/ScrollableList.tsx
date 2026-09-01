import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ScrollableListProps {
  children: React.ReactNode;
  className?: string;
  emptyState?: React.ReactNode;
  loading?: boolean;
  loadingMessage?: string;
  skeleton?: React.ReactNode;
  maxHeight?: string;
  fillAvailable?: boolean;
  scrolls?: boolean;
  scrollRef?: React.Ref<HTMLDivElement>;
  testId?: string;
}

const ScrollableList: React.FC<ScrollableListProps> = ({
  children,
  className = '',
  emptyState,
  loading = false,
  loadingMessage = 'Loading...',
  maxHeight,
  fillAvailable = true,
  scrolls = true,
  skeleton,
  scrollRef,
  testId,
}) => {
  const childArray = React.Children.toArray(children);
  const isEmpty = childArray.length === 0;

  const boxClasses = (leading: string) =>
    [leading, fillAvailable ? 'flex-1 min-h-0' : '', className].filter(Boolean).join(' ');

  const gutter = scrolls ? 'scrollable-list' : '';

  const containerStyle: React.CSSProperties | undefined = maxHeight ? { maxHeight } : undefined;

  if (loading) {
    return (
      <div
        className={boxClasses(`overflow-hidden ${gutter}`.trim())}
        style={containerStyle}
        data-testid={testId}
      >
        {skeleton ?? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="2xl" message={loadingMessage} centered />
          </div>
        )}
      </div>
    );
  }

  if (isEmpty && emptyState) {
    return (
      <div
        className={boxClasses(`overflow-hidden ${gutter}`.trim())}
        style={containerStyle}
        data-testid={testId}
      >
        {emptyState}
      </div>
    );
  }

  if (isEmpty) {
    return null;
  }

  return (
    <div
      ref={scrollRef}
      className={boxClasses(scrolls ? `overflow-y-auto ${gutter}` : '')}
      style={containerStyle}
      data-testid={testId}
    >
      <div className="space-y-3">{children}</div>
    </div>
  );
};

export default ScrollableList;
