import React from 'react';
import { CopyableId, IconButton } from './shared';
import Icon from './shared/Icon';
import type { ConnectionStatus } from '../hooks/useOktaTabContext';
import type { PageType } from '../hooks/useOktaPageContext';

interface ContextBarProps {
  pageType: PageType;
  entityName?: string;
  entityId?: string;
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

const PAGE_LABEL: Record<PageType, string> = {
  group: 'Group',
  user: 'User',
  app: 'App',
  policy: 'Policy',
  admin: 'Admin',
  unknown: '',
};

const ContextBar: React.FC<ContextBarProps> = ({
  pageType,
  entityName,
  entityId,
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

  const wordmarkSuffix = PAGE_LABEL[pageType];
  const liveChanged = isPinned && liveContextChanged;

  return (
    <div
      className="bg-white border-b border-neutral-200 z-40"
      style={{ fontFamily: 'var(--font-primary)' }}
    >
      <div className="px-5 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${connectionStatus === 'connecting' || isLoading ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: dotColor }}
            title={connectionText}
            role="img"
            aria-label={connectionText}
          />
          <div className="min-w-0">
            <div
              className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 leading-none mb-1"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Okta Unbound{wordmarkSuffix ? ` · ${wordmarkSuffix}` : ''}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-neutral-900 truncate">{displayName}</span>
              {isPinned && (
                <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide bg-primary-light text-primary-text">
                  <Icon type="pin" size="xs" />
                  Pinned
                </span>
              )}
            </div>
            {error && onReconnect && (
              <button
                type="button"
                onClick={onReconnect}
                className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary-text hover:underline"
                title="Reload the Okta tab to re-establish the connection"
              >
                <Icon type="refresh" size="xs" />
                Reload tab to reconnect
              </button>
            )}
            {entityId && !error && (
              <CopyableId
                value={entityId}
                label={`Copy ${PAGE_LABEL[pageType].toLowerCase() || 'entity'} id`}
                className="mt-0.5"
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
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
          <button
            type="button"
            onClick={onTogglePin}
            disabled={!canPin && !isPinned}
            title={
              isPinned
                ? 'Unpin — resume following the live Okta tab'
                : canPin
                  ? 'Pin this context while you cross-reference another page'
                  : 'Navigate to a group or user page to pin it'
            }
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors duration-(--dur-instant) disabled:opacity-40 disabled:cursor-not-allowed ${
              isPinned
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-500'
            }`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <Icon type="pin" size="sm" />
            <span>{isPinned ? 'Pinned' : 'Pin'}</span>
          </button>
        </div>
      </div>

      {liveChanged && (
        <div className="px-5 py-2 bg-warning-light border-t border-warning-light flex items-center justify-between gap-2 text-xs text-warning-text">
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
