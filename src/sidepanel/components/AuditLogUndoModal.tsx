import React from 'react';
import { AlertMessage, Badge, Button, Modal } from './shared';
import type { CaptureOmission, CapturedAttribute, UndoAction } from '../../shared/undoTypes';

const OMISSION_REASON: Record<CaptureOmission, string> = {
  'too-large': 'Previous value was not captured (too large)',
  'too-many': 'Previous value was not captured (too many attributes changed at once)',
};

const OMISSION_FALLBACK = 'Previous value was not captured';

export interface AuditLogUndoModalProps {
  action: UndoAction | null;
  onClose: () => void;
  onConfirm: () => void;
  isUndoing: boolean;
  drifted?: readonly string[];
  error?: string;
}

const Value: React.FC<{ text: string; muted?: boolean }> = ({ text, muted = false }) =>
  text === '' ? (
    <em className="text-neutral-500">empty</em>
  ) : (
    <span className={muted ? 'text-neutral-600 line-through' : 'text-neutral-900'}>{text}</span>
  );

const RestoreRow: React.FC<{ change: CapturedAttribute }> = ({ change }) => (
  <li>
    <p className="text-xs font-medium text-neutral-700">{change.label}</p>
    <p className="text-sm text-pretty break-words">
      <Value text={change.afterDisplay} muted />
      <span aria-hidden="true"> → </span>
      <span className="sr-only"> will be restored to </span>
      <Value text={change.beforeDisplay ?? ''} />
    </p>
  </li>
);

const SkippedRow: React.FC<{ change: CapturedAttribute }> = ({ change }) => (
  <li className="flex items-start justify-between gap-2">
    <span className="text-xs font-medium text-neutral-700">{change.label}</span>
    <span className="text-right text-xs text-neutral-600">
      {change.omitted ? OMISSION_REASON[change.omitted] : OMISSION_FALLBACK}
    </span>
  </li>
);

const ConfirmBody: React.FC<{ changes: CapturedAttribute[] }> = ({ changes }) => {
  const restorable = changes.filter((change) => change.restorable);
  const skipped = changes.filter((change) => !change.restorable);

  return (
    <div className="space-y-4">
      <p className="text-sm text-pretty text-neutral-700">
        {restorable.length === changes.length
          ? `The previous value of ${restorable.length} attribute${restorable.length === 1 ? '' : 's'} will be written back to Okta.`
          : `${restorable.length} of ${changes.length} attributes can be restored.`}
      </p>

      <ul className="space-y-2">
        {restorable.map((change) => (
          <RestoreRow key={change.name} change={change} />
        ))}
      </ul>

      {skipped.length > 0 && (
        <div className="space-y-2 border-t border-neutral-200 pt-3">
          <p className="text-xs font-semibold text-neutral-700">
            Left unchanged ({skipped.length})
          </p>
          <ul className="space-y-1">
            {skipped.map((change) => (
              <SkippedRow key={change.name} change={change} />
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-pretty text-neutral-600">
        Okta has no rollback, so this is a new write rather than a reversal. It gets its own entry
        in this history, linked to the one it undoes — nothing is erased.
      </p>
    </div>
  );
};

const DriftedBody: React.FC<{ attributeNames: readonly string[] }> = ({ attributeNames }) => (
  <div className="space-y-4">
    <AlertMessage
      message={{
        type: 'warning',
        text: 'Nothing was written. These attributes are no longer what this edit set.',
      }}
    />

    <ul className="flex flex-wrap gap-2">
      {attributeNames.map((name) => (
        <li key={name}>
          <Badge variant="warning">{name}</Badge>
        </li>
      ))}
    </ul>

    <p className="text-sm text-pretty text-neutral-700">
      Someone or something else has changed {attributeNames.length === 1 ? 'it' : 'them'} since.
      Putting the previous values back would overwrite that change, so the undo was refused rather
      than performed.
    </p>
    <p className="text-xs text-pretty text-neutral-600">
      Open the user in Okta to see the current values and decide what should stand.
    </p>
  </div>
);

const AuditLogUndoModal: React.FC<AuditLogUndoModalProps> = ({
  action,
  onClose,
  onConfirm,
  isUndoing,
  drifted,
  error,
}) => {
  const isDrifted = drifted !== undefined && drifted.length > 0;
  const metadata = action?.metadata;
  const changes = metadata?.type === 'UPDATE_USER_PROFILE' ? metadata.changes : [];

  return (
    <Modal
      isOpen={action !== null}
      onClose={onClose}
      title={isDrifted ? 'Undo refused' : 'Restore previous values'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {isDrifted ? 'Close' : 'Cancel'}
          </Button>
          {!isDrifted && (
            <Button variant="primary" loading={isUndoing} onClick={onConfirm}>
              Restore
            </Button>
          )}
        </>
      }
    >
      {isDrifted ? (
        <DriftedBody attributeNames={drifted} />
      ) : (
        <div className="space-y-4">
          {error !== undefined && <AlertMessage message={{ type: 'danger', text: error }} />}
          {changes.length > 0 ? (
            <ConfirmBody changes={changes} />
          ) : (
            <p className="text-sm text-neutral-700">
              This entry has no captured previous values, so there is nothing to restore.
            </p>
          )}
        </div>
      )}
    </Modal>
  );
};

export default AuditLogUndoModal;
