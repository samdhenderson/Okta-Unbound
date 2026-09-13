import React from 'react';
import { Button, IconButton } from './shared';
import Icon from './shared/Icon';
import SelectionSummary from '../selection/SelectionSummary';
import { KIND_ICON, destinationLabel } from './home/jumpDestinations';
import type { ConnectionStatus } from '../hooks/useOktaTabContext';
import type { PageType } from '../hooks/useOktaPageContext';
import type { HandoffOffer } from '../hooks/useEntityHandoff';

interface ContextBarProps {
  pageType: PageType;
  entityName?: string;
  connectionStatus: ConnectionStatus;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  refreshSubjectName?: string | null;
  onReconnect?: () => void;

  onOpenSelection?: () => void;
  handoff?: HandoffOffer | null;
  onAcceptHandoff?: () => void;
  onDismissHandoff?: () => void;
}

const WIRE_COLOR: Record<PageType, string> = {
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
  onRefresh,
  refreshSubjectName,
  onReconnect,
  onOpenSelection,
  handoff,
  onAcceptHandoff,
  onDismissHandoff,
}) => {
  const displayName = error
    ? 'Not connected'
    : isLoading
      ? 'Loading…'
      : entityName || NO_ENTITY_LABEL[pageType];

  const isSettling = connectionStatus === 'connecting' || isLoading;

  const wireColor = error
    ? 'var(--color-danger)'
    : isSettling
      ? 'var(--color-warning)'
      : WIRE_COLOR[pageType];

  const connectionText = error ? 'Disconnected' : isSettling ? 'Connecting…' : 'Connected';

  const degraded = Boolean(error);

  const refreshLabel = refreshSubjectName ? `Refresh ${refreshSubjectName}` : 'Refresh';

  return (
    <div className="relative bg-white" style={{ fontFamily: 'var(--font-primary)' }}>
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 transition-all duration-(--dur-instant) ease-(--ease-standard) ${degraded ? 'h-1.5' : 'h-1'} ${isSettling ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: wireColor }}
      />
      <span className="sr-only" role="status">
        {connectionText}
      </span>

      <div className="disclose" data-open={degraded ? 'true' : 'false'}>
        <div>
          <div className="px-(--sp-gutter) pt-2 pb-1.5 flex items-center gap-(--sp-inline) bg-danger-light">
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-danger-text">
              Not connected to the Okta tab
            </span>
            {onReconnect && (
              <Button
                variant="secondary"
                size="sm"
                icon="refresh"
                onClick={onReconnect}
                title="Reload the Okta tab to re-establish the connection"
              >
                Reconnect
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="px-(--sp-gutter) py-1.5 flex items-center gap-2">
        {handoff ? (
          <div className="min-w-0 flex-1 flex items-center gap-(--sp-inline)">
            <Button
              variant="ghost"
              size="sm"
              icon={KIND_ICON[handoff.kind]}
              onClick={onAcceptHandoff}
              className="min-w-0"
              ariaLabel={`Open ${handoff.name} in ${destinationLabel(handoff.kind)}`}
              title={`Open ${handoff.name} in ${destinationLabel(handoff.kind)}`}
            >
              <span className="min-w-0 truncate">{handoff.name}</span>
              <Icon type="handoff" size="sm" />
            </Button>
            <IconButton
              label={`Dismiss ${handoff.name}`}
              onClick={onDismissHandoff}
              variant="ghost"
              size="sm"
              title="Keep browsing what is on screen"
            >
              <Icon type="close" size="sm" />
            </IconButton>
          </div>
        ) : (
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-900">
            {displayName}
          </span>
        )}

        <div className="relative flex items-center gap-1 shrink-0">
          {onOpenSelection && <SelectionSummary onOpen={onOpenSelection} />}
          <IconButton
            label={refreshLabel}
            onClick={onRefresh}
            variant="ghost"
            size="sm"
            title={refreshLabel}
          >
            <Icon type="refresh" size="sm" className={isLoading ? 'animate-spin' : ''} />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default ContextBar;
