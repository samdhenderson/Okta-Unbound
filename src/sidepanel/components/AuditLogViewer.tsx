import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { UndoAction } from '../../shared/undoTypes';
import { clearUndoHistory, getUndoHistory } from '../../shared/undoManager';
import type { RequestLogEntry } from '../../shared/requestLogTypes';
import { clearRequestLog, getRequestLog } from '../../shared/requestLog';
import { useUndoAction } from '../hooks/useUndoAction';
import AuditLogRow from './AuditLogRow';
import AuditLogUndoModal from './AuditLogUndoModal';
import RequestLogRow from './RequestLogRow';
import { AlertMessage, Button, Checkbox, EmptyState, Modal, type AlertMessageData } from './shared';

type HistoryItem =
  | { kind: 'action'; timestamp: number; action: UndoAction }
  | { kind: 'request'; timestamp: number; entry: RequestLogEntry };

export interface AuditLogViewerProps {
  targetTabId?: number | null;
  isActive?: boolean;
}

type Notice = AlertMessageData | null;

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ targetTabId, isActive = true }) => {
  const [actions, setActions] = useState<UndoAction[]>([]);
  const [requestEntries, setRequestEntries] = useState<RequestLogEntry[]>([]);
  const [verbose, setVerbose] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingUndo, setPendingUndo] = useState<UndoAction | null>(null);
  const [drifted, setDrifted] = useState<readonly string[] | undefined>(undefined);
  const [undoError, setUndoError] = useState<string | undefined>(undefined);
  const [isClearOpen, setIsClearOpen] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const { undo, undoingActionId, undoability } = useUndoAction({ targetTabId });

  const refresh = useCallback(async () => {
    const [history, requestLog] = await Promise.all([getUndoHistory(), getRequestLog()]);
    setActions(history.actions);
    setRequestEntries(requestLog.entries);
  }, []);

  useEffect(() => {
    if (!isActive) return;
    refresh();
    const handler = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.undoHistory || changes.apiRequestLog) refresh();
    };
    chrome.storage.onChanged.addListener(handler);
    return () => chrome.storage.onChanged.removeListener(handler);
  }, [isActive, refresh]);

  const historyItems = useMemo((): HistoryItem[] => {
    const items: HistoryItem[] = actions.map((action) => ({
      kind: 'action',
      timestamp: action.timestamp,
      action,
    }));
    if (verbose) {
      for (const entry of requestEntries) {
        items.push({ kind: 'request', timestamp: entry.timestamp, entry });
      }
    }
    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [actions, requestEntries, verbose]);

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
      const noun = `${outcome.unit}${outcome.restored === 1 ? '' : 's'}`;
      setNotice({
        type: 'success',
        text:
          outcome.skipped > 0
            ? `Restored ${outcome.restored} ${noun}; ${outcome.skipped} had no captured previous value and were left unchanged.`
            : `Restored ${outcome.restored} ${noun}.`,
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
    await Promise.all([clearUndoHistory(), clearRequestLog()]);
    setActions([]);
    setRequestEntries([]);
    setExpandedId(null);
    setNotice(null);
    setIsClearOpen(false);
  }, []);

  const historyCountLabel =
    verbose && requestEntries.length > 0
      ? `${actions.length} action${actions.length === 1 ? '' : 's'}, ${requestEntries.length} request batch${requestEntries.length === 1 ? '' : 'es'} logged`
      : `${actions.length} action${actions.length === 1 ? '' : 's'} logged`;

  return (
    <div className="space-y-(--sp-rung)">
      {notice && <AlertMessage message={notice} onDismiss={() => setNotice(null)} />}

      <Checkbox
        checked={verbose}
        onChange={setVerbose}
        label="Verbose"
        description="Also show every Okta API request made, grouped by why it was made"
      />

      {historyItems.length === 0 ? (
        <EmptyState
          icon="list"
          title="No audit history"
          description={
            verbose
              ? 'Actions you perform, and the API requests behind them, will be logged here'
              : 'Actions you perform (user removals, profile edits, rule changes) will be logged here'
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-(--sp-card)">
            <span className="text-sm font-medium text-neutral-700">{historyCountLabel}</span>
            <Button
              variant="secondary"
              size="sm"

              onClick={() => setIsClearOpen(true)}
            >
              Clear History
            </Button>
          </div>

          <div className="space-y-(--sp-rung)">
            {historyItems.map((item) =>
              item.kind === 'action' ? (
                <AuditLogRow
                  key={item.action.id}
                  action={item.action}
                  isExpanded={expandedId === item.action.id}
                  onToggle={(id) => setExpandedId((open) => (open === id ? null : id))}
                  onUndo={openUndo}
                  undoability={undoability}
                />
              ) : (
                <RequestLogRow
                  key={item.entry.id}
                  entry={item.entry}
                  isExpanded={expandedId === item.entry.id}
                  onToggle={(id) => setExpandedId((open) => (open === id ? null : id))}
                />
              ),
            )}
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
          All {actions.length} recorded action{actions.length === 1 ? '' : 's'}
          {requestEntries.length > 0 &&
            ` and ${requestEntries.length} logged request batch${requestEntries.length === 1 ? '' : 'es'}`}{' '}
          will be deleted from this browser. Nothing in Okta changes, but any undo they still
          offered goes with them.
        </p>
      </Modal>
    </div>
  );
};

export default AuditLogViewer;
