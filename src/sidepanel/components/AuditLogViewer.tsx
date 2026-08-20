import React, { useCallback, useEffect, useState } from 'react';
import type { UndoAction } from '../../shared/undoTypes';
import { clearUndoHistory, getUndoHistory } from '../../shared/undoManager';
import { useUndoAction } from '../hooks/useUndoAction';
import AuditLogRow from './AuditLogRow';
import AuditLogUndoModal from './AuditLogUndoModal';
import { AlertMessage, Button, EmptyState, Modal, type AlertMessageData } from './shared';

export interface AuditLogViewerProps {
  targetTabId?: number | null;
  isActive?: boolean;
}

type Notice = AlertMessageData | null;

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ targetTabId, isActive = true }) => {
  const [actions, setActions] = useState<UndoAction[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingUndo, setPendingUndo] = useState<UndoAction | null>(null);
  const [drifted, setDrifted] = useState<readonly string[] | undefined>(undefined);
  const [undoError, setUndoError] = useState<string | undefined>(undefined);
  const [isClearOpen, setIsClearOpen] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const { undo, undoingActionId, undoability } = useUndoAction({ targetTabId });

  const refresh = useCallback(async () => {
    const history = await getUndoHistory();
    setActions(history.actions);
  }, []);

  useEffect(() => {
    if (!isActive) return;
    refresh();
    const handler = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.undoHistory) refresh();
    };
    chrome.storage.onChanged.addListener(handler);
    return () => chrome.storage.onChanged.removeListener(handler);
  }, [isActive, refresh]);

  const openUndo = useCallback((action: UndoAction) => {
    setNotice(null);
    setDrifted(undefined);
    setUndoError(undefined);
    setPendingUndo(action);
  }, []);

  const closeUndo = useCallback(() => {
    setPendingUndo(null);
    setDrifted(undefined);
    setUndoError(undefined);
  }, []);

  const confirmUndo = useCallback(async () => {
    if (!pendingUndo) return;
    const outcome = await undo(pendingUndo);

    if (outcome.kind === 'drifted') {
      setUndoError(undefined);
      setDrifted(outcome.attributeNames);
      return;
    }
    if (outcome.kind === 'failed') {
      setUndoError(outcome.error);
      return;
    }

    closeUndo();
    if (outcome.kind === 'undone') {
      setNotice({
        type: 'success',
        text:
          outcome.skipped > 0
            ? `Restored ${outcome.restored} attribute${outcome.restored === 1 ? '' : 's'}; ${outcome.skipped} had no captured previous value and were left unchanged.`
            : `Restored ${outcome.restored} attribute${outcome.restored === 1 ? '' : 's'}.`,
      });
    } else {
      setNotice({
        type: 'info',
        text:
          outcome.kind === 'already-undone'
            ? 'This action has already been undone. Nothing was written.'
            : outcome.reason,
      });
    }
    refresh();
  }, [closeUndo, pendingUndo, refresh, undo]);

  const confirmClear = useCallback(async () => {
    await clearUndoHistory();
    setActions([]);
    setExpandedId(null);
    setNotice(null);
    setIsClearOpen(false);
  }, []);

  return (
    <div className="space-y-4">
      {notice && <AlertMessage message={notice} onDismiss={() => setNotice(null)} />}

      {actions.length === 0 ? (
        <EmptyState
          icon="list"
          title="No audit history"
          description="Actions you perform (user removals, profile edits, rule changes) will be logged here"
        />
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3">
            <span className="text-sm font-medium text-neutral-700">
              {actions.length} action{actions.length === 1 ? '' : 's'} logged
            </span>
            <Button variant="secondary" size="sm" onClick={() => setIsClearOpen(true)}>
              Clear History
            </Button>
          </div>

          <div className="space-y-3">
            {actions.map((action) => (
              <AuditLogRow
                key={action.id}
                action={action}
                isExpanded={expandedId === action.id}
                onToggle={(id) => setExpandedId((open) => (open === id ? null : id))}
                onUndo={openUndo}
                undoability={undoability}
              />
            ))}
          </div>
        </>
      )}

      <AuditLogUndoModal
        action={pendingUndo}
        onClose={closeUndo}
        onConfirm={confirmUndo}
        isUndoing={undoingActionId !== null && undoingActionId === pendingUndo?.id}
        drifted={drifted}
        error={undoError}
      />

      <Modal
        isOpen={isClearOpen}
        onClose={() => setIsClearOpen(false)}
        title="Clear history?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsClearOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmClear}>
              Clear history
            </Button>
          </>
        }
      >
        <p className="text-sm text-pretty text-neutral-700">
          All {actions.length} recorded action{actions.length === 1 ? '' : 's'} will be deleted from
          this browser. Nothing in Okta changes, but any undo they still offered goes with them.
        </p>
      </Modal>
    </div>
  );
};

export default AuditLogViewer;
