import React, { useCallback, useId, useRef, useState } from 'react';
import Button, { type ButtonVariant } from './Button';
import type { IconType } from '../overview/shared/Icon';
import { useActionOverflow } from './useActionOverflow';

export type ActionPriority = 'pinned' | 'flex' | 'tier';

export interface ActionDescriptor {
  id: string;
  label: string;
  icon?: IconType;
  variant?: ButtonVariant;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
  priority?: ActionPriority;
  testId?: string;
}

export interface ActionBarProps {
  actions: readonly ActionDescriptor[];
  ariaLabel: string;
  sticky?: boolean;
  expansion?: React.ReactNode;
  tierOpen?: boolean;
  defaultTierOpen?: boolean;
  onTierOpenChange?: (open: boolean) => void;
  className?: string;
  testId?: string;
}

const priorityOf = (action: ActionDescriptor): ActionPriority =>
  action.priority ?? (action.variant === 'primary' ? 'pinned' : 'flex');

const Action: React.FC<{
  action: ActionDescriptor;
  compact?: boolean;
  measure?: 'full' | 'compact';
  variant?: ButtonVariant;
}> = ({ action, compact = false, measure, variant }) => (
  <span
    className="inline-flex"
    data-action-id={action.id}
    {...(measure ? { 'data-measure': measure } : {})}
    {...(action.testId ? { 'data-testid': action.testId } : {})}
  >
    <Button
      variant={variant ?? action.variant ?? 'secondary'}
      size="sm"
      {...(compact || !action.icon ? {} : { icon: action.icon })}
      onClick={action.onClick}
      disabled={action.disabled ?? false}
      loading={action.loading ?? false}
      {...(action.title ? { title: action.title } : {})}
    >
      {action.label}
    </Button>
  </span>
);

const ActionBar: React.FC<ActionBarProps> = ({
  actions,
  ariaLabel,
  sticky = true,
  expansion,
  tierOpen,
  defaultTierOpen = false,
  onTierOpenChange,
  className = '',
  testId,
}) => {
  const tierId = useId();
  const bandRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const clusterRef = useRef<HTMLElement | null>(null);
  const moreRef = useRef<HTMLButtonElement | null>(null);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultTierOpen);
  const open = tierOpen ?? uncontrolledOpen;

  const toggle = useCallback(() => {
    const next = !open;
    if (tierOpen === undefined) setUncontrolledOpen(next);
    onTierOpenChange?.(next);
  }, [open, tierOpen, onTierOpenChange]);

  const barEligible = actions.filter((a) => priorityOf(a) !== 'tier');
  const ordered = [
    ...barEligible.filter((a) => priorityOf(a) === 'pinned'),
    ...barEligible.filter((a) => priorityOf(a) === 'flex'),
  ];
  const pinned = ordered.filter((a) => priorityOf(a) === 'pinned').length;
  const tierOnly = actions.filter((a) => priorityOf(a) === 'tier');

  const tierAlwaysPresent = expansion !== undefined || tierOnly.length > 0;

  const { inBar, compact, measuring } = useActionOverflow(ordered, {
    pinned,
    tierAlwaysPresent,
    tierOpen: open,
    refs: {
      band: bandRef,
      probe: probeRef,
      sentinel: sentinelRef,
      cluster: clusterRef,
      more: moreRef,
    },
  });

  const inBarActions = ordered.slice(0, inBar);
  const overflowed = [...ordered.slice(inBar), ...tierOnly];
  const hasTier = overflowed.length > 0 || expansion !== undefined;

  const band = (
    <div
      ref={bandRef}
      role="group"
      aria-label={ariaLabel}
      data-testid={testId}
      className={`
      dock-band
      ${
        sticky
          ? // `z-30` puts the band *above* the page header (`z-20`) and still below
            'sticky top-[calc(var(--rail-h,0px)+var(--header-h,0px))] z-30'
          : ''
      }
      ${className}
    `
        .trim()
        .replace(/\s+/g, ' ')}
    >
      <div ref={rowRef} className="flex flex-wrap items-center gap-2 p-2">
        {inBarActions.map((action) => (
          <Action key={action.id} action={action} compact={compact} />
        ))}

        {hasTier && (
          <span
            ref={(node) => {
              clusterRef.current = node;
              moreRef.current = node?.querySelector('button') ?? null;
            }}
            className="ms-auto inline-flex items-center"
          >
            <span aria-hidden="true" className="mx-1 w-px self-stretch bg-neutral-200" />
            <Button
              variant="ghost"
              size="sm"
              icon="chevron-down"
              iconPosition="right"
              onClick={toggle}
              expanded={open}
              controls={tierId}
              title={open ? 'Hide more actions' : 'Show more actions'}
              className="[&_svg]:transition-transform [&_svg]:duration-(--dur-quick) aria-expanded:[&_svg]:rotate-180"
            >
              More
            </Button>
          </span>
        )}
      </div>

      {hasTier && (
        <div id={tierId} className="disclose" data-open={open} inert={!open || undefined}>
          <div>
            <div className="space-y-3 border-t border-neutral-200 px-4 py-3">
              {overflowed.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {overflowed.map((action) => (
                    <Action key={action.id} action={action} variant="secondary" />
                  ))}
                </div>
              )}
              {overflowed.length > 0 && expansion !== undefined && (
                <div className="h-px bg-neutral-200" />
              )}
              {expansion}
            </div>
          </div>
        </div>
      )}

      {measuring && (
        <div
          ref={probeRef}
          aria-hidden="true"
          inert
          className="pointer-events-none invisible absolute top-0 left-0 flex w-max items-center gap-2 whitespace-nowrap"
        >
          {ordered.map((action) => (
            <Action key={`f-${action.id}`} action={action} measure="full" />
          ))}
          {ordered.map((action) => (
            <Action key={`c-${action.id}`} action={action} compact measure="compact" />
          ))}
          <span className="inline-flex items-center" data-measure="cluster">
            <span aria-hidden="true" className="mx-1 w-px self-stretch bg-neutral-200" />
            <Button variant="ghost" size="sm" icon="chevron-down" iconPosition="right">
              More
            </Button>
          </span>
        </div>
      )}
    </div>
  );

  if (!sticky) return band;

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="dock-sentinel" />
      {band}
    </>
  );
};

export default ActionBar;
