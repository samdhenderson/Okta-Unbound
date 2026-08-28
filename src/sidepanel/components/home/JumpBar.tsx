import React, { useRef } from 'react';
import { IconButton, Input, LoadingSpinner } from '../shared';
import Icon from '../shared/Icon';
import AlertMessage from '../shared/AlertMessage';
import EmptyState from '../shared/EmptyState';
import JumpResultRow from './JumpResultRow';
import type { JumpResult, UseJumpResolverResult } from '../../hooks/useJumpResolver';

export interface JumpBarProps {
  jump: UseJumpResolverResult;
  onSelect: (result: JumpResult) => boolean | void;
  canReach: (kind: JumpResult['kind']) => boolean;
  oktaOrigin?: string | null;
  autoFocus?: boolean;
}

const JumpBar: React.FC<JumpBarProps> = ({
  jump,
  onSelect,
  canReach,
  oktaOrigin,
  autoFocus = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isBusy = jump.mode === 'searching' || jump.mode === 'resolving';

  const handleClear = () => {
    jump.clear();
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      jump.submit();
    } else if (event.key === 'Escape' && jump.query) {
      event.preventDefault();
      handleClear();
    }
  };

  return (
    <section aria-label="Jump to an entity" className="space-y-2">
      <Input
        inputRef={inputRef}
        type="text"
        value={jump.query}
        onChange={jump.setQuery}
        onKeyDown={handleKeyDown}
        ariaLabel="Search groups, apps, users, rules"
        placeholder="Search groups, apps, users, rules, etc."
        size="lg"
        autoFocus={autoFocus}
        icon={<Icon type="search" size="md" />}
        trailing={
          <div className="flex items-center gap-1">
            {isBusy && <LoadingSpinner size="sm" />}
            {jump.query.length > 0 && (
              <IconButton label="Clear" onClick={handleClear} variant="ghost" size="sm">
                <Icon type="close" size="md" />
              </IconButton>
            )}
          </div>
        }
        trailingInteractive={jump.query.length > 0}
      />

      <p role="status" className="sr-only">
        {jump.mode === 'results'
          ? `${jump.results.length} ${jump.results.length === 1 ? 'result' : 'results'}`
          : ''}
      </p>

      {jump.error && (
        <AlertMessage message={{ text: jump.error, type: 'danger' }} onDismiss={jump.clear} />
      )}

      {jump.mode === 'results' && jump.results.length > 0 && (
        <>
          <ul className="rise-in-stagger space-y-1">
            {jump.results.map((result) => {
              const reachable = canReach(result.kind);
              return (
                <li key={`${result.kind}:${result.id}`}>
                  <JumpResultRow
                    result={result}
                    onSelect={reachable ? onSelect : undefined}
                    oktaOrigin={oktaOrigin}
                  />
                </li>
              );
            })}
          </ul>
          {jump.resolution && (
            <p className="text-xs text-neutral-600">
              Exact id match · {jump.resolution.cost === 0 ? 'no request' : '1 request'}
            </p>
          )}
        </>
      )}

      {jump.mode === 'results' && jump.results.length === 0 && (
        <EmptyState
          icon="search"
          title="Nothing matched"
          description={
            jump.isIdQuery
              ? 'No entity in this org has that id.'
              : 'No group or user matches that name. Try fewer characters, or paste an id.'
          }
        />
      )}
    </section>
  );
};

export default JumpBar;
