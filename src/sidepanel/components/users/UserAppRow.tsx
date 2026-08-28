import React, { useId, useState } from 'react';
import { Badge, EntityLink, Eyebrow, IconButton, ListRow, OpenInOktaLink } from '../shared';
import Icon from '../shared/Icon';
import type { AppSourceRow } from './appSourceSummary';

export interface UserAppRowProps {
  row: AppSourceRow;
  oktaOrigin?: string | null;
}

const UserAppRow: React.FC<UserAppRowProps> = ({ row, oktaOrigin }) => {
  const [open, setOpen] = useState(false);
  const detailId = useId();

  const disclosure = (
    <div id={detailId} className="disclose" data-open={open} inert={!open || undefined}>
      <div>
        <div className="space-y-3 border-t border-neutral-200 px-3 py-3">
          <p className="text-pretty text-xs text-neutral-600">{row.caveat}</p>

          {row.grantGroupName && (
            <div className="rounded-md border border-neutral-200 bg-canvas p-3">
              <Eyebrow as="div" className="mb-2">
                Granted through
              </Eyebrow>
              <EntityLink type="group" id={row.grantGroupId} name={row.grantGroupName} />
              {row.grantGroupSourceLine && (
                <p className="mt-2 text-xs text-neutral-600">{row.grantGroupSourceLine}</p>
              )}
            </div>
          )}

          <OpenInOktaLink oktaOrigin={oktaOrigin} entityType="app" entityId={row.id} />
        </div>
      </div>
    </div>
  );

  return (
    <ListRow as="li" density="compact" body={disclosure}>
      <div className="flex items-start gap-2">
        <Icon type="app" size="sm" className="mt-0.5 shrink-0 text-neutral-400" />

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-semibold text-neutral-900">{row.label}</span>
            {row.isPrivileged && (
              <Badge
                variant="warning"
                title="This app grants administrative or infrastructure access."
              >
                Privileged
              </Badge>
            )}
          </div>
          <p
            className={`truncate text-xs text-neutral-600 ${row.sourceKnown ? '' : 'italic'}`}
            title={row.sourceLine}
          >
            {row.sourceLine}
          </p>
        </div>

        <Badge variant={row.badgeVariant} title={row.caveat} className="shrink-0">
          {row.badgeLabel}
        </Badge>

        <IconButton
          label={open ? `Hide how ${row.label} is granted` : `Show how ${row.label} is granted`}
          variant="ghost"
          size="sm"
          expanded={open}
          controls={detailId}
          className="shrink-0"
          onClick={() => setOpen((v) => !v)}
        >
          <Icon
            type="chevron-right"
            size="sm"
            className={`transition-transform duration-(--dur-quick) ${open ? 'rotate-90' : ''}`}
          />
        </IconButton>
      </div>
    </ListRow>
  );
};

export default UserAppRow;
