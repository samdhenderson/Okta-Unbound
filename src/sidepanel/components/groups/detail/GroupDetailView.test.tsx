import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroupDetailView from './GroupDetailView';
import type { GroupSummary } from '../../../../shared/types';

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

vi.mock('./GroupOverviewPane', () => ({
  default: () => <div data-testid="stub-overview" />,
}));
vi.mock('./GroupMembershipSourceSection', () => ({
  default: () => <div data-testid="stub-membership-source" />,
}));
vi.mock('./GroupMembersSection', () => ({
  default: () => <div data-testid="stub-members" />,
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
vi.mock('./GroupHealthPane', () => ({
  default: () => <div data-testid="stub-health" />,
}));
vi.mock('./AddGroupMemberModal', () => ({
  default: () => <div data-testid="stub-add-modal" />,
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
  });

  it('defaults to the Overview tab, rendering the overview pane and hiding every other pane', () => {
    render(<GroupDetailView group={makeGroup()} targetTabId={1} />);

    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('stub-overview')).toBeInTheDocument();
    expect(screen.queryByTestId('stub-membership-source')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-members')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-access')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-push')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-rules')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-health')).not.toBeInTheDocument();
  });

  it('switches to the Members tab, rendering its two sections and unmounting Overview', async () => {
    const user = userEvent.setup();
    render(<GroupDetailView group={makeGroup()} targetTabId={1} />);

    await user.click(screen.getByRole('tab', { name: 'Members' }));

    expect(screen.getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('stub-membership-source')).toBeInTheDocument();
    expect(screen.getByTestId('stub-members')).toBeInTheDocument();
    expect(screen.queryByTestId('stub-overview')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-access')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-push')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-rules')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-health')).not.toBeInTheDocument();
  });

  it('switches to the Access tab, rendering Access + Push and unmounting Overview/Members', async () => {
    const user = userEvent.setup();
    render(<GroupDetailView group={makeGroup()} targetTabId={1} />);

    await user.click(screen.getByRole('tab', { name: 'Access' }));

    expect(screen.getByRole('tab', { name: 'Access' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('stub-access')).toBeInTheDocument();
    expect(screen.getByTestId('stub-push')).toBeInTheDocument();
    expect(screen.queryByTestId('stub-overview')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-membership-source')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-members')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-rules')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-health')).not.toBeInTheDocument();
  });

  it('switches to the Rules tab, rendering Rules and unmounting everything else', async () => {
    const user = userEvent.setup();
    render(<GroupDetailView group={makeGroup()} targetTabId={1} />);

    await user.click(screen.getByRole('tab', { name: 'Rules' }));

    expect(screen.getByRole('tab', { name: 'Rules' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('stub-rules')).toBeInTheDocument();
    expect(screen.queryByTestId('stub-overview')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-membership-source')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-members')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-access')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-push')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-health')).not.toBeInTheDocument();
  });

  it('switches to the Health tab, rendering GroupHealthPane and unmounting everything else', async () => {
    const user = userEvent.setup();
    render(<GroupDetailView group={makeGroup()} targetTabId={1} />);

    await user.click(screen.getByRole('tab', { name: 'Health' }));

    expect(screen.getByRole('tab', { name: 'Health' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('stub-health')).toBeInTheDocument();
    expect(screen.queryByTestId('stub-overview')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stub-membership-source')).not.toBeInTheDocument();
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
      'Health',
    ]);
  });

  it('omits Export members from the action bar when onExportGroup is not provided (ADR-0039)', () => {
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

  it("wires the action bar's Add button to the Add-member modal", async () => {
    const user = userEvent.setup();
    render(<GroupDetailView group={makeGroup()} targetTabId={1} />);

    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(addMember.openModal).toHaveBeenCalledTimes(1);
  });

  it('fires the gated member-source analysis exactly once when autoAnalyze is set and the open has landed', () => {
    const group = makeGroup();
    groupSource.group = { id: group.id };

    const { rerender } = render(
      <GroupDetailView group={group} targetTabId={1} autoAnalyze isActive />,
    );
    expect(groupSource.analyzeMembers).toHaveBeenCalledTimes(1);

    rerender(<GroupDetailView group={group} targetTabId={1} autoAnalyze isActive={false} />);
    rerender(<GroupDetailView group={group} targetTabId={1} autoAnalyze isActive />);
    expect(groupSource.analyzeMembers).toHaveBeenCalledTimes(1);

    expect(screen.getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'true');
  });

  it('never auto-analyzes when autoAnalyze is unset (a plain drill-in), and lands on Overview', () => {
    const group = makeGroup();
    groupSource.group = { id: group.id };
    render(<GroupDetailView group={group} targetTabId={1} />);
    expect(groupSource.analyzeMembers).not.toHaveBeenCalled();
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
  });
});
