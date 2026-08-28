import React from 'react';
import { Button, IconButton } from './shared';
import Icon from './shared/Icon';
import type { ConnectionStatus } from '../hooks/useOktaTabContext';
import type { PageType } from '../hooks/useOktaPageContext';

interface ContextBarProps {
  pageType: PageType;
  entityName?: string;
  connectionStatus: ConnectionStatus;
  isLoading: boolean;
  error: string | null;
  isPinned: boolean;
  canPin: boolean;
  liveContextChanged?: boolean;
  liveEntityName?: string;
  onTogglePin: () => void;
  onRefresh: () => void;
  onReconnect?: () => void;
}

const DOT_COLOR: Record<PageType, string> = {
  group: 'var(--color-primary)',
  user: 'var(--color-accent)',
  app: 'var(--color-success)',
  policy: 'var(--color-warning)',
  admin: 'var(--color-neutral-500)',
  unknown: 'var(--color-neutral-500)',
};

const NO_ENTITY_LABEL: Record<PageType, string> = {
  group: 'No group selected',
  user: 'No user selected',
  app: 'No app selected',
  policy: 'No policy detected',
  admin: 'Okta Admin',
  unknown: 'No context',
};

const ContextBar: React.FC<ContextBarProps> = ({
  pageType,
  entityName,
  connectionStatus,
  isLoading,
  error,
  isPinned,
  canPin,
  liveContextChanged = false,
  liveEntityName,
  onTogglePin,
  onRefresh,
  onReconnect,
}) => {
  const displayName = error
    ? 'Not connected'
    : isLoading
      ? 'Loading…'
      : entityName || NO_ENTITY_LABEL[pageType];

  const dotColor = error
    ? 'var(--color-danger)'
    : connectionStatus === 'connecting' || isLoading
      ? 'var(--color-warning)'
      : DOT_COLOR[pageType];

  const connectionText = error
    ? 'Disconnected'
    : connectionStatus === 'connecting' || isLoading
      ? 'Connecting…'
      : 'Connected';

  const liveChanged = isPinned && liveContextChanged;

  return (
    <div className="bg-white" style={{ fontFamily: 'var(--font-primary)' }}>
      <div className="px-(--sp-gutter) py-1.5 flex items-center gap-2">
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${connectionStatus === 'connecting' || isLoading ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: dotColor }}
          title={connectionText}
          role="img"
          aria-label={connectionText}
        />
        <span className="min-w-0 truncate text-sm font-semibold text-neutral-900">
          {displayName}
        </span>

        <div className="ms-auto flex items-center gap-1 shrink-0">
          {error && onReconnect ? (
            <Button
              variant="ghost"
              size="sm"
              icon="refresh"
              onClick={onReconnect}
              title="Reload the Okta tab to re-establish the connection"
            >
              Reconnect
            </Button>
          ) : (
            <IconButton
              label="Refresh context"
              onClick={onRefresh}
              variant="ghost"
              size="sm"
              disabled={isPinned}
              title={isPinned ? 'Unpin to refresh live context' : 'Refresh context'}
            >
              <Icon type="refresh" size="sm" className={isLoading ? 'animate-spin' : ''} />
            </IconButton>
          )}
          <Button
            variant={isPinned ? 'primary' : 'secondary'}
            size="sm"
            icon="pin"
            onClick={onTogglePin}
            disabled={!canPin && !isPinned}
            title={
              isPinned
                ? 'Unpin — resume following the live Okta tab'
                : canPin
                  ? 'Pin this context while you cross-reference another page'
                  : 'Navigate to a group or user page to pin it'
            }
          >
            {isPinned ? 'Pinned' : 'Pin'}
          </Button>
        </div>
      </div>

      {liveChanged && (
        <div className="px-(--sp-gutter) py-2 bg-warning-light border-t border-warning-light flex items-center justify-between gap-2 text-xs text-warning-text">
          <span className="truncate">
            {liveEntityName ? (
              <>
                Live tab moved to <strong>{liveEntityName}</strong>
              </>
            ) : (
              'The live Okta tab has changed'
            )}
          </span>
          <button
            type="button"
            onClick={onTogglePin}
            className="shrink-0 font-semibold underline hover:no-underline"
          >
            Unpin &amp; switch
          </button>
        </div>
      )}
    </div>
  );
};

export default ContextBar;
