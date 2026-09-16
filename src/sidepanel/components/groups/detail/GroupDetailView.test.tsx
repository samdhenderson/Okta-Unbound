import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroupDetailView from './GroupDetailView';
import { selectionStore } from '../../../selection/selectionStore';
import type { GroupSummary, OktaUser } from '../../../../shared/types';

const groupSource = vi.hoisted(() => ({
  open: vi.fn(),
  analyzeMembers: vi.fn(),
  resummarize: vi.fn(),
  group: null as { id: string } | null,
  feedingRules: [] as unknown[],
  rulesStatus: 'idle' as const,
  breakdown: null as unknown,
  memberStatus: 'idle' as const,
  error: null as string | null,
}));

vi.mock('../../../hooks/useGroupSource', () => ({
  useGroupSource: () => groupSource,
}));

vi.mock('../../../hooks/useGroupRuleReferences', () => ({
  useGroupRuleReferences: () => ({
    rules: [],
    status: 'idle',
    error: null,
  }),
}));

vi.mock('../../../hooks/useGroupAccessGrants', () => ({
  useGroupAccessGrants: () => ({
    apps: [],
    appsStatus: 'idle',
    appsError: null,
    roles: [],
    rolesStatus: 'available',
  }),
}));

const mfaScan = vi.hoisted(() => ({
  mfaResults: null as unknown,
  scanStatus: 'idle' as const,
  runScan: vi.fn(),
  requestConfirm: vi.fn(),
  cancelConfirm: vi.fn(),
}));

vi.mock('../../../hooks/useMemberMfaScan', () => ({
  useMemberMfaScan: () => mfaScan,
}));

const membersSectionState = vi.hoisted(() => ({
  members: null as unknown,
  removeTarget: null,
  requestRemove: vi.fn(),
  cancelRemove: vi.fn(),
  confirmRemove: vi.fn(),
  removeStatus: 'idle' as const,
  removeError: null as string | null,
  addQuery: '',
  setAddQuery: vi.fn(),
  addResults: [] as unknown[],
  isSearchingToAdd: false,
  addSearchError: null as string | null,
  selectToAdd: vi.fn(),
  addStatus: 'idle' as const,
  addError: null as string | null,
  onMemberAdded: vi.fn(),
}));

vi.mock('./useGroupMembersSection', () => ({
  useGroupMembersSection: () => membersSectionState,
}));

const addMember = vi.hoisted(() => ({
  isOpen: false,
  addQuery: '',
  setAddQuery: vi.fn(),
  addResults: [] as unknown[],
  isSearchingToAdd: false,
  addSearchError: null as string | null,
  selectedUser: null,
  selectUser: vi.fn(),
  clearSelectedUser: vi.fn(),
  isAddingMember: false,
  openModal: vi.fn(),
  closeModal: vi.fn(),
  confirmAddMember: vi.fn(),
  addMemberDirect: vi.fn(),
}));

vi.mock('../../../hooks/useAddGroupMember', () => ({
  useAddGroupMember: () => addMember,
}));

const createFeedingRule = vi.hoisted(() => ({
  isOpen: false,
  open: vi.fn(),
  close: vi.fn(),
  name: '',
  setName: vi.fn(),
  nameError: null as string | null,
  expression: '',
  setExpression: vi.fn(),
  expressionNotice: null as string | null,
  canSubmit: false,
  isCreating: false,
  error: null as string | null,
  createdRuleName: null as string | null,
  createdRuleId: null as string | null,
  confirm: vi.fn(),
}));

vi.mock('../../../hooks/useCreateFeedingRule', () => ({
  useCreateFeedingRule: () => createFeedingRule,
}));

vi.mock('./GroupOverviewPane', () => ({
  default: () => <div data-testid="stub-overview" />,
}));
vi.mock('./GroupMembersSection', () => ({
  default: ({ cohort }: { cohort?: { filters: { filters: { label: string }[] } } }) => (
    <div data-testid="stub-members">
      {(cohort?.filters.filters ?? []).map((filter) => `filtered by ${filter.label}`).join(', ')}
    </div>
  ),
}));
vi.mock('./GroupAccessSection', () => ({
  default: () => <div data-testid="stub-access" />,
}));
vi.mock('./GroupRulesSection', () => ({
  default: () => <div data-testid="stub-rules" />,
}));
vi.mock('./GroupPushSection', () => ({
  default: () => <div data-testid="stub-push" />,
}));
vi.mock('./GroupInsightsPane', () => ({
  default: ({
    onFilterMembers,
  }: {
    onFilterMembers?: (f: { dimension: string; value: string; label: string }) => void;
  }) => (
    <div data-testid="stub-insights">
      <button
        type="button"
        onClick={() =>
          onFilterMembers?.({ dimension: 'department', value: '', label: 'department is blank' })
        }
      >
        Filter Members
      </button>
    </div>
  ),
}));
vi.mock('../../selection/run/VerbRunner', () => ({
  default: ({
    run,
    basket,
  }: {
    run: { verb: { id: string } | null };
    basket: { picked: { id: string }[] };
  }) =>
    run.verb ? (
      <div data-testid="stub-runner" data-verb={run.verb.id}>
        {basket.picked.map((ref) => ref.id).join(',')}
      </div>
    ) : null,
}));

vi.mock('./AddGroupMemberModal', () => ({
  default: () => <div data-testid="stub-add-modal" />,
}));
vi.mock('./CreateFeedingRuleModal', () => ({
  default: () => <div data-testid="stub-create-rule-modal" />,
}));

function makeGroup(over: Partial<GroupSummary> = {}): GroupSummary {
  return {
    id: '00gFAKEgroup00001',
    name: 'Engineering',
    description: 'Eng team',
    type: 'OKTA_GROUP',
    memberCount: 10,
    hasRules: false,
    ruleCount: 0,
    ...over,
  };
}

describe('GroupDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    groupSource.group = null;
    groupSource.memberStatus = 'idle';
    membersSectionState.members = null;
    selectionStore.clearAll();
  });

  it('defaults to the Overview tab, rendering the overview pane and hiding every other pane', () => {
    render(<GroupDetailView group={makeGroup()} targetTabId={1} />);

    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('stub-overview')).toBeInTheDocument();
    expect(screen.queryByTestId('stub-members')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-access')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-push')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-rules')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-insights')).not.toBeInTheDocument();
  });

  it('carries an Insights row click to the Members pane with its filter applied', async () => {
    const user = userEvent.setup();
    render(<GroupDetailView group={makeGroup()} targetTabId={1} />);

    await user.click(screen.getByRole('tab', { name: 'Insights' }));
    await user.click(screen.getByRole('button', { name: 'Filter Members' }));

    expect(screen.getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('stub-members')).toHaveTextContent('filtered by department is blank');
    expect(screen.queryByTestId('stub-insights')).not.toBeInTheDocument();
  });

  it('switches to the Members tab, rendering its one section and unmounting Overview', async () => {
    const user = userEvent.setup();
    render(<GroupDetailView group={makeGroup()} targetTabId={1} />);

    await user.click(screen.getByRole('tab', { name: 'Members' }));

    expect(screen.getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('stub-members')).toBeInTheDocument();
    expect(screen.queryByTestId('stub-overview')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-access')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-push')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-rules')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-insights')).not.toBeInTheDocument();
  });

  it('switches to the Access tab, rendering Access + Push and unmounting Overview/Members', async () => {
    const user = userEvent.setup();
    render(<GroupDetailView group={makeGroup()} targetTabId={1} />);

    await user.click(screen.getByRole('tab', { name: 'Access' }));

    expect(screen.getByRole('tab', { name: 'Access' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('stub-access')).toBeInTheDocument();
    expect(screen.getByTestId('stub-push')).toBeInTheDocument();
    expect(screen.queryByTestId('stub-overview')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-members')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-rules')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-insights')).not.toBeInTheDocument();
  });

  it('switches to the Rules tab, rendering Rules and unmounting everything else', async () => {
    const user = userEvent.setup();
    render(<GroupDetailView group={makeGroup()} targetTabId={1} />);

    await user.click(screen.getByRole('tab', { name: 'Rules' }));

    expect(screen.getByRole('tab', { name: 'Rules' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('stub-rules')).toBeInTheDocument();
    expect(screen.queryByTestId('stub-overview')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-members')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-access')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-push')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-insights')).not.toBeInTheDocument();
  });

  it('switches to the Insights tab, rendering GroupInsightsPane and unmounting everything else', async () => {
    const user = userEvent.setup();
    render(<GroupDetailView group={makeGroup()} targetTabId={1} />);

    await user.click(screen.getByRole('tab', { name: 'Insights' }));

    expect(screen.getByRole('tab', { name: 'Insights' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('stub-insights')).toBeInTheDocument();
    expect(screen.queryByTestId('stub-overview')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-members')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-access')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-push')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-rules')).not.toBeInTheDocument();
  });

  it('exposes exactly the five tabs, in order', () => {
    render(<GroupDetailView group={makeGroup()} targetTabId={1} />);
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Overview',
      'Members',
      'Access',
      'Rules',
      'Insights',
    ]);
  });

  it('omits Export members from the action bar when onExportGroup is not provided', () => {
    render(<GroupDetailView group={makeGroup()} targetTabId={1} />);
    expect(screen.queryByRole('button', { name: /export members/i })).not.toBeInTheDocument();
  });

  it('shows Export members and wires it to onExportGroup when provided', async () => {
    const user = userEvent.setup();
    const onExportGroup = vi.fn();
    const group = makeGroup();
    render(<GroupDetailView group={group} targetTabId={1} onExportGroup={onExportGroup} />);

    await user.click(screen.getByRole('button', { name: /export members/i }));
    expect(onExportGroup).toHaveBeenCalledWith(group.id, group.name);
  });

  it('keeps Export members in the disclosure tier, not the action row', () => {
    render(<GroupDetailView group={makeGroup()} targetTabId={1} onExportGroup={vi.fn()} />);

    const more = screen.getByRole('button', { name: /More/ });
    const tierId = more.getAttribute('aria-controls');
    const tier = tierId ? document.getElementById(tierId) : null;
    if (!tier) throw new Error('the More control names no region');

    expect(within(tier).getByRole('button', { name: /export members/i })).toBeInTheDocument();
    expect(within(tier).queryByRole('button', { name: 'Add' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it("wires the action bar's Add button to the Add-member modal", async () => {
    const user = userEvent.setup();
    render(<GroupDetailView group={makeGroup()} targetTabId={1} />);

    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(addMember.openModal).toHaveBeenCalledTimes(1);
  });

  it('keeps Create feeding rule in the disclosure tier, not the action row', () => {
    render(<GroupDetailView group={makeGroup()} targetTabId={1} />);

    const more = screen.getByRole('button', { name: /More/ });
    expect(more).toHaveAttribute('aria-expanded', 'false');

    const tierId = more.getAttribute('aria-controls');
    const tier = tierId ? document.getElementById(tierId) : null;
    if (!tier) throw new Error('the More control names no region');

    expect(within(tier).getByRole('button', { name: 'Create feeding rule' })).toBeInTheDocument();
    expect(
      within(tier).getByText(/Memberships a rule grants outlive the rule/),
    ).toBeInTheDocument();
  });

  it("wires the tier's Create feeding rule to the confirm dialog", async () => {
    const user = userEvent.setup();
    render(<GroupDetailView group={makeGroup()} targetTabId={1} />);

    await user.click(screen.getByRole('button', { name: 'Create feeding rule' }));
    expect(createFeedingRule.open).toHaveBeenCalledTimes(1);
  });

  it("wires the action bar's Compare button to the group picker", async () => {
    const user = userEvent.setup();
    render(<GroupDetailView group={makeGroup()} targetTabId={1} />);

    expect(screen.queryByRole('dialog', { name: /Compare with another group/ })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Compare' }));

    const picker = screen.getByRole('dialog', { name: /Compare with another group/ });
    expect(picker).toBeInTheDocument();
    expect(within(picker).getByRole('button', { name: 'Compare' })).toBeDisabled();
  });

  it("fires the gated member-source analysis exactly once when initialPane is 'members' and the open has landed", () => {
    const group = makeGroup();
    groupSource.group = { id: group.id };

    const { rerender } = render(
      <GroupDetailView group={group} targetTabId={1} initialPane="members" isActive />,
    );
    expect(groupSource.analyzeMembers).toHaveBeenCalledTimes(1);

    rerender(
      <GroupDetailView group={group} targetTabId={1} initialPane="members" isActive={false} />,
    );
    rerender(<GroupDetailView group={group} targetTabId={1} initialPane="members" isActive />);
    expect(groupSource.analyzeMembers).toHaveBeenCalledTimes(1);

    expect(screen.getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'true');
  });

  it('auto-analyzes a plain drill-in (initialPane unset) when the group is within the auto-load budget, and still lands on Overview', () => {
    const group = makeGroup(); // memberCount: 10 — well under AUTO_LOAD_MEMBER_CAP
    groupSource.group = { id: group.id };
    render(<GroupDetailView group={group} targetTabId={1} />);
    expect(groupSource.analyzeMembers).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
  });

  it('never auto-analyzes a plain drill-in on a group over the auto-load budget, and lands on Overview', () => {
    const group = makeGroup({ memberCount: 5000 });
    groupSource.group = { id: group.id };
    render(<GroupDetailView group={group} targetTabId={1} />);
    expect(groupSource.analyzeMembers).not.toHaveBeenCalled();
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
  });

  describe('the filtered-cohort profile verb', () => {
    function roster(n: number): OktaUser[] {
      return Array.from({ length: n }, (_, i) => ({
        id: `00uFAKE000000000${i}`,
        status: 'ACTIVE' as const,
        profile: {
          firstName: 'Ada',
          lastName: `Lovelace ${i}`,
          email: `member${i}@example.com`,
          login: `member${i}@example.com`,
        },
      }));
    }

    async function openTier(): Promise<HTMLElement> {
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /More/ }));
      const tierId = screen.getByRole('button', { name: /More/ }).getAttribute('aria-controls');
      const tier = tierId ? document.getElementById(tierId) : null;
      if (!tier) throw new Error('the More control names no region');
      return tier;
    }

    async function renderOnMembers(members: OktaUser[] | null): Promise<void> {
      const user = userEvent.setup();
      membersSectionState.members = members;
      render(<GroupDetailView group={makeGroup()} targetTabId={1} initialPane="members" />);
      await user.click(screen.getByRole('tab', { name: 'Members' }));
    }

    it('offers the verb behind More, naming the measured count', async () => {
      await renderOnMembers(roster(3));

      const tier = await openTier();
      expect(
        within(tier).getByRole('button', { name: 'Set attribute on 3 members' }),
      ).toBeInTheDocument();
      expect(within(tier).getByText(/not on the\s+selected users/)).toBeInTheDocument();
      expect(within(tier).getByText(/recorded for up to\s+100/)).toBeInTheDocument();
    });

    it('says one member, not 1 members', async () => {
      await renderOnMembers(roster(1));

      const tier = await openTier();
      expect(
        within(tier).getByRole('button', { name: 'Set attribute on 1 member' }),
      ).toBeInTheDocument();
    });

    it('is absent while another pane is on screen, not offered against an unseen filter', async () => {
      membersSectionState.members = roster(3);
      render(<GroupDetailView group={makeGroup()} targetTabId={1} />);

      const tier = await openTier();
      expect(within(tier).queryByRole('button', { name: /Set attribute/ })).not.toBeInTheDocument();
      expect(within(tier).queryByText(/not on the\s+selected users/)).not.toBeInTheDocument();
    });

    it('is absent before the gated roster read has landed', async () => {
      await renderOnMembers(null);

      const tier = await openTier();
      expect(within(tier).queryByRole('button', { name: /Set attribute/ })).not.toBeInTheDocument();
    });

    it('is absent with no Okta tab connected, rather than greyed', async () => {
      const user = userEvent.setup();
      membersSectionState.members = roster(3);
      render(<GroupDetailView group={makeGroup()} targetTabId={null} initialPane="members" />);
      await user.click(screen.getByRole('tab', { name: 'Members' }));

      const tier = await openTier();
      expect(within(tier).queryByRole('button', { name: /Set attribute/ })).not.toBeInTheDocument();
    });

    it('starts the bulk profile verb over exactly the cohort on screen', async () => {
      const user = userEvent.setup();
      await renderOnMembers(roster(3));

      const tier = await openTier();
      await user.click(within(tier).getByRole('button', { name: /Set attribute/ }));

      const runner = screen.getByTestId('stub-runner');
      expect(runner).toHaveAttribute('data-verb', 'bulk-update-user-profile');
      expect(runner).toHaveTextContent('00uFAKE0000000000,00uFAKE0000000001,00uFAKE0000000002');
    });

    it("leaves the reader's own basket untouched", async () => {
      const user = userEvent.setup();
      selectionStore.toggle({ kind: 'group', id: '00gFAKE0000000001', name: 'Marketing' });
      await renderOnMembers(roster(3));

      const tier = await openTier();
      await user.click(within(tier).getByRole('button', { name: /Set attribute/ }));

      expect(selectionStore.getSnapshot().picked).toEqual([
        expect.objectContaining({ kind: 'group', id: '00gFAKE0000000001' }),
      ]);
    });
  });
});
