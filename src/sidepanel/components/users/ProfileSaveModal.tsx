import React from 'react';
import { AlertMessage, Badge, Button, Eyebrow, Modal, type GroupNameResolver } from '../shared';
import BlastRadiusReport from './BlastRadiusReport';
import type { BlastRadiusReport as BlastRadiusReportData } from '../../../shared/membership/blastRadiusTypes';
import type { DraftChange } from './profileDraft';

export interface ProfileSaveModalProps {
  changes: readonly DraftChange[] | null;
  userName: string;
  onCancel: () => void;
  onConfirm: () => void;
  isSaving: boolean;
  report: BlastRadiusReportData;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  resolveGroupName?: GroupNameResolver;
  error?: string;
}

const Value: React.FC<{ text: string; side: 'before' | 'after' }> = ({ text, side }) =>
  text === '' ? (
    <em className="text-neutral-500">{side === 'before' ? '— not set' : '— cleared'}</em>
  ) : (
    <span className={side === 'before' ? 'text-neutral-600' : 'font-medium text-neutral-900'}>
      {text}
    </span>
  );

const ChangeRow: React.FC<{ change: DraftChange }> = ({ change }) => (
  <li className="px-(--sp-row-x) py-(--sp-row-y)">
    <div className="flex flex-wrap items-center justify-between gap-(--sp-inline)">
      <p className="text-sm font-semibold text-neutral-900">{change.label}</p>
      {change.changesSignIn && <Badge variant="danger">Sign-in</Badge>}
    </div>
    {change.name !== change.label && (
      <p className="font-mono text-xs text-neutral-500">{change.name}</p>
    )}
    <p className="mt-1 text-sm text-pretty break-words">
      <Value text={change.beforeDisplay} side="before" />
      <span aria-hidden="true"> → </span>
      <span className="sr-only"> changes to </span>
      <Value text={change.afterDisplay} side="after" />
    </p>
  </li>
);

const ProfileSaveModal: React.FC<ProfileSaveModalProps> = ({
  changes,
  userName,
  onCancel,
  onConfirm,
  isSaving,
  report,
  onAnalyze,
  isAnalyzing,
  resolveGroupName,
  error,
}) => {
  const items = changes ?? [];
  const count = items.length;
  const changesSignIn = items.some((change) => change.changesSignIn);
  const analyzed = report.status !== 'not-computed';

  return (
    <Modal
      isOpen={changes !== null}
      onClose={onCancel}
      title="Save profile changes?"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="danger" loading={isSaving} onClick={onConfirm}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-(--sp-rung)">
        {error !== undefined && <AlertMessage message={{ type: 'danger', text: error }} />}

        <AlertMessage
          message={{
            type: 'warning',
            text: `${count} attribute${count === 1 ? '' : 's'} on ${userName} will be overwritten in Okta. This is a live write.`,
          }}
        />

        {changesSignIn && (
          <AlertMessage
            message={{
              type: 'danger',
              text: `This changes how ${userName} signs in. Their current sign-in value stops working as soon as this is saved, and Okta does not announce it — tell them yourself.`,
            }}
          />
        )}

        <section className="space-y-2">
          <Eyebrow as="h3">Changes</Eyebrow>
          <ul className="divide-y divide-neutral-100 rounded-md border border-neutral-200">
            {items.map((change) => (
              <ChangeRow key={change.name} change={change} />
            ))}
          </ul>
        </section>

        <section className="space-y-2">
          <Eyebrow as="h3">Blast radius</Eyebrow>
          <p className="text-xs text-pretty text-neutral-600">
            Group rules read profile attributes, so this edit can move group access.
          </p>
          {!analyzed && (
            <Button
              variant="secondary"
              size="sm"
              icon="chart"
              loading={isAnalyzing}
              onClick={onAnalyze}
            >
              Analyze blast radius
            </Button>
          )}
          <BlastRadiusReport report={report} resolveGroupName={resolveGroupName} />
        </section>
      </div>
    </Modal>
  );
};

export default ProfileSaveModal;
