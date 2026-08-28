import React, { useEffect, useRef, useState } from 'react';
import Icon from '../shared/Icon';
import IconButton from './IconButton';
import Badge, { type BadgeVariant } from './Badge';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { usePublishedHeight } from '../../hooks/usePublishedHeight';
import { useStuck } from '../../hooks/useStuck';

const SWAP_MS = 220;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  cornerAction?: React.ReactNode;
  onBack?: () => void;
  backLabel?: string;
  leading?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  badge?: {
    text: string;
    variant?: BadgeVariant;
  };
  identity?: React.ReactNode;
  identityKey?: string;
  sticky?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  cornerAction,
  badge,
  onBack,
  backLabel = 'Back',
  leading,
  breadcrumbs,
  identity,
  identityKey,
  sticky = false,
}) => {
  const reduced = useReducedMotion();
  const headerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const pinned = useStuck(sentinelRef, headerRef, sticky);

  usePublishedHeight(headerRef, '--header-h', {
    scopeSelector: '[data-header-scope]',
    enabled: sticky,
  });

  const latest = useRef(identity);
  useEffect(() => {
    latest.current = identity;
  });

  const [held, setHeld] = useState<{ key: string | undefined; node: React.ReactNode }>({
    key: identityKey,
    node: identity,
  });
  const [fading, setFading] = useState(false);

  if (held.key !== identityKey && !fading) {
    setHeld({ key: identityKey, node: held.node });
    setFading(true);
  }

  useEffect(() => {
    if (!fading) return;
    const finish = () => {
      setHeld((prev) => ({ key: prev.key, node: latest.current }));
      setFading(false);
    };
    if (reduced) {
      finish();
      return;
    }
    const timer = window.setTimeout(finish, SWAP_MS);
    return () => window.clearTimeout(timer);
  }, [fading, reduced]);

  const leadingNode =
    leading ??
    (onBack ? (
      <IconButton label={backLabel} variant="subtle" onClick={onBack}>
        <Icon type="chevron-left" size="md" />
      </IconButton>
    ) : null);

  const shownIdentity = fading ? held.node : identity;
  const regionOpen = Boolean(shownIdentity) && !fading && !pinned;

  const hasRegion = Boolean(identity) || fading;
  const align = hasRegion ? 'items-start' : 'items-center';

  return (
    <>
      {sticky && <div ref={sentinelRef} aria-hidden="true" className="h-0" />}
      <div
        ref={headerRef}
        className={`bg-white border-b border-neutral-200 ${
          sticky ? 'sticky top-[var(--rail-h,0px)] z-20' : ''
        }`}
      >
        <div className={`px-5 py-4 flex ${align} justify-between gap-4`}>
          <div className={`flex-1 min-w-0 flex ${align} gap-2`}>
            {leadingNode && <div className="shrink-0">{leadingNode}</div>}
            <div className="flex-1 min-w-0">
              {breadcrumbs && <div className="mb-1">{breadcrumbs}</div>}
              <h1
                className="text-lg font-semibold text-neutral-900"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {title}
              </h1>
              {subtitle && <p className="mt-0.5 text-sm text-neutral-600">{subtitle}</p>}

              {hasRegion && (
                <div className="disclose" data-open={regionOpen ? 'true' : 'false'}>
                  <div>
                    <div
                      className={`mt-2 transition-opacity duration-(--dur-quick) ${
                        fading ? 'opacity-0 ease-exit' : 'opacity-100 ease-entrance'
                      }`}
                    >
                      {shownIdentity}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {(badge || actions || cornerAction) && (
            <div
              className={`shrink-0 flex flex-col items-end gap-2 ${hasRegion ? 'self-stretch' : ''}`}
            >
              {(badge || actions) && (
                <div className="flex items-center gap-2">
                  {badge && <Badge variant={badge.variant}>{badge.text}</Badge>}
                  {actions}
                </div>
              )}
              {cornerAction && <div className="mt-auto">{cornerAction}</div>}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PageHeader;
