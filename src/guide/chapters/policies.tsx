import React, { useId, useState } from 'react';
import ChapterPage, { type ShowSpec } from '../shell/ChapterPage';
import Scene from '../shell/Scene';
import { Marker } from '../shell/Callout';
import Assemble from '../show/Assemble';
import {
  CopyableId,
  EmptyState,
  Eyebrow,
  IconButton,
  ListCountRow,
  ListRow,
  StretchedButton,
} from '../../sidepanel/components/shared';
import Icon from '../../sidepanel/components/shared/Icon';
import PolicyRulesList from '../../sidepanel/components/policies/PolicyRulesList';
import {
  policyStatusClasses,
  policyStatusLabel,
} from '../../sidepanel/components/policies/policyStatus';
import { useCountUp } from '../../sidepanel/hooks/useCountUp';
import type { OktaPolicyListItem, OktaPolicyRule } from '../../shared/schemas/okta';

interface PolicyFixture {
  policy: OktaPolicyListItem;
  rules: OktaPolicyRule[];
}

const twoFactors: PolicyFixture = {
  policy: {
    id: 'rstFAKE000000000001',
    name: 'Any two factors',
    status: 'ACTIVE',
    type: 'ACCESS_POLICY',
    priority: 1,
    description: 'Requires two factors for high-risk applications',
    system: false,
  },
  rules: [
    { id: '0prFAKE000000000011', name: 'Trusted device, no prompt', status: 'ACTIVE', priority: 1 },
    {
      id: '0prFAKE000000000012',
      name: 'Contractors: prompt every time',
      status: 'ACTIVE',
      priority: 2,
    },
    {
      id: '0prFAKE000000000013',
      name: 'Catch-all Rule',
      status: 'ACTIVE',
      priority: 3,
      system: true,
    },
  ],
};

const legacyVpn: PolicyFixture = {
  policy: {
    id: 'rstFAKE000000000002',
    name: 'Legacy VPN',
    status: 'INACTIVE',
    type: 'ACCESS_POLICY',
    priority: 2,
    description: 'Password only, for the appliance that is being retired',
    system: false,
  },
  rules: [
    {
      id: '0prFAKE000000000021',
      name: 'Catch-all Rule',
      status: 'ACTIVE',
      priority: 1,
      system: true,
    },
  ],
};

const defaultPolicy: PolicyFixture = {
  policy: {
    id: 'rstFAKE000000000003',
    name: 'Default Policy',
    status: 'ACTIVE',
    type: 'ACCESS_POLICY',
    priority: 99,
    system: true,
  },
  rules: [
    {
      id: '0prFAKE000000000031',
      name: 'Catch-all Rule',
      status: 'ACTIVE',
      priority: 1,
      system: true,
    },
  ],
};

const policies = [twoFactors, legacyVpn, defaultPolicy];

const noop = () => {};

const CARD_STACK = 'flex flex-col gap-(--sp-rung)';

type HotSpot = `${string}:${number}` | null;

interface HotProps {
  hot: HotSpot;
  onHot: (spot: HotSpot) => void;
}

function useHotSpot(): HotProps {
  const [hot, setHot] = useState<HotSpot>(null);
  return { hot, onHot: setHot };
}

interface HotLineProps extends HotProps {
  scene: string;
  n: number;
  children: React.ReactNode;
}

interface HotTargetProps extends HotLineProps {
  lift?: boolean;
}

const HotTarget: React.FC<HotTargetProps> = ({ scene, n, hot, onHot, lift, children }) => {
  const spot: HotSpot = `${scene}:${n}`;
  const lit = hot === spot;
  return (
    <div
      className={`rounded-md ring-primary-highlight transition-shadow duration-(--dur-instant) ease-(--ease-standard) data-lit:ring-2 ${lift ? 'lift' : ''}`}
      data-spot={spot}
      data-lit={lit || undefined}
      onPointerEnter={() => onHot(spot)}
      onPointerLeave={() => onHot(null)}
      onFocus={() => onHot(spot)}
      onBlur={() => onHot(null)}
    >
      {children}
    </div>
  );
};

const HotLine: React.FC<HotLineProps> = ({ scene, n, hot, onHot, children }) => {
  const spot: HotSpot = `${scene}:${n}`;
  const lit = hot === spot;
  return (
    <span
      className="-mx-1.5 -my-0.5 box-decoration-clone rounded-sm px-1.5 py-0.5 transition-colors duration-(--dur-instant) ease-(--ease-standard) data-lit:bg-primary-light"
      data-spot={spot}
      data-lit={lit || undefined}
      onPointerEnter={() => onHot(spot)}
      onPointerLeave={() => onHot(null)}
    >
      {children}
    </span>
  );
};

interface GuidePolicyCardProps {
  fixture: PolicyFixture;
  expanded: boolean;
  onToggle: (policyId: string) => void;
  cascade?: boolean;
}

const GuidePolicyCard: React.FC<GuidePolicyCardProps> = ({
  fixture,
  expanded,
  onToggle,
  cascade,
}) => {
  const { policy, rules } = fixture;
  const rulesId = useId();
  const nameId = useId();
  const name = policy.name ?? policy.id;
  const badge = 'rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs';

  return (
    <ListRow
      density="comfortable"
      headerClassName="press-subtle"
      body={
        <div id={rulesId} className="disclose" data-open={expanded} inert={!expanded || undefined}>
          <div>
            <div
              key={String(expanded)}
              className={`space-y-3 border-t border-neutral-100 bg-neutral-50 px-4 pb-4 pt-3 ${expanded && !cascade ? 'animate-rise-in' : ''}`}
              style={
                expanded && !cascade
                  ? { animationDelay: 'calc(var(--dur-quick) * var(--guide-motion, 1))' }
                  : undefined
              }
            >
              <Eyebrow as="div">Rules</Eyebrow>
              {cascade && expanded ? (
                <Assemble selector="ul > li">
                  <PolicyRulesList rules={rules} isLoading={false} error={null} />
                </Assemble>
              ) : (
                <PolicyRulesList rules={rules} isLoading={false} error={null} />
              )}
              <div className="flex min-w-0 items-center gap-1 border-t border-neutral-200 pt-2 text-xs text-neutral-600">
                <span className="shrink-0 font-semibold">Policy ID:</span>
                <CopyableId value={policy.id} label={`Copy policy id for ${name} (${policy.id})`} />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="relative flex items-start justify-between gap-4">
        <StretchedButton
          label={expanded ? 'Hide rules' : 'Show rules'}
          describedBy={nameId}
          onClick={() => onToggle(policy.id)}
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-(--sp-inline)">
            <h3 id={nameId} className="text-sm font-semibold text-neutral-900">
              {name}
            </h3>
            <span
              className={`rounded-md border px-2 py-0.5 text-xs font-medium ${policyStatusClasses(policy.status)}`}
            >
              {policyStatusLabel(policy.status)}
            </span>
            {policy.system && (
              <span className={`${badge} font-medium text-neutral-600`}>System</span>
            )}
            {policy.priority != null && (
              <span className={`${badge} font-mono text-neutral-600`}>
                Priority {policy.priority}
              </span>
            )}
          </div>
          {policy.description && (
            <p className="truncate text-xs text-neutral-600">{policy.description}</p>
          )}
        </div>
        <IconButton
          label={expanded ? `Hide rules for ${name}` : `Show rules for ${name}`}
          variant="ghost"
          size="md"
          expanded={expanded}
          controls={rulesId}
          className="relative z-10 shrink-0"
          onClick={() => onToggle(policy.id)}
        >
          <Icon
            type="chevron-right"
            size="sm"
            className={`transition-transform duration-(--dur-instant) ${expanded ? 'rotate-90' : ''}`}
          />
        </IconButton>
      </div>
    </ListRow>
  );
};

const RefusedState: React.FC = () => (
  <EmptyState
    icon="shield"
    title="Policies are not readable by this admin role"
    description="Okta refused the read. An admin role with policy read access can list app authentication policies; this one cannot, so the panel has nothing to show."
    actions={[{ label: 'Check again', onClick: noop, variant: 'secondary' }]}
  />
);

const CountedPolicies: React.FC<{ total: number }> = ({ total }) => {
  const { value } = useCountUp(total);
  return <ListCountRow shown={value} of={value} />;
};

const SHOW: ShowSpec = {
  stageLabel: 'Policies',
  minHeight: 560,
  beats: [
    {
      caption: 'Every app authentication policy in your org, in the order Okta reads them.',
      hold: 4,
    },
    { caption: 'Open Any two factors and its three rules appear, top one tried first.', hold: 5 },
    {
      caption:
        'When your role cannot read policies, the tab says Okta refused, not that the org is empty.',
    },
  ],
  render: (beat) =>
    beat < 2 ? (
      <div key="list">
        <CountedPolicies total={policies.length} />
        <Assemble className={CARD_STACK}>
          {policies.map((fixture) => (
            <GuidePolicyCard
              key={fixture.policy.id}
              fixture={fixture}
              expanded={beat >= 1 && fixture.policy.id === twoFactors.policy.id}
              onToggle={noop}
              cascade
            />
          ))}
        </Assemble>
      </div>
    ) : (
      <Assemble key="refused">
        <RefusedState />
      </Assemble>
    ),
};

const PoliciesChapter: React.FC = () => {
  const [open, setOpen] = useState<string | null>(twoFactors.policy.id);
  const toggle = (policyId: string) =>
    setOpen((current) => (current === policyId ? null : policyId));
  const list = useHotSpot();
  const refused = useHotSpot();

  return (
    <ChapterPage id="policies" show={SHOW}>
      <Scene
        title="Policy Cards"
        intro="An app authentication policy decides what a sign-in to an app has to pass, and its rules decide who gets which requirement. The Policies tab lists every one in your org and lets you open each to read its rules. It reads; it does not edit. Each policy is a card: its name, whether it is active, and the priority Okta reads it at. The line above the cards says how many loaded. Click a card to open its rules, and click it again to close them."
        legend={[
          {
            text: (
              <HotLine scene="list" n={1} {...list}>
                Any two factors is open, so you can read its three rules in the order Okta tries
                them. The first rule that matches a person wins, which leaves Catch-all Rule at the
                bottom taking whoever is left.
              </HotLine>
            ),
          },
          {
            text: (
              <HotLine scene="list" n={2} {...list}>
                Legacy VPN is switched off and keeps its place in the list with a grey Inactive
                badge, so a policy someone turned off is never mistaken for one that was deleted.
              </HotLine>
            ),
          },
          {
            text: (
              <HotLine scene="list" n={3} {...list}>
                Default Policy carries a System badge because Okta manages it, and the last priority
                because every app that names no other policy signs in under it.
              </HotLine>
            ),
          },
        ]}
        outro="A rule row shows its priority, its name, and whether it is on. What the rule checks and what it then demands (the device, the factors, how long the session lasts) is not on the card yet. That is what a deeper Policies tab would add, if it is built."
        minHeight={320}
      >
        <div>
          <ListCountRow shown={policies.length} of={policies.length} />
          <div className={CARD_STACK}>
            {policies.map((fixture, index) => (
              <Marker key={fixture.policy.id} n={index + 1} align="top">
                <HotTarget scene="list" n={index + 1} lift {...list}>
                  <GuidePolicyCard
                    fixture={fixture}
                    expanded={open === fixture.policy.id}
                    onToggle={toggle}
                  />
                </HotTarget>
              </Marker>
            ))}
          </div>
        </div>
      </Scene>

      <Scene
        title="Refused Reads"
        intro="Reading policies takes an admin role that can read them. When yours cannot, the tab says so instead of showing you an empty list."
        legend={[
          {
            text: (
              <HotLine scene="refused" n={1} {...refused}>
                Okta answered the read with a refusal, so the panel reports that rather than
                claiming your org has no policies. Check again reruns the read, which is the only
                way to find out that your role has widened.
              </HotLine>
            ),
          },
        ]}
      >
        <Marker n={1}>
          <HotTarget scene="refused" n={1} {...refused}>
            <RefusedState />
          </HotTarget>
        </Marker>
      </Scene>
    </ChapterPage>
  );
};

export default PoliciesChapter;
