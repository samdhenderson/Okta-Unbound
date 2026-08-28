import React, { useId } from 'react';
import {
  Badge,
  CopyableId,
  EntityLink,
  Eyebrow,
  IconButton,
  ListRow,
  OpenInOktaLink,
} from '../../shared';
import Icon from '../../shared/Icon';
import { formatDate } from '../../../../shared/utils/dateFormat';
import type { GroupAppRowModel } from '../groupAppSource';

export interface GroupAppRowProps {
  row: GroupAppRowModel;
  expanded: boolean;
  onToggle: (appId: string) => void;
  oktaOrigin?: string | null;
}

const GroupAppRow: React.FC<GroupAppRowProps> = ({ row, expanded, onToggle, oktaOrigin }) => {
  const disclosureId = useId();

  return (
    <ListRow
      as="li"
      density="compact"
      dataAttributes={{ 'data-app-id': row.id }}
      body={
        <div
          id={disclosureId}
          className="disclose"
          data-open={expanded}
          inert={!expanded || undefined}
        >
          <div>
            <div className="space-y-3 border-t border-neutral-200 px-3 pb-3 pt-2">
              <div>
                <Eyebrow as="div" className="mb-1">
                  Application ID
                </Eyebrow>
                <CopyableId
                  value={row.id}
                  label={`Copy application id for ${row.label}`}
                  className="w-full"
                />
              </div>

              {row.signOnMode && (
                <div className="flex items-baseline justify-between gap-3 text-xs">
                  <span className="shrink-0 text-neutral-600">Sign-on mode</span>
                  <span className="min-w-0 truncate font-mono text-neutral-900">
                    {row.signOnMode}
                  </span>
                </div>
              )}

              {row.lastUpdated && (
                <div className="flex items-baseline justify-between gap-3 text-xs">
                  <span className="shrink-0 text-neutral-600">Last updated</span>
                  <span className="min-w-0 truncate text-neutral-900">
                    {formatDate(row.lastUpdated)}
                  </span>
                </div>
              )}

              {row.push.state === 'pushed' && (
                <div className="rounded-md border border-neutral-200 bg-canvas p-3">
                  <Eyebrow as="div" className="mb-1">
                    Membership pushed here
                  </Eyebrow>
                  <p className="text-xs text-neutral-700">
                    {row.push.targetGroupName
                      ? `Writes into ${row.push.targetGroupName}.`
                      : 'The target group was not named in the mapping.'}
                    {row.push.priority !== undefined && ` Priority ${row.push.priority}.`}
                  </p>
                </div>
              )}
              {row.push.state === 'not-pushed' && (
                <p className="text-xs text-neutral-600">
                  This group&apos;s membership is not pushed to this app.
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <EntityLink type="app" id={row.id} name={row.label} />
                <OpenInOktaLink oktaOrigin={oktaOrigin} entityType="app" entityId={row.id} />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="flex items-start gap-2">
        <Icon type="app" size="sm" className="mt-0.5 shrink-0 text-neutral-400" />

        <div className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-neutral-900">{row.label}</span>
          {row.signOnMode && (
            <span className="block truncate font-mono text-xs text-neutral-500">
              {row.signOnMode}
            </span>
          )}
        </div>

        {row.status && (
          <Badge variant={row.statusVariant} className="shrink-0">
            {row.status}
          </Badge>
        )}
        {row.push.state === 'pushed' && (
          <Badge
            variant="primary"
            title="This group's membership is pushed into a group in this app."
            className="shrink-0"
          >
            Pushed
          </Badge>
        )}

        <IconButton
          label={`${expanded ? 'Hide' : 'Show'} details for ${row.label}`}
          variant="ghost"
          size="sm"
          expanded={expanded}
          controls={disclosureId}
          className="shrink-0"
          onClick={() => onToggle(row.id)}
        >
          <Icon
            type="chevron-right"
            size="sm"
            className={`transition-transform duration-(--dur-quick) ${expanded ? 'rotate-90' : ''}`}
          />
        </IconButton>
      </div>
    </ListRow>
  );
};

export default GroupAppRow;
