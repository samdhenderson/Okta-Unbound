import React, { useMemo } from 'react';
import {
  AlertMessage,
  Badge,
  Button,
  InsightCard,
  ListRow,
  Modal,
  SpreadBar,
  type BadgeVariant,
} from '../../shared';
import MfaScanButton from '../../members/MfaScanButton';
import { mfaEnrollmentSegments } from './mfaSpread';
import { MFA_ENROLLMENT_PAINT } from '../../../theme/chartPalette';
import {
  computeMfaEnrollment,
  computeMfaFactorTypes,
  mfaSignals,
  type BreakdownRow,
  type MemberFilter,
  type MfaSignalKind,
} from '../../members/memberAnalytics';
import { mfaScanNeedsConfirm } from '../../../hooks/useMemberMfaScan';
import type { OktaUser, MemberMfaResult, MfaScanStatus } from '../../../../shared/types';

const SIGNAL_VARIANT: Record<MfaSignalKind, BadgeVariant> = {
  unprotected: 'warning',
  'single-factor': 'neutral',
  'partial-scan': 'neutral',
};

export interface GroupMfaCoverageSectionProps {
  members: OktaUser[];
  mfaResults: Map<string, MemberMfaResult> | null;
  scanStatus: MfaScanStatus;
  onRunScan: () => void;
  onRequestConfirm: () => void;
  onCancelConfirm: () => void;
  onFilterMembers?: (filter: MemberFilter) => void;
}

const DistributionRow: React.FC<{
  row: BreakdownRow;
  swatch?: string;
  denominator: string;
  onSelect?: () => void;
}> = ({ row, swatch, denominator, onSelect }) => {
  const line = (
    <span className="flex w-full items-center justify-between gap-(--sp-inline) text-xs">
      <span className="flex min-w-0 items-center gap-(--sp-inline)">
        {swatch && (
          <span
            aria-hidden="true"
            className="size-2 shrink-0 rounded-xs"
            style={{ background: swatch }}
          />
        )}
        <span className="min-w-0 truncate text-neutral-700">{row.label}</span>
      </span>
      <span className="shrink-0 tabular-nums text-neutral-500">
        {row.count.toLocaleString()} ({Math.round(row.pct)}%)
      </span>
    </span>
  );

  if (!onSelect) return <li className="px-1 py-1">{line}</li>;

  return (
    <li>
      <ListRow
        as="button"
        density="compact"
        onClick={onSelect}
        ariaLabel={`Open Members filtered by ${row.label} — ${row.count.toLocaleString()} of ${denominator}`}
      >
        {line}
      </ListRow>
    </li>
  );
};

const GroupMfaCoverageSection: React.FC<GroupMfaCoverageSectionProps> = ({
  members,
  mfaResults,
  scanStatus,
  onRunScan,
  onRequestConfirm,
  onCancelConfirm,
  onFilterMembers,
}) => {
  const handleScanClick = (): void => {
    if (mfaScanNeedsConfirm(members.length)) onRequestConfirm();
    else onRunScan();
  };

  const enrollment = useMemo(
    () => computeMfaEnrollment(members, mfaResults),
    [members, mfaResults],
  );
  const factorTypes = useMemo(
    () => computeMfaFactorTypes(members, mfaResults),
    [members, mfaResults],
  );

  const reported = scanStatus === 'complete' && enrollment !== null && factorTypes !== null;
  const scannedLabel = enrollment ? `${enrollment.scanned.toLocaleString()} scanned` : '';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="min-w-0 flex-1 text-sm text-neutral-600">
          {reported
            ? `Scanned ${enrollment.scanned.toLocaleString()} of ${enrollment.total.toLocaleString()} members.`
            : 'Scan each member for enrolled MFA factors — one API call per member.'}
        </p>
        <MfaScanButton
          mfaResults={mfaResults}
          scanStatus={scanStatus}
          memberCount={members.length}
          onScanClick={handleScanClick}
        />
      </div>

      {scanStatus === 'error' && (
        <AlertMessage
          message={{ text: 'The MFA scan failed. Please try again.', type: 'danger' }}
        />
      )}

      {reported && (
        <div className="grid grid-cols-1 gap-(--sp-rung) sm:grid-cols-2">
          <InsightCard
            title={(titleId) => (
              <span id={titleId} className="truncate text-sm font-semibold text-neutral-900">
                Enrollment
              </span>
            )}
            subject="MFA enrollment"
            revealName="bucket breakdown"
            badges={
              mfaSignals(enrollment).length > 0 ? (
                <ul className="flex flex-wrap gap-1.5">
                  {mfaSignals(enrollment).map((signal) => (
                    <li key={signal.kind}>
                      <Badge variant={SIGNAL_VARIANT[signal.kind]} title={signal.description}>
                        {signal.label}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : undefined
            }
            headline={
              <>
                <SpreadBar
                  segments={mfaEnrollmentSegments(enrollment.rows).map(({ row, background }) => ({
                    key: row.value,
                    background,
                    count: row.count,
                    title: `${row.label} — ${row.count.toLocaleString()} (${Math.round(row.pct)}%)`,
                  }))}
                />
                <p className="text-xs text-neutral-600">
                  Every member in exactly one bucket, over the {scannedLabel}.
                </p>
              </>
            }
          >
            <ul className="space-y-1">
              {enrollment.rows.map((row) => (
                <DistributionRow
                  key={row.value}
                  row={row}
                  swatch={MFA_ENROLLMENT_PAINT[row.value]}
                  denominator={scannedLabel}
                  onSelect={
                    onFilterMembers && row.count > 0
                      ? () =>
                          onFilterMembers({
                            dimension: 'mfa',
                            value: row.value,
                            label: `MFA: ${row.label}`,
                          })
                      : undefined
                  }
                />
              ))}
            </ul>
          </InsightCard>

          <InsightCard
            title={(titleId) => (
              <span id={titleId} className="truncate text-sm font-semibold text-neutral-900">
                Factor types
              </span>
            )}
            subject="MFA factor types"
            revealName="factor list"
            badges={
              factorTypes.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5">
                  <li>
                    <Badge
                      variant="neutral"
                      title="Distinct active factor types held by at least one scanned member."
                    >
                      {factorTypes.length} type{factorTypes.length === 1 ? '' : 's'} in use
                    </Badge>
                  </li>
                </ul>
              ) : undefined
            }
            headline={
              <p className="text-xs text-neutral-600">
                {factorTypes.length === 0
                  ? `No scanned member holds an active factor, over the ${scannedLabel}.`
                  : `Held across the ${scannedLabel}. A member can hold more than one.`}
              </p>
            }
          >
            {factorTypes.length === 0 ? (
              <p className="text-xs text-neutral-500">
                The scan completed and found no active factor on any member it reached.
              </p>
            ) : (
              <>
                <ul className="space-y-1">
                  {factorTypes.map((row) => (
                    <DistributionRow
                      key={row.value}
                      row={row}
                      denominator={scannedLabel}
                      onSelect={
                        onFilterMembers
                          ? () =>
                              onFilterMembers({
                                dimension: 'mfa',
                                value: row.value,
                                label: `MFA: Has ${row.label}`,
                              })
                          : undefined
                      }
                    />
                  ))}
                </ul>
                <p className="border-t border-neutral-100 pt-2 text-xs text-neutral-500">
                  Members can hold more than one factor, so these do not sum to the group.
                </p>
              </>
            )}
          </InsightCard>
        </div>
      )}

      <Modal
        isOpen={scanStatus === 'confirming'}
        onClose={onCancelConfirm}
        title="Run MFA scan?"
        footer={
          <>
            <Button variant="secondary" onClick={onCancelConfirm}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onRunScan}>
              Scan anyway
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">
          This group has <strong>{members.length.toLocaleString()}</strong> members. Scanning makes
          roughly <strong>{members.length.toLocaleString()}</strong> API calls (one per member) and
          may take a while on large groups. Results are cached until you reload the panel.
        </p>
      </Modal>
    </div>
  );
};

export default GroupMfaCoverageSection;
