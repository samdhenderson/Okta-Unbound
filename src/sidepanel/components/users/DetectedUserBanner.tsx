import React from 'react';
import { Button } from '../shared';
import type { UserInfo } from '../../../shared/types';

interface DetectedUserBannerProps {
  userInfo: UserInfo;
  isLoading: boolean;
  onLoad: () => void;
  onDismiss: () => void;
}

const DetectedUserBanner: React.FC<DetectedUserBannerProps> = ({
  userInfo,
  isLoading,
  onLoad,
  onDismiss,
}) => {
  return (
    <div className="px-4 py-2.5 bg-primary-light border border-primary-highlight rounded-md flex items-center gap-2">
      <span className="text-sm text-neutral-700">
        Detected in admin: <strong className="text-neutral-900">{userInfo.userName}</strong>
      </span>
      {userInfo.userStatus && (
        <span
          className={`px-2.5 py-0.5 text-xs font-bold rounded-md ${
            userInfo.userStatus === 'ACTIVE'
              ? 'bg-success-light text-success-text'
              : userInfo.userStatus === 'DEPROVISIONED'
                ? 'bg-danger-light text-danger-text'
                : 'bg-warning-light text-warning-text'
          }`}
        >
          {userInfo.userStatus}
        </span>
      )}
      <div className="ml-auto flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onLoad} disabled={isLoading}>
          Load
        </Button>
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
};

export default DetectedUserBanner;
