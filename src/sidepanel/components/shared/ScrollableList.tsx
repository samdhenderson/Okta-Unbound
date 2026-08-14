import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ScrollableListProps {
  children: React.ReactNode;
  className?: string;
  emptyState?: React.ReactNode;
  loading?: boolean;
  loadingMessage?: string;
  maxHeight?: string;
  fillAvailable?: boolean;
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
  scrollRef,
  testId,
}) => {
  const childArray = React.Children.toArray(children);
  const isEmpty = childArray.length === 0;

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center py-12 ${fillAvailable ? 'flex-1' : ''}`}
        data-testid={testId}
      >
        <LoadingSpinner size="2xl" message={loadingMessage} centered />
      </div>
    );
  }

  if (isEmpty && emptyState) {
    return (
      <div className={fillAvailable ? 'flex-1' : ''} data-testid={testId}>
        {emptyState}
      </div>
    );
  }

  if (isEmpty) {
    return null;
  }

  const containerClasses = [
    'overflow-y-auto',
    fillAvailable ? 'flex-1 min-h-0' : '',
    'scrollable-list',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const containerStyle: React.CSSProperties | undefined = maxHeight ? { maxHeight } : undefined;

  return (
    <div ref={scrollRef} className={containerClasses} style={containerStyle} data-testid={testId}>
      <div className="space-y-3">{children}</div>
    </div>
  );
};

export default ScrollableList;
