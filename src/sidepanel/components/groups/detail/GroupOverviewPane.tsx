import React from 'react';
import Icon, { type IconType } from '../../shared/Icon';
import type { SourceStatus } from '../../../hooks/useGroupSource';
import type { RolesReadStatus } from '../../../hooks/useGroupAccessGrants';
import type { MemberSourceBreakdown } from '../../../../shared/membership/groupSource';
import type { GroupSummary } from '../../../../shared/types';

type OverviewTarget = 'members' | 'access' | 'rules';

interface GroupOverviewPaneProps {
  group: GroupSummary;
  breakdown: MemberSourceBreakdown | null;
  memberStatus: SourceStatus;
  feedingRulesCount: number;
  rulesStatus: SourceStatus;
  appsCount: number;
  appsStatus: SourceStatus;
  rolesCount: number;
  rolesStatus: RolesReadStatus;
  referencingRulesCount: number;
  referencingStatus: SourceStatus;
  onNavigate: (tab: OverviewTarget) => void;
}

function plural(count: number, noun: string): string {
  return `${count.toLocaleString()} ${noun}${count === 1 ? '' : 's'}`;
}

interface VerdictTileProps {
  label: string;
  icon: IconType;
  headline: string;
  detail?: string;
  onClick: () => void;
}

const VerdictTile: React.FC<VerdictTileProps> = ({ label, icon, headline, detail, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="press press-subtle lift flex w-full items-start gap-3 rounded-md border border-neutral-200 bg-white p-(--sp-card) text-left hover:border-neutral-300"
  >
    <span className="mt-0.5 shrink-0 rounded-md bg-neutral-100 p-1.5">
      <Icon type={icon} size="sm" className="text-neutral-600" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-xs font-semibold uppercase tracking-wide text-neutral-600">
        {label}
      </span>
      <span className="mt-1 block text-sm font-medium text-neutral-900">{headline}</span>
      {detail && <span className="mt-0.5 block text-xs text-neutral-500">{detail}</span>}
    </span>
    <Icon type="chevron-right" size="sm" className="mt-0.5 shrink-0 text-neutral-400" />
  </button>
);

const MembershipSourceTile: React.FC<{
  breakdown: MemberSourceBreakdown | null;
  memberStatus: SourceStatus;
  onClick: () => void;
}> = ({ breakdown, memberStatus, onClick }) => {
  if (memberStatus === 'idle') {
    return (
      <VerdictTile
        label="Where membership comes from"
        icon="users"
        headline="Not analyzed yet"
        detail="Open Members to split the roster into rule-managed and manual."
        onClick={onClick}
      />
    );
  }
  if (memberStatus !== 'done' || !breakdown || breakdown.total === 0) return null;

  const ruleCount = breakdown.byRule.length;
  const pct = Math.round((breakdown.ruleBased / breakdown.total) * 100);
  const headline =
    breakdown.ruleBased === 0
      ? 'All members were added by hand'
      : `${plural(ruleCount, 'rule')} account for ${pct}% of members`;
  const detail =
    breakdown.direct > 0
      ? `${plural(breakdown.direct, 'member')} added by hand`
      : breakdown.ruleBased > 0
        ? 'No members were added by hand'
        : undefined;

  return (
    <VerdictTile
      label="Where membership comes from"
      icon="users"
      headline={headline}
      detail={detail}
      onClick={onClick}
    />
  );
};

const AccessGrantsTile: React.FC<{
  appsCount: number;
  appsStatus: SourceStatus;
  rolesCount: number;
  rolesStatus: RolesReadStatus;
  onClick: () => void;
}> = ({ appsCount, appsStatus, rolesCount, rolesStatus, onClick }) => {
  if (appsStatus !== 'done') return null;

  return (
    <VerdictTile
      label="What it grants"
      icon="shield"
      headline={`Grants access to ${plural(appsCount, 'app')}`}
      detail={rolesStatus === 'available' ? `${plural(rolesCount, 'admin role')}` : undefined}
      onClick={onClick}
    />
  );
};

const RuleRelationshipsTile: React.FC<{
  feedingRulesCount: number;
  rulesStatus: SourceStatus;
  referencingRulesCount: number;
  referencingStatus: SourceStatus;
  onClick: () => void;
}> = ({ feedingRulesCount, rulesStatus, referencingRulesCount, referencingStatus, onClick }) => {
  if (rulesStatus !== 'done') return null;

  return (
    <VerdictTile
      label="Why, and who reads it"
      icon="bolt"
      headline={`${plural(feedingRulesCount, 'rule')} assign into this group`}
      detail={
        referencingStatus === 'done'
          ? `${plural(referencingRulesCount, 'rule')} reference it`
          : undefined
      }
      onClick={onClick}
    />
  );
};

const AppPushTile: React.FC<{ group: GroupSummary; onClick: () => void }> = ({
  group,
  onClick,
}) => {
  const mappings = group.pushMappings;
  if (!mappings || mappings.length === 0) return null;

  return (
    <VerdictTile
      label="App push"
      icon="refresh"
      headline={`Pushed to ${plural(mappings.length, 'app')}`}
      detail="Membership syncs out to each target group's app."
      onClick={onClick}
    />
  );
};

const GroupOverviewPane: React.FC<GroupOverviewPaneProps> = ({
  group,
  breakdown,
  memberStatus,
  feedingRulesCount,
  rulesStatus,
  appsCount,
  appsStatus,
  rolesCount,
  rolesStatus,
  referencingRulesCount,
  referencingStatus,
  onNavigate,
}) => (
  <div className="space-y-(--sp-rung)" role="tabpanel" aria-label="Overview">
    <MembershipSourceTile
      breakdown={breakdown}
      memberStatus={memberStatus}
      onClick={() => onNavigate('members')}
    />

    <div className="grid grid-cols-2 gap-(--sp-rung)">
      <AccessGrantsTile
        appsCount={appsCount}
        appsStatus={appsStatus}
        rolesCount={rolesCount}
        rolesStatus={rolesStatus}
        onClick={() => onNavigate('access')}
      />

      <RuleRelationshipsTile
        feedingRulesCount={feedingRulesCount}
        rulesStatus={rulesStatus}
        referencingRulesCount={referencingRulesCount}
        referencingStatus={referencingStatus}
        onClick={() => onNavigate('rules')}
      />
    </div>

    <AppPushTile group={group} onClick={() => onNavigate('access')} />
  </div>
);

export default GroupOverviewPane;
