import React, { useId } from 'react';
import { Badge, Button, IconButton, ListRow } from './shared';
import Icon from './overview/shared/Icon';
import { formatActionTime } from '../../shared/undoManager';
import type { ActionType, CapturedAttribute, UndoAction } from '../../shared/undoTypes';
import type { UseUndoActionReturn } from '../hooks/useUndoAction';

const TYPE_LABEL: Record<ActionType, string> = {
  REMOVE_USER_FROM_GROUP: 'User Removal',
  ADD_USER_TO_GROUP: 'User Addition',
  BULK_REMOVE_USERS_FROM_GROUP: 'Bulk Removal',
  BULK_ADD_USERS_TO_GROUP: 'Bulk Addition',
  ACTIVATE_RULE: 'Rule Activated',
  DEACTIVATE_RULE: 'Rule Deactivated',
  CONSOLIDATE_RULE: 'Rules Consolidated',
  UPDATE_USER_PROFILE: 'Profile Updated',
};

const STATUS_BADGE: Partial<
  Record<UndoAction['status'], { label: string; variant: 'info' | 'warning' | 'danger' }>
> = {
  undone: { label: 'Undone', variant: 'info' },
  partial: { label: 'Outcome unknown', variant: 'warning' },
  failed: { label: 'Failed', variant: 'danger' },
};

export interface AuditLogRowProps {
  action: UndoAction;
  isExpanded: boolean;
  onToggle: (actionId: string) => void;
  onUndo?: (action: UndoAction) => void;
  undoability: UseUndoActionReturn['undoability'];
}

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex gap-2 text-sm">
    <span className="min-w-25 font-medium text-neutral-600">{label}:</span>
    <span className="break-words text-neutral-900">{value}</span>
  </div>
);

function detailRows(action: UndoAction): Array<[string, string]> {
  const metadata = action.metadata;
  const rows: Array<[string, string]> = [];

  if (metadata.type === 'REMOVE_USER_FROM_GROUP' || metadata.type === 'ADD_USER_TO_GROUP') {
    rows.push(['User', `${metadata.userName} (${metadata.userEmail})`]);
    rows.push(['Group', metadata.groupName]);
    rows.push(['User ID', metadata.userId]);
    rows.push(['Group ID', metadata.groupId]);
  } else if (
    metadata.type === 'BULK_REMOVE_USERS_FROM_GROUP' ||
    metadata.type === 'BULK_ADD_USERS_TO_GROUP'
  ) {
    rows.push(['Group', metadata.groupName]);
    rows.push(['Users affected', String(metadata.users.length)]);
    rows.push(['Group ID', metadata.groupId]);
    if (metadata.type === 'BULK_REMOVE_USERS_FROM_GROUP' && metadata.operationType) {
      rows.push(['Operation', metadata.operationType]);
    }
  } else if (metadata.type === 'ACTIVATE_RULE' || metadata.type === 'DEACTIVATE_RULE') {
    rows.push(['Rule', metadata.ruleName]);
    rows.push(['Rule ID', metadata.ruleId]);
  } else if (metadata.type === 'CONSOLIDATE_RULE') {
    rows.push(['New rule', metadata.createdRuleName]);
    rows.push(['New rule ID', metadata.createdRuleId]);
    rows.push(['Target groups', String(metadata.createdGroupIds.length)]);
    rows.push(['Rules retired', metadata.retiredRules.map((rule) => rule.name).join(', ')]);
  } else {
    rows.push(['User', `${metadata.userName} (${metadata.userLogin})`]);
    rows.push(['User ID', metadata.userId]);
  }

  return rows;
}

const ChangeRow: React.FC<{ change: CapturedAttribute }> = ({ change }) => (
  <li className="text-sm">
    <span className="font-medium text-neutral-600">{change.label}:</span>{' '}
    {change.restorable ? (
      <span className="break-words text-neutral-900">
        {change.beforeDisplay === '' ? (
          <em className="text-neutral-500">empty</em>
        ) : (
          change.beforeDisplay
        )}
        <span aria-hidden="true"> → </span>
        <span className="sr-only"> changed to </span>
        {change.afterDisplay === '' ? (
          <em className="text-neutral-500">empty</em>
        ) : (
          change.afterDisplay
        )}
      </span>
    ) : (
      <span className="break-words text-neutral-900">
        {change.afterDisplay === '' ? (
          <em className="text-neutral-500">empty</em>
        ) : (
          change.afterDisplay
        )}{' '}
        <span className="text-xs text-neutral-600">(previous value not captured)</span>
      </span>
    )}
  </li>
);

const AuditLogRow: React.FC<AuditLogRowProps> = ({
  action,
  isExpanded,
  onToggle,
  onUndo,
  undoability,
}) => {
  const disclosureId = useId();
  const verdict = undoability(action);
  const statusBadge = STATUS_BADGE[action.status];
  const metadata = action.metadata;

  return (
    <ListRow
      density="compact"
      dataAttributes={{ 'data-action-id': action.id }}
      body={
        <div
          id={disclosureId}
          className="disclose"
          data-open={isExpanded}
          inert={!isExpanded || undefined}
        >
          <div>
            <div className="space-y-2 border-t border-neutral-200 px-3 pb-3 pt-2">
              {detailRows(action).map(([label, value]) => (
                <DetailRow key={label} label={label} value={value} />
              ))}

              {metadata.type === 'UPDATE_USER_PROFILE' && (
                <ul className="space-y-1">
                  {metadata.changes.map((change) => (
                    <ChangeRow key={change.name} change={change} />
                  ))}
                </ul>
              )}

              {!verdict.undoable && (
                <p className="text-xs text-pretty text-neutral-600">{verdict.reason}</p>
              )}
            </div>
          </div>
        </div>
      }
    >
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-neutral-900">{action.description}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge>{TYPE_LABEL[action.type]}</Badge>
            {statusBadge && <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>}
            <span className="text-xs text-neutral-500">{formatActionTime(action.timestamp)}</span>
          </div>
        </div>

        {verdict.undoable && onUndo && (
          <Button size="sm" className="shrink-0" onClick={() => onUndo(action)}>
            Undo
          </Button>
        )}

        <IconButton
          label={`${isExpanded ? 'Hide' : 'Show'} details for ${action.description}`}
          variant="ghost"
          size="sm"
          expanded={isExpanded}
          controls={disclosureId}
          className="shrink-0"
          onClick={() => onToggle(action.id)}
        >
          <Icon
            type="chevron-right"
            size="sm"
            className={`transition-transform duration-(--dur-quick) ${isExpanded ? 'rotate-90' : ''}`}
          />
        </IconButton>
      </div>
    </ListRow>
  );
};

export default AuditLogRow;
