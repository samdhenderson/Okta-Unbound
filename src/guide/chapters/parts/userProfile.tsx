import React, { useCallback, useId, useMemo, useState } from 'react';
import Scene from '../../shell/Scene';
import { Marker } from '../../shell/Callout';
import { Badge, Button, Eyebrow } from '../../../sidepanel/components/shared';
import RuleUserReport from '../../../sidepanel/components/qualification/RuleUserReport';
import UserProfileAttributeList from '../../../sidepanel/components/users/UserProfileAttributeList';
import UserProfilePaneHeader, {
  type ProfileEditControls,
} from '../../../sidepanel/components/users/UserProfilePaneHeader';
import ProfileSaveModal from '../../../sidepanel/components/users/ProfileSaveModal';
import UserActionBar from '../../../sidepanel/components/users/UserActionBar';
import { buildAttributeBlocks } from '../../../sidepanel/components/users/profileAttributeBlocks';
import type { AttributeDescriptor } from '../../../sidepanel/components/users/profileAttributes';
import type { ProfileRuleReads } from '../../../sidepanel/components/users/profileRuleReads';
import type { DraftChange } from '../../../sidepanel/components/users/profileDraft';
import type { AttributeEditCell } from '../../../sidepanel/hooks/useProfileEdit';
import type { LifecycleAction } from '../../../sidepanel/hooks/useUserLifecycleActions';
import { useReducedMotion } from '../../../sidepanel/hooks/useReducedMotion';
import type { ProfileDisplayConfig } from '../../../shared/storage/profileDisplayStore';
import type { BlastRadiusReport } from '../../../shared/membership/blastRadiusTypes';
import { assessRuleForUser } from '../../../shared/membership/qualification';
import type { RuleGroupContext } from '../../../shared/ruleEvaluator';
import type { MembershipRule, OktaUser } from '../../../shared/types';
import { DEMO_COMPARISON_PAIR, demoUsersById } from '../../../sidepanel/demo/users';
import { demoUserGroups, GROUP } from '../../../sidepanel/demo/memberships';
import { currentGroupsById } from '../../../sidepanel/demo/snapshot';
import { fakeId } from '../../../sidepanel/demo/org';

const amara: OktaUser = demoUsersById.get(DEMO_COMPARISON_PAIR.left)!;

const groupContext: RuleGroupContext = (demoUserGroups().get(amara.id) ?? []).map((id) => ({
  id,
  name: currentGroupsById().get(id)?.profile?.name ?? id,
}));

const groupNames = new Map<string, string>(groupContext.map((group) => [group.id, group.name]));

const resolveGroupName = (id: string) => groupNames.get(id);

const githubRule: MembershipRule = {
  id: '0prFAKE00000000000003',
  name: 'Engineering into GitHub (excludes contractors)',
  status: 'ACTIVE',
  conditionExpression: 'user.department == "Engineering" && user.employeeType != "CONTRACTOR"',
  groupIds: [fakeId('00g', GROUP.githubEngineering)],
};

const emeaContractorsRule: MembershipRule = {
  id: '0prFAKE00000000000005',
  name: 'EMEA contractors',
  status: 'ACTIVE',
  conditionExpression:
    'user.employeeType == "CONTRACTOR" && (user.countryCode == "GB" || user.countryCode == "DE" || user.countryCode == "IE")',
  groupIds: [fakeId('00g', GROUP.contractorsEmea)],
};

const subject = { user: amara, groupContext };
const qualifies = assessRuleForUser(githubRule, subject, groupNames);
const doesNotMatch = assessRuleForUser(emeaContractorsRule, subject, groupNames);

const attribute = (
  name: string,
  label: string,
  kind: AttributeDescriptor['kind'],
  value: string,
  mono = false,
): AttributeDescriptor => ({
  key: kind === 'system' ? name : `profile.${name}`,
  name,
  label,
  kind,
  value,
  raw: value,
  isEmpty: value === '',
  ...(mono ? { mono: true } : {}),
});

const attributesWith = (department: string): AttributeDescriptor[] => [
  attribute('login', 'Login', 'base', amara.profile.login),
  attribute('id', 'User ID', 'system', amara.id, true),
  attribute('department', 'Department', 'base', department),
  attribute('title', 'Title', 'base', 'Staff Engineer'),
  attribute('employeeType', 'Employee Type', 'base', 'FULL_TIME'),
];

const ruleReads: ProfileRuleReads = {
  department: ['Engineering by department', 'Engineering into GitHub', 'Datadog engineers'],
  employeeType: ['Engineering into GitHub', 'EMEA contractors', 'AMER contractors'],
};

const displayConfig: ProfileDisplayConfig = {
  layout: 'rows',
  showApiNames: false,
  showRuleChips: true,
  showEmpty: false,
  categories: [
    { key: 'identity', name: 'Identity' },
    { key: 'organization', name: 'Organization' },
  ],
  assign: {
    login: 'identity',
    id: 'identity',
    department: 'organization',
    title: 'organization',
    employeeType: 'organization',
  },
  attrOrder: ['login', 'id', 'department', 'title', 'employeeType'],
  hidden: {},
};

const blocksWith = (department: string) =>
  buildAttributeBlocks(attributesWith(department), displayConfig, ruleReads, {
    filter: '',
    onlyRuleRead: false,
  });

const ATTRIBUTE_COUNT = attributesWith('Engineering').length;
const RULE_READ_COUNT = attributesWith('Engineering').filter(
  (item) => ruleReads[item.name]?.length,
).length;

const notComputed: BlastRadiusReport = {
  status: 'not-computed',
  groups: [],
  rules: [],
  counts: { added: 0, removed: 0, notPredicted: 0, starts: 0, stops: 0, undetermined: 0 },
  cascades: [],
};

const noop = () => {};

const cellsFor = (
  draft: string,
  baseline: string,
  onDepartmentChange: (value: string) => void,
): Readonly<Record<string, AttributeEditCell>> => ({
  login: {
    name: 'login',
    editability: {
      editable: false,
      reason: 'account-mastered',
      explanation: 'Workday owns this attribute for this user, so Okta will not accept an edit.',
      source: 'Workday',
    },
    dirty: false,
  },
  department: {
    name: 'department',
    editability: { editable: true, control: 'text', required: false },
    draft,
    dirty: draft !== baseline,
    onChange: onDepartmentChange,
  },
  title: {
    name: 'title',
    editability: { editable: true, control: 'text', required: false },
    dirty: false,
    onChange: noop,
  },
  employeeType: {
    name: 'employeeType',
    editability: {
      editable: true,
      control: 'select',
      required: false,
      options: [
        { value: 'FULL_TIME', label: 'Full time' },
        { value: 'CONTRACTOR', label: 'Contractor' },
        { value: 'INTERN', label: 'Intern' },
      ],
    },
    dirty: false,
    onChange: noop,
  },
  id: {
    name: 'id',
    editability: {
      editable: false,
      reason: 'system',
      explanation: 'This is a system field, not a profile attribute, so it cannot be edited here.',
    },
    dirty: false,
  },
});

const EDITABLE_COUNT = Object.values(cellsFor('Engineering', 'Engineering', noop)).filter(
  (cell) => cell.editability.editable,
).length;

const DEPARTMENT_RULE_COUNT = ruleReads.department?.length ?? 0;

const CARD = 'rounded-md border border-neutral-200 bg-white';

const PANE_CARD = `${CARD} overflow-hidden`;

const RUNG = 'flex flex-col gap-(--sp-rung)';

const LINKED_FRAME =
  'rounded-md outline outline-2 outline-offset-2 outline-transparent transition-[outline-color] duration-(--dur-instant) ease-(--ease-standard) data-[hot=true]:outline-primary/40 ' +
  '[&+span]:transition-shadow [&+span]:duration-(--dur-instant) [&[data-hot=true]+span]:ring-4 [&[data-hot=true]+span]:ring-primary/25';

const LINKED_ROW =
  '-mx-2 -my-1 block rounded-md px-2 py-1 transition-colors duration-(--dur-instant) ease-(--ease-standard) data-[hot=true]:bg-primary-light/60';

function useLinked() {
  const [hot, setHot] = useState<number | null>(null);
  const bind = useCallback(
    (n: number) => ({
      'data-hot': hot === n ? 'true' : 'false',
      onPointerEnter: () => setHot(n),
      onPointerLeave: () => setHot((current) => (current === n ? null : current)),
      onFocusCapture: () => setHot(n),
      onBlurCapture: () => setHot((current) => (current === n ? null : current)),
    }),
    [hot],
  );
  return bind;
}

type Bind = ReturnType<typeof useLinked>;

const Linked: React.FC<{ n: number; bind: Bind; children: React.ReactNode }> = ({
  n,
  bind,
  children,
}) => (
  <div {...bind(n)} className={LINKED_FRAME}>
    {children}
  </div>
);

const Row: React.FC<{ n: number; bind: Bind; children: React.ReactNode }> = ({
  n,
  bind,
  children,
}) => (
  <span {...bind(n)} className={LINKED_ROW}>
    {children}
  </span>
);

const fieldCount = (count: number) => (count === 1 ? '1 field' : `${count} fields`);

const ProfileBlocks: React.FC<{
  department: string;
  cells?: Readonly<Record<string, AttributeEditCell>>;
}> = ({ department, cells }) => (
  <div>
    {blocksWith(department).map((block) => (
      <section
        key={block.key}
        aria-label={block.name}
        className="border-t border-neutral-200 p-(--sp-card) first:border-t-0"
      >
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <Eyebrow>{block.name}</Eyebrow>
          <Badge variant="neutral">{fieldCount(block.attributes.length)}</Badge>
        </div>
        <UserProfileAttributeList
          attributes={block.attributes}
          layout={displayConfig.layout}
          showApiNames={displayConfig.showApiNames}
          showRuleChips={displayConfig.showRuleChips}
          ruleReads={ruleReads}
          cells={cells}
        />
      </section>
    ))}
  </div>
);

const CheckedRule: React.FC<{
  rule: MembershipRule;
  verdict: ReturnType<typeof assessRuleForUser>;
  user: OktaUser;
  titled?: boolean;
  actions?: React.ReactNode;
  open?: boolean;
}> = ({ rule, verdict, user, titled = false, actions, open = true }) => {
  const headingId = useId();
  const title = `Against rule: ${rule.name}`;
  return (
    <section
      className={`${CARD} px-4 py-3`}
      aria-labelledby={titled ? headingId : undefined}
      aria-label={titled ? undefined : title}
    >
      <div className="flex items-start justify-between gap-3">
        {titled ? (
          <h4
            id={headingId}
            className="min-w-0 text-xs font-semibold uppercase tracking-wide text-neutral-600"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {title}
          </h4>
        ) : (
          <Eyebrow className="min-w-0">{title}</Eyebrow>
        )}
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div className="disclose mt-3" data-open={open ? 'true' : 'false'}>
        <div inert={!open || undefined}>
          <RuleUserReport
            verdict={verdict}
            user={user}
            groupContext={groupContext}
            resolveGroupName={resolveGroupName}
          />
        </div>
      </div>
    </section>
  );
};

const PokeableRule: React.FC<{
  rule: MembershipRule;
  verdict: ReturnType<typeof assessRuleForUser>;
}> = ({ rule, verdict }) => {
  const [open, setOpen] = useState(true);
  return (
    <CheckedRule
      rule={rule}
      verdict={verdict}
      user={amara}
      titled
      open={open}
      actions={
        <Button variant="ghost" size="sm" onClick={() => setOpen((value) => !value)}>
          {open ? 'Clear' : 'Check again'}
        </Button>
      }
    />
  );
};

export const CheckRulesScene: React.FC = () => {
  const checkLink = useLinked();
  return (
    <Scene
      title="Check Rules"
      intro="The Users tab also looks forward: would a rule pick this person up, and what happens to their access if you change their profile. Pick Check rule from the strip and choose a rule. The answer opens above her groups, with the evidence under it, because a group she is not in does not belong in the list of groups she is in. On the rung, Clear puts the answer away and you press Check rule to ask again. Here the same button does both, so you can try it without losing the frame."
      legend={[
        {
          text: (
            <Row n={1} bind={checkLink}>
              Qualifies: every clause holds against her profile and the rule is active. Under the
              verdict, each group the rule fills carries Member or Not a member, and she already
              holds this one.
            </Row>
          ),
        },
        {
          text: (
            <Row n={2} bind={checkLink}>
              Does not match: the ledger marks the clause that failed. Her employee type is
              FULL_TIME and this rule wants CONTRACTOR, so the three country clauses beside it never
              get a say.
            </Row>
          ),
        },
      ]}
      outro="Check membership asks the same question the other way round: pick a group, and the panel runs every rule that feeds it. If she is already in the group, or the group is owned by an app, it says that first."
    >
      <div className={RUNG}>
        <Marker n={1} align="top">
          <Linked n={1} bind={checkLink}>
            <PokeableRule rule={githubRule} verdict={qualifies} />
          </Linked>
        </Marker>
        <Marker n={2} align="top">
          <Linked n={2} bind={checkLink}>
            <PokeableRule rule={emeaContractorsRule} verdict={doesNotMatch} />
          </Linked>
        </Marker>
      </div>
    </Scene>
  );
};

export const ProfileEditsScene: React.FC = () => {
  const [saved, setSaved] = useState('Engineering');
  const [department, setDepartment] = useState('Engineering');
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [flash, setFlash] = useState(0);
  const reduced = useReducedMotion();
  const editLink = useLinked();

  const cells: Readonly<Record<string, AttributeEditCell>> = useMemo(
    () => cellsFor(department, saved, setDepartment),
    [department, saved],
  );

  const changes: DraftChange[] =
    department === saved
      ? []
      : [
          {
            name: 'department',
            label: 'Department',
            beforeDisplay: saved,
            afterDisplay: department,
            afterRaw: department,
            changesSignIn: false,
          },
        ];

  const confirm = () => {
    setSaved(department);
    setConfirming(false);
    setEditing(false);
    if (!reduced) setFlash((count) => count + 1);
  };

  const editControls: ProfileEditControls = {
    canEdit: true,
    isEditing: editing,
    changeCount: changes.length,
    hasInvalid: false,
    onBeginEdit: () => setEditing(true),
    onCancelEdit: () => {
      setDepartment(saved);
      setEditing(false);
    },
    onSave: () => setConfirming(true),
  };

  return (
    <Scene
      title="Profile Edits"
      stageLabel="Users, profile"
      intro={`Open the Profile pane and press Edit. ${EDITABLE_COUNT} of the ${ATTRIBUTE_COUNT} rows become fields, and the strip along the top starts counting the ones you moved. Type Sales over Engineering, then press Save.`}
      legend={[
        {
          text: (
            <Row n={1} bind={editLink}>
              The strip counts what is on screen and how much of it rules read. In edit mode it
              swaps Edit for the change count, Cancel and Save, and Save stays off until a value
              differs from the one Okta holds.
            </Row>
          ),
        },
        {
          text: (
            <Row n={2} bind={editLink}>
              Department carries a chip saying {DEPARTMENT_RULE_COUNT} rules read it, so this edit
              can move her group access. Login never becomes a field: Workday masters it for her,
              and the row names the owner rather than greying out in silence.
            </Row>
          ),
        },
      ]}
      outro="Save writes nothing on its own. The confirm quotes both values, calls the write live against Okta, and offers Analyze blast radius, which names the groups she would gain and lose before you decide. Confirming here settles the row and flashes the card; your org is untouched."
      minHeight={560}
    >
      <div className={`relative ${PANE_CARD}`}>
        {flash > 0 ? (
          <span
            key={flash}
            aria-hidden="true"
            data-testid="guide-save-flash"
            className="pointer-events-none absolute inset-0 animate-affirm-flash rounded-md border"
          />
        ) : null}
        <Marker n={1} align="top">
          <Linked n={1} bind={editLink}>
            <UserProfilePaneHeader
              shown={ATTRIBUTE_COUNT}
              total={ATTRIBUTE_COUNT}
              ruleReadCount={RULE_READ_COUNT}
              edit={editControls}
            />
          </Linked>
        </Marker>
        <Marker n={2} align="top">
          <Linked n={2} bind={editLink}>
            <ProfileBlocks department={saved} cells={editing ? cells : undefined} />
          </Linked>
        </Marker>
      </div>
      <ProfileSaveModal
        changes={confirming ? changes : null}
        userName={`${amara.profile.firstName} ${amara.profile.lastName}`}
        onCancel={() => setConfirming(false)}
        onConfirm={confirm}
        isSaving={false}
        report={notComputed}
        onAnalyze={noop}
        isAnalyzing={false}
        resolveGroupName={resolveGroupName}
        groupContext={groupContext}
      />
    </Scene>
  );
};

export const PasswordResetScene: React.FC = () => {
  const [tierOpen, setTierOpen] = useState(true);
  const [pendingAction, setPendingAction] = useState<LifecycleAction | null>(null);
  const accountLink = useLinked();
  return (
    <Scene
      title="Password Reset"
      stageLabel="Users, More"
      intro="The verbs that change the account itself sit behind More on the strip, apart from the everyday ones. Press Reset password and the confirm asks what should happen before it asks for a value."
      legend={[
        {
          text: (
            <Row n={1} bind={accountLink}>
              More opens one tier inside the strip, and the account verbs sit under Account state:
              Reset password, then Suspend user alone on its row with what it costs, Blocks sign-in
              until reversed, beside the button. The band says once that each one asks to confirm.
            </Row>
          ),
        },
      ]}
      outro="The reset confirm offers four operations, each with its consequence in one sentence: a reset link, a lasting password, a one-time password, or a value Okta generates. Pick one and the sentence changes with it, and so does the button you press. A generated value is shown to you once. Okta does not announce a password change to the person, so tell them yourself."
      minHeight={460}
    >
      <Marker n={1} align="top">
        <Linked n={1} bind={accountLink}>
          <UserActionBar
            user={amara}
            onCompare={noop}
            onAddToGroup={noop}
            onCheckRule={noop}
            onWhyNotMember={noop}
            isLoadingMemberships={false}
            tierOpen={tierOpen}
            onTierOpenChange={setTierOpen}
            isLifecycleLoading={false}
            pendingLifecycleAction={pendingAction}
            onRequestLifecycleAction={setPendingAction}
            onCancelLifecycleAction={() => setPendingAction(null)}
            onConfirmLifecycleAction={() => setPendingAction(null)}
            sticky={false}
          />
        </Linked>
      </Marker>
    </Scene>
  );
};
