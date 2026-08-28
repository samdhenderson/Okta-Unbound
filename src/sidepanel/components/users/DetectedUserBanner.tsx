import React from 'react';
import { Button, Eyebrow, IconButton } from '../shared';
import Icon from '../shared/Icon';
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
    <div className="px-3 py-2 bg-primary-light border border-primary-highlight rounded-md flex items-center gap-2">
      <Eyebrow className="shrink-0">Open in admin</Eyebrow>
      <span className="min-w-0 flex-1 truncate text-sm text-neutral-700">
        <strong className="font-semibold text-neutral-900">{userInfo.userName}</strong>
        {userInfo.userStatus ? ` · ${userInfo.userStatus}` : ''}
      </span>
      <div className="flex shrink-0 items-center gap-1">
        <Button variant="primary" size="sm" onClick={onLoad} disabled={isLoading}>
          Load
        </Button>
        <IconButton label="Dismiss" size="sm" onClick={onDismiss}>
          <Icon type="close" size="sm" />
        </IconButton>
      </div>
    </div>
  );
};

export default DetectedUserBanner;
