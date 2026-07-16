import React, { useState } from 'react';
import ActivityBarView from './ActivityBarView';
import { useActivityBar } from '../hooks/useActivityBar';

const ActivityBar: React.FC = () => {
  const { view, cancel } = useActivityBar();
  const [confirming, setConfirming] = useState(false);

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

  return <ActivityBarView view={view} onCancel={handleCancel} />;
};

export default ActivityBar;
