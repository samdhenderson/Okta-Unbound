import React, { useCallback, useId, useRef, useState } from 'react';
import Button, { type ButtonSize, type ButtonVariant } from './Button';
import type { IconType } from '../shared/Icon';
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

export interface ActionRegister {
  ariaLabel: string;
  actions: readonly ActionDescriptor[];
}

export interface ActionBarProps {
  actions: readonly ActionDescriptor[];
  ariaLabel: string;
  sticky?: boolean;
  subRow?: React.ReactNode;
  register?: ActionRegister;
  expansion?: React.ReactNode;
  tierOpen?: boolean;
  defaultTierOpen?: boolean;
  onTierOpenChange?: (open: boolean) => void;
  className?: string;
  testId?: string;
}

const priorityOf = (action: ActionDescriptor): ActionPriority =>
  action.priority ?? (action.variant === 'primary' ? 'pinned' : 'flex');

const splitByPriority = (
  actions: readonly ActionDescriptor[],
): { ordered: ActionDescriptor[]; pinned: number; tierOnly: ActionDescriptor[] } => {
  const barEligible = actions.filter((a) => priorityOf(a) !== 'tier');
  const pinnedActions = barEligible.filter((a) => priorityOf(a) === 'pinned');
  return {
    ordered: [...pinnedActions, ...barEligible.filter((a) => priorityOf(a) === 'flex')],
    pinned: pinnedActions.length,
    tierOnly: actions.filter((a) => priorityOf(a) === 'tier'),
  };
};

const REGISTER_BUTTON_SIZE = 'xs' as const;

const Action: React.FC<{
  action: ActionDescriptor;
  compact?: boolean;
  measure?: 'full' | 'compact';
  variant?: ButtonVariant;
  size?: ButtonSize;
}> = ({ action, compact = false, measure, variant, size = 'sm' }) => (
  <span
    className="inline-flex"
    data-action-id={action.id}
    {...(measure ? { 'data-measure': measure } : {})}
    {...(action.testId ? { 'data-testid': action.testId } : {})}
  >
    <Button
      variant={variant ?? action.variant ?? 'secondary'}
      size={size}
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

const MeasureProbe: React.FC<{
  actions: readonly ActionDescriptor[];
  cluster: boolean;
  probeRef: React.RefObject<HTMLDivElement | null>;
  size?: ButtonSize;
}> = ({ actions, cluster, probeRef, size }) => (
  <div
    ref={probeRef}
    aria-hidden="true"
    inert
    className="pointer-events-none invisible absolute top-0 left-0 flex w-max items-center gap-2 whitespace-nowrap"
  >
    {actions.map((action) => (
      <Action key={`f-${action.id}`} action={action} measure="full" {...(size ? { size } : {})} />
    ))}
    {actions.map((action) => (
      <Action
        key={`c-${action.id}`}
        action={action}
        compact
        measure="compact"
        {...(size ? { size } : {})}
      />
    ))}
    {cluster && (
      <span className="inline-flex items-center" data-measure="cluster">
        <span aria-hidden="true" className="mx-1 w-px self-stretch bg-neutral-200" />
        <Button variant="ghost" size="sm" icon="chevron-down" iconPosition="right">
          More
        </Button>
      </span>
    )}
  </div>
);

const ActionBar: React.FC<ActionBarProps> = ({
  actions,
  ariaLabel,
  sticky = true,
  subRow,
  register,
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
  const registerProbeRef = useRef<HTMLDivElement>(null);
  const registerAnchorRef = useRef<HTMLElement | null>(null);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultTierOpen);
  const open = tierOpen ?? uncontrolledOpen;

  const toggle = useCallback(() => {
    const next = !open;
    if (tierOpen === undefined) setUncontrolledOpen(next);
    onTierOpenChange?.(next);
  }, [open, tierOpen, onTierOpenChange]);

  const { ordered, pinned, tierOnly } = splitByPriority(actions);
  const registerSplit = splitByPriority(register?.actions ?? []);

  const tierAlwaysPresent =
    expansion !== undefined || tierOnly.length > 0 || registerSplit.tierOnly.length > 0;

  const registerFit = useActionOverflow(registerSplit.ordered, {
    pinned: registerSplit.pinned,
    tierAlwaysPresent,
    tierOpen: open,
    refs: {
      band: bandRef,
      probe: registerProbeRef,
      sentinel: sentinelRef,
      cluster: registerAnchorRef,
      more: moreRef,
    },
  });
  const registerInBar = registerSplit.ordered.slice(0, registerFit.inBar);
  const registerOverflowed = [
    ...registerSplit.ordered.slice(registerFit.inBar),
    ...registerSplit.tierOnly,
  ];

  const { inBar, compact, measuring } = useActionOverflow(ordered, {
    pinned,
    tierAlwaysPresent: tierAlwaysPresent || registerOverflowed.length > 0,
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
  const overflowed = [...ordered.slice(inBar), ...tierOnly, ...registerOverflowed];
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
            'sticky top-[var(--header-h,0px)] z-30'
          : ''
      }
      ${className}
    `
        .trim()
        .replace(/\s+/g, ' ')}
    >
      <div ref={rowRef} className="flex flex-wrap items-center gap-2 p-3">
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

      {subRow !== undefined && <div className="px-3 pb-2">{subRow}</div>}

      {register !== undefined && (
        <div
          role="group"
          aria-label={register.ariaLabel}
          data-testid="action-bar-register"
          className="flex flex-wrap items-center gap-2 px-3.5 pb-2"
        >
          <span
            ref={registerAnchorRef}
            aria-hidden="true"
            className="pointer-events-none absolute h-0 w-0"
          />
          {registerInBar.map((action) => (
            <Action
              key={action.id}
              action={action}
              compact={registerFit.compact}
              size={REGISTER_BUTTON_SIZE}
            />
          ))}
        </div>
      )}

      {hasTier && (
        <div id={tierId} className="disclose" data-open={open} inert={!open || undefined}>
          <div>
            <div className="space-y-3 border-t border-neutral-200 px-2.5 py-3">
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

      {measuring && <MeasureProbe actions={ordered} cluster probeRef={probeRef} />}
      {registerFit.measuring && (
        <MeasureProbe
          actions={registerSplit.ordered}
          cluster={false}
          probeRef={registerProbeRef}
          size={REGISTER_BUTTON_SIZE}
        />
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
