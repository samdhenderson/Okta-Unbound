import React from 'react';
import Scene from '../../shell/Scene';
import { Marker } from '../../shell/Callout';
import {
  ActionBar,
  Badge,
  Eyebrow,
  InsightCard,
  SpreadBar,
  type ActionDescriptor,
  type BadgeVariant,
} from '../../../sidepanel/components/shared';
import MfaScanButton from '../../../sidepanel/components/members/MfaScanButton';
import AttributeHealthCard from '../../../sidepanel/components/groups/detail/AttributeHealthCard';
import { mfaEnrollmentSegments } from '../../../sidepanel/components/groups/detail/mfaSpread';
import {
  NONE_VALUE,
  attributeSignals,
  computeMfaEnrollment,
  computeMfaFactorTypes,
  discoverAttributeBreakdowns,
  mfaSignals,
  type MfaSignalKind,
} from '../../../sidepanel/components/members/memberAnalytics';
import type { AttributeRuleRef } from '../../../shared/rules/groupAttributeIndex';
import type { MemberMfaResult, MfaScanStatus, OktaUser } from '../../../shared/types';
import { summarizeFactors } from '../../../shared/utils/mfaUtils';
import { demoUsersById } from '../../../sidepanel/demo/users';
import { demoFactorsFor } from '../../../sidepanel/demo/factors';
import { demoGroupMembers } from '../../../sidepanel/demo/memberships';
import { DEMO_HERO_GROUP_ID, currentGroupsById, demoRules } from '../../../sidepanel/demo/snapshot';

const groupName = currentGroupsById().get(DEMO_HERO_GROUP_ID)?.profile?.name ?? 'Engineering';

const STRAY_SPELLINGS: readonly string[] = [
  'engineering',
  'engineering',
  'engineering',
  'engineering',
  'engineering',
  'ENGINEERING',
  'ENGINEERING',
];

const members: OktaUser[] = (demoGroupMembers().get(DEMO_HERO_GROUP_ID) ?? [])
  .map((id) => demoUsersById.get(id))
  .filter((user): user is OktaUser => user !== undefined)
  .map((user, index) => {
    const stray = STRAY_SPELLINGS[index];
    return stray ? { ...user, profile: { ...user.profile, department: stray } } : user;
  });

const mfaResults = new Map<string, MemberMfaResult>(
  members.map((member) => [member.id, summarizeFactors(member.id, demoFactorsFor(member.id))]),
);

const enrollment = computeMfaEnrollment(members, mfaResults)!;
const factorTypes = computeMfaFactorTypes(members, mfaResults)!;
const scannedLabel = `${enrollment.scanned.toLocaleString()} scanned`;

const MFA_SIGNAL_VARIANT: Record<MfaSignalKind, BadgeVariant> = {
  unprotected: 'warning',
  'single-factor': 'neutral',
  'partial-scan': 'neutral',
};

const feedingRules: AttributeRuleRef[] = demoRules
  .filter((rule) => rule.actions?.assignUserToGroups?.groupIds?.includes(DEMO_HERO_GROUP_ID))
  .map((rule) => ({ ruleId: rule.id, ruleName: rule.name }));

const summaries = discoverAttributeBreakdowns(members);
const department = summaries.find((summary) => summary.key === 'department')!;
const state = summaries.find((summary) => summary.key === 'state')!;

const strayValue = 'engineering';
const strayCount = department.rows.find((row) => row.value === strayValue)?.count ?? 0;

const dominantValue = department.rows[0]?.label ?? 'Engineering';

const noFactors = enrollment.rows.find((row) => row.value === 'none')!;
const singleFactor = enrollment.rows.find((row) => row.value === 'single')!;

const departmentTally = department.rows
  .map((row) => `${row.count.toLocaleString()} ${row.label}`)
  .join(', ');

const feedingRuleName = feedingRules[0]?.ruleName ?? 'the feeding rule';

const stateBlanks = state.rows.find((row) => row.value === NONE_VALUE)?.count ?? 0;

const noop = () => {};

const stripActions: ActionDescriptor[] = [
  {
    id: 'add-member',
    label: 'Add',
    icon: 'plus',
    variant: 'primary',
    onClick: noop,
    title: 'Add a member to this group',
  },
  {
    id: 'compare',
    label: 'Compare',
    icon: 'users',
    priority: 'flex',
    onClick: noop,
    title: "Compare this group's membership with another group",
  },
  {
    id: 'export-members',
    label: 'Export members',
    icon: 'download',
    priority: 'tier',
    onClick: noop,
    title: "Export this group's members (opens the Export tab with column picker + presets)",
  },
  {
    id: 'set-profile-attribute',
    label: `Set attribute on ${strayCount} members`,
    icon: 'pencil',
    priority: 'tier',
    onClick: noop,
    title: `Set one profile attribute on the ${strayCount} members matching the Members tab's current search and filters, not the selected users`,
  },
];

const CountLine: React.FC<{
  label: string;
  count: number;
  pct: number;
  swatch?: string;
  index: number;
}> = ({ label, count, pct, swatch, index }) => (
  <li
    className="flex items-center justify-between gap-(--sp-inline) px-1 py-1 text-xs transition-[opacity,translate] duration-(--dur-move) ease-entrance delay-[calc(var(--guide-cascade-step)*var(--guide-i))] [[data-open='false']_&]:translate-y-1 [[data-open='false']_&]:opacity-0 [[data-open='false']_&]:delay-0 [[data-open='false']_&]:duration-(--dur-quick) [[data-open='false']_&]:ease-exit"
    style={{ '--guide-i': index } as React.CSSProperties}
  >
    <span className="flex min-w-0 items-center gap-(--sp-inline)">
      {swatch ? (
        <span
          aria-hidden="true"
          className="size-2 shrink-0 rounded-xs"
          style={{ background: swatch }}
        />
      ) : null}
      <span className="min-w-0 truncate text-neutral-700">{label}</span>
    </span>
    <span className="shrink-0 tabular-nums text-neutral-500">
      {count.toLocaleString()} ({Math.round(pct)}%)
    </span>
  </li>
);

const Target: React.FC<{ n: number; children: React.ReactNode }> = ({ n, children }) => (
  <div
    data-guide-target={n}
    className="rounded-md ring-primary-highlight transition-shadow duration-(--dur-instant) ease-standard"
  >
    {children}
  </div>
);

const LINKED =
  '[&_.guide-legend>li]:rounded-sm [&_.guide-legend>li]:transition-[background-color,box-shadow] [&_.guide-legend>li]:duration-(--dur-instant) [&_.guide-legend>li]:ease-standard ' +
  '[&_[data-guide-target]+span]:ring-primary-highlight [&_[data-guide-target]+span]:transition-shadow [&_[data-guide-target]+span]:duration-(--dur-instant) ' +
  "[&:has([data-guide-target='1']:hover,[data-guide-target='1']_:focus-visible,.guide-legend>li:nth-child(1):hover)_.guide-legend>li:nth-child(1)]:bg-primary-light " +
  "[&:has([data-guide-target='1']:hover,[data-guide-target='1']_:focus-visible,.guide-legend>li:nth-child(1):hover)_.guide-legend>li:nth-child(1)]:shadow-[0_0_0_6px_var(--color-primary-light)] " +
  "[&:has([data-guide-target='1']:hover,[data-guide-target='1']_:focus-visible,.guide-legend>li:nth-child(1):hover)_[data-guide-target='1']]:ring-2 " +
  "[&:has([data-guide-target='1']:hover,[data-guide-target='1']_:focus-visible,.guide-legend>li:nth-child(1):hover)_[data-guide-target='1']+span]:ring-4 " +
  "[&:has([data-guide-target='2']:hover,[data-guide-target='2']_:focus-visible,.guide-legend>li:nth-child(2):hover)_.guide-legend>li:nth-child(2)]:bg-primary-light " +
  "[&:has([data-guide-target='2']:hover,[data-guide-target='2']_:focus-visible,.guide-legend>li:nth-child(2):hover)_.guide-legend>li:nth-child(2)]:shadow-[0_0_0_6px_var(--color-primary-light)] " +
  "[&:has([data-guide-target='2']:hover,[data-guide-target='2']_:focus-visible,.guide-legend>li:nth-child(2):hover)_[data-guide-target='2']]:ring-2 " +
  "[&:has([data-guide-target='2']:hover,[data-guide-target='2']_:focus-visible,.guide-legend>li:nth-child(2):hover)_[data-guide-target='2']+span]:ring-4 " +
  "[&:has([data-guide-target='3']:hover,[data-guide-target='3']_:focus-visible,.guide-legend>li:nth-child(3):hover)_.guide-legend>li:nth-child(3)]:bg-primary-light " +
  "[&:has([data-guide-target='3']:hover,[data-guide-target='3']_:focus-visible,.guide-legend>li:nth-child(3):hover)_.guide-legend>li:nth-child(3)]:shadow-[0_0_0_6px_var(--color-primary-light)] " +
  "[&:has([data-guide-target='3']:hover,[data-guide-target='3']_:focus-visible,.guide-legend>li:nth-child(3):hover)_[data-guide-target='3']]:ring-2 " +
  "[&:has([data-guide-target='3']:hover,[data-guide-target='3']_:focus-visible,.guide-legend>li:nth-child(3):hover)_[data-guide-target='3']+span]:ring-4";

const Linked: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={LINKED}>{children}</div>
);

const Name: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="font-medium text-neutral-900">{children}</span>
);

const ScanRow: React.FC<{
  results: Map<string, MemberMfaResult> | null;
  status: MfaScanStatus;
}> = ({ results, status }) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <p className="min-w-0 flex-1 text-sm text-neutral-600">
      {results
        ? `Scanned ${enrollment.scanned.toLocaleString()} of ${enrollment.total.toLocaleString()} members.`
        : 'Scan each member for enrolled MFA factors, one call per member.'}
    </p>
    <MfaScanButton
      mfaResults={results}
      scanStatus={status}
      memberCount={members.length}
      onScanClick={noop}
    />
  </div>
);

const EnrollmentBadges: React.FC = () => {
  const items = mfaSignals(enrollment).map((signal) => (
    <li key={signal.kind}>
      <Badge variant={MFA_SIGNAL_VARIANT[signal.kind]} title={signal.description}>
        {signal.label}
      </Badge>
    </li>
  ));
  return <ul className="flex flex-wrap gap-1.5">{items}</ul>;
};

const EnrollmentCard: React.FC = () => (
  <InsightCard
    title={(titleId) => (
      <span id={titleId} className="truncate text-sm font-semibold text-neutral-900">
        Enrollment
      </span>
    )}
    subject="MFA enrollment"
    revealName="bucket breakdown"
    badges={<EnrollmentBadges />}
    headline={
      <>
        <div>
          <SpreadBar
            segments={mfaEnrollmentSegments(enrollment.rows).map(({ row, background }) => ({
              key: row.value,
              background,
              count: row.count,
              title: `${row.label}: ${row.count.toLocaleString()} (${Math.round(row.pct)}%)`,
            }))}
          />
        </div>
        <p className="text-xs text-neutral-600">
          Every member in exactly one bucket, over the {scannedLabel}.
        </p>
      </>
    }
  >
    <ul className="space-y-1">
      {mfaEnrollmentSegments(enrollment.rows).map(({ row, background }, index) => (
        <CountLine
          key={row.value}
          label={row.label}
          count={row.count}
          pct={row.pct}
          swatch={background}
          index={index}
        />
      ))}
    </ul>
  </InsightCard>
);

const Strip: React.FC = () => (
  <ActionBar
    ariaLabel={`Actions for ${groupName}`}
    sticky={false}
    actions={stripActions}
    expansion={
      <div className="space-y-(--sp-field)">
        <div className="flex items-center justify-between gap-2">
          <Eyebrow>Filtered cohort</Eyebrow>
          <span className="text-xs text-neutral-600">Asks what to set</span>
        </div>
        <span className="block text-xs text-neutral-600">
          Acts on the members matching the Members tab's search and filters, not on the selected
          users. Previous values are recorded for undo, so a cohort larger than that record holds is
          refused whole.
        </span>
      </div>
    }
  />
);

export const MfaCoverageScene: React.FC = () => (
  <Linked>
    <Scene
      title="MFA Coverage"
      intro="A group's Insights tab asks two questions of its members: who is protected, and whether their profiles agree with each other. It answers from the roster you already loaded. The MFA scan reads one factor list per member, and it never runs on its own: you start it, and it paces itself against your org's rate limit, so a large group takes a while and asks you to confirm first."
      legend={[
        {
          text: `The trigger. This scan has finished, so the button offers a rescan and the line beside it reads ${enrollment.scanned.toLocaleString()} of ${enrollment.total.toLocaleString()} members scanned. Before the first run that line names the cost instead: one call per member.`,
        },
        {
          text: `Enrollment is a partition. Every scanned member sits in exactly one bucket, and the badges lift the two counts worth acting on: ${noFactors.count.toLocaleString()} with no factor, ${singleFactor.count.toLocaleString()} on a single one.`,
        },
        {
          text: `Factor types is a tally over those same ${enrollment.scanned.toLocaleString()} members, so a person holding Okta Verify and SMS is counted in both rows. No bar, because these counts do not add up to the group.`,
        },
      ]}
      outro={`In the panel, every row on these cards is a button. Click the no factor bucket and you land on the Members tab filtered to those ${noFactors.count} people, with the filter named at the top of the list.`}
    >
      <div className="space-y-3">
        <Marker n={1}>
          <Target n={1}>
            <ScanRow results={mfaResults} status="complete" />
          </Target>
        </Marker>

        <div className="grid grid-cols-1 gap-(--sp-rung)">
          <Marker n={2} align="top">
            <Target n={2}>
              <EnrollmentCard />
            </Target>
          </Marker>

          <Marker n={3} align="top">
            <Target n={3}>
              <InsightCard
                title={(titleId) => (
                  <span id={titleId} className="truncate text-sm font-semibold text-neutral-900">
                    Factor types
                  </span>
                )}
                subject="MFA factor types"
                revealName="factor list"
                badges={
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
                }
                headline={
                  <p className="text-xs text-neutral-600">
                    Held across the {scannedLabel}. A member can hold more than one.
                  </p>
                }
              >
                <ul className="space-y-1">
                  {factorTypes.map((row, index) => (
                    <CountLine
                      key={row.value}
                      label={row.label}
                      count={row.count}
                      pct={row.pct}
                      index={index}
                    />
                  ))}
                </ul>
                <p className="border-t border-neutral-100 pt-2 text-xs text-neutral-500">
                  Members can hold more than one factor, so these do not sum to the group.
                </p>
              </InsightCard>
            </Target>
          </Marker>
        </div>
      </div>
    </Scene>
  </Linked>
);

export const ProfileHealthScene: React.FC = () => (
  <Linked>
    <Scene
      title="Profile Health"
      intro="Below the scan, one card per profile attribute the roster carries, ranked so the attribute most in need of attention comes first. Open a card to see its values."
      legend={[
        {
          text: `department is spelled ${department.distinct} ways: ${departmentTally}. The two strays are marked Outlier and left as they are. The second badge names the rule that reads this attribute, ${feedingRuleName}, so a stray spelling is a member it drops.`,
        },
        {
          text: `state carries no badge, so nothing about it is flagged. Its headline is the whole card until you open it: ${state.distinct} values, ${Math.round(state.fillRate)}% populated. Inside, the ${stateBlanks.toLocaleString()} blanks get a line of their own, because a blank is the absence of a value rather than one people share.`,
        },
      ]}
      outro={
        <>
          Each value row is a filter too. Click <code className="font-mono">{strayValue}</code> and
          the Members tab shows those {strayCount} people. A filter takes one value at a time, so
          the two spelled <code className="font-mono">ENGINEERING</code> wait their turn. That
          filtered roster is the cohort the next scene acts on.
        </>
      }
    >
      <div className="grid grid-cols-1 gap-(--sp-rung)">
        <Marker n={1} align="top">
          <Target n={1}>
            <AttributeHealthCard
              summary={department}
              signals={attributeSignals(department, feedingRules.length)}
              rules={feedingRules}
              defaultExpanded
            />
          </Target>
        </Marker>
        <Marker n={2} align="top">
          <Target n={2}>
            <AttributeHealthCard summary={state} signals={attributeSignals(state, 0)} rules={[]} />
          </Target>
        </Marker>
      </div>
    </Scene>
  </Linked>
);

export const BulkFixScene: React.FC = () => (
  <Linked>
    <Scene
      title="Bulk Fix"
      intro={
        <>
          With a filter on the Members tab, the group's action strip grows a verb scoped to exactly
          those members. Open <Name>More</Name> to find it.
        </>
      }
      legend={[
        {
          text: `Add and Compare stay in the row. Behind More sit Export members and Set attribute on ${strayCount} members, which carries its count in the label, so you know who it touches before you press it.`,
        },
      ]}
      outro={
        <>
          <Name>Set attribute</Name> sends those members to Selection&rsquo;s bulk profile verb,
          which sets one attribute to one value across all of them: department to {dominantValue},
          here, on {strayCount} people. The preflight runs first. It reads each profile, shows the
          values it is about to replace, and refuses whole if the cohort is larger than it can
          record for undo. Nothing writes until you accept what it found.
        </>
      }
      minHeight={200}
    >
      <Marker n={1} align="top">
        <Target n={1}>
          <Strip />
        </Target>
      </Marker>
    </Scene>
  </Linked>
);
