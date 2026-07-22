import React, { useState } from 'react';
import ActivityBarView from './ActivityBarView';
import { useActivityBar } from '../hooks/useActivityBar';
import { useIsNarrow } from '../hooks/useIsNarrow';

const COMPACT_BELOW_PX = 640;

const ActivityBar: React.FC = () => {
  const { view, cancel } = useActivityBar();
  const [confirming, setConfirming] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isNarrow = useIsNarrow(COMPACT_BELOW_PX);

  const collapsible = isNarrow;
  const collapsed = isNarrow && !expanded;

  const handleCancel = () => {
    if (confirming) return;
    setConfirming(true);
    const pending = view.queueLength;
    const detail =
      pending > 0 ? ` and clear ${pending} pending request${pending === 1 ? '' : 's'}` : '';
    if (window.confirm(`Cancel the current operation${detail}?`)) {
      cancel();
    }
    setConfirming(false);
  };

  return (
    <ActivityBarView
      view={view}
      onCancel={handleCancel}
      collapsible={collapsible}
      collapsed={collapsed}
      onToggleCollapse={() => setExpanded((prev) => !prev)}
    />
  );
};

export default ActivityBar;
