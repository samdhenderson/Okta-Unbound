import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RulesTab from './RulesTab';
import { ProgressProvider } from '../contexts/ProgressContext';
import type { FormattedRule } from '../../shared/types';

const captured = vi.hoisted(() => ({ impact: {} as Record<string, unknown> }));

vi.mock('./RuleCard', () => ({
  default: (props: {
    rule: FormattedRule;
    onOpenRule?: (rule: FormattedRule) => void;
    isHighlighted?: boolean;
  }) => (
    <div
      data-testid={`rule-${props.rule.id}`}
      data-highlighted={String(Boolean(props.isHighlighted))}
    >
      <span>{props.rule.name}</span>
      <button onClick={() => props.onOpenRule?.(props.rule)}>open {props.rule.id}</button>
    </div>
  ),
}));

vi.mock('./RuleImpactModal', () => ({
  default: (
    props: Record<string, unknown> & { isOpen: boolean; onConfirmDeactivate?: () => void },
  ) => {
    captured.impact = props;
    if (!props.isOpen) return null;
    return (
      <div data-testid="impact-modal" data-mode={String(props.mode)}>
        <span>{String(props.ruleName)}</span>
        <button onClick={() => props.onConfirmDeactivate?.()}>confirm-deactivate</button>
      </div>
    );
  },
}));

const rulesCacheGet = vi.fn();
vi.mock('../../shared/rulesCache', () => ({
  RulesCache: {
    get: (...args: unknown[]) => rulesCacheGet(...args),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

const loadTabState = vi.fn();
vi.mock('../../shared/tabState/tabStateManager', () => ({
  TabStateManager: {
    loadTabState: (...args: unknown[]) => loadTabState(...args),
    markTabVisited: vi.fn(),
    updateScrollPosition: vi.fn(),
  },
  saveRulesTabState: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../shared/undoManager', () => ({ logAction: vi.fn().mockResolvedValue(undefined) }));
vi.mock('../../shared/storage/auditStore', () => ({
  auditStore: { logOperation: vi.fn().mockResolvedValue(undefined) },
}));

const tabsSendMessage = vi.fn();
const runtimeSendMessage = vi.fn();

globalThis.chrome = {
  runtime: {
    sendMessage: runtimeSendMessage,
    getURL: (p: string) => p,
    onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
  },
  tabs: { sendMessage: tabsSendMessage },
  storage: {
    local: {
      get: vi.fn((_k: unknown, cb?: (r: unknown) => void) => {
        if (cb) cb({});
        return Promise.resolve({});
      }),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn(),
    },
  },
} as any;

function rule(over: Partial<FormattedRule> = {}): FormattedRule {
  return {
    id: 'r1',
    name: 'Engineering Rule',
    status: 'ACTIVE',
    condition: 'department == "Eng"',
    conditionExpression: 'user.department=="Eng"',
    groupIds: ['g1'],
    groupNames: ['Engineering'],
    userAttributes: ['department'],
    created: '2020-01-01T00:00:00.000Z',
    lastUpdated: '2024-01-01T00:00:00.000Z',
    affectsCurrentGroup: false,
    conflicts: [],
    ...over,
  };
}

const stats = { total: 2, active: 1, inactive: 1, conflicts: 0 };

function rawRule(over: Record<string, unknown> = {}) {
  return {
    id: 'r1',
    name: 'Engineering Rule',
    status: 'ACTIVE',
    conditions: { expression: { value: 'user.department=="Eng"' } },
    actions: { assignUserToGroups: { groupIds: ['g1'] } },
    created: '2020-01-01T00:00:00.000Z',
    lastUpdated: '2024-01-01T00:00:00.000Z',
    ...over,
  };
}

const DEFAULT_RAW_RULES = [
  rawRule(),
  rawRule({ id: 'r2', name: 'Sales Rule', status: 'INACTIVE' }),
];

const rulesFetchCalls = () =>
  runtimeSendMessage.mock.calls.filter((c) =>
    /^\/api\/v1\/groups\/rules/.test(String(c[0]?.endpoint)),
  );

function renderTab(props: Partial<React.ComponentProps<typeof RulesTab>> = {}) {
  return render(
    <ProgressProvider>
      <RulesTab targetTabId={1} {...props} />
    </ProgressProvider>,
  );
}

async function openMoreTier(): Promise<void> {
  const more = screen.queryByRole('button', { name: 'More' });
  if (more && more.getAttribute('aria-expanded') !== 'true') await userEvent.click(more);
}

async function openPanel(label: RegExp): Promise<void> {
  await openMoreTier();
  await userEvent.click(screen.getByRole('button', { name: label }));
}

async function openFilters(): Promise<void> {
  await userEvent.click(screen.getByRole('button', { name: /^Filters/ }));
}

async function openRuleRung(ruleId: string): Promise<void> {
  await userEvent.click(screen.getAllByRole('button', { name: 'Load Rules' })[0]);
  await waitFor(() => expect(screen.getByTestId(`rule-${ruleId}`)).toBeInTheDocument());
  await userEvent.click(screen.getByRole('button', { name: `open ${ruleId}` }));
  await screen.findByTestId('rule-action-bar');
}

let rulesFetchResponse: () => { success: boolean; data?: unknown[]; error?: string };

beforeEach(() => {
  vi.clearAllMocks();
  rulesCacheGet.mockResolvedValue(null);
  loadTabState.mockResolvedValue(null);
  rulesFetchResponse = () => ({ success: true, data: DEFAULT_RAW_RULES });

  runtimeSendMessage.mockImplementation(async (msg: { action?: string; endpoint?: string }) => {
    if (msg.action !== 'scheduleApiRequest') return { success: false };
    if (/^\/api\/v1\/groups\/rules/.test(String(msg.endpoint))) return rulesFetchResponse();
    return { success: true, data: [], headers: {} };
  });

  tabsSendMessage.mockResolvedValue({ success: true });
});

describe('RulesTab characterization', () => {
  it('shows the empty state until rules are loaded', () => {
    renderTab();
    expect(screen.getByText('No Rules Loaded')).toBeInTheDocument();
  });

  it('loads rules via the content script and renders stats + cards', async () => {
    renderTab();
    await userEvent.click(screen.getAllByRole('button', { name: 'Load Rules' })[0]);

    await waitFor(() => expect(screen.getByTestId('rule-r1')).toBeInTheDocument());
    expect(rulesFetchCalls()).toHaveLength(1);
    expect(runtimeSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'scheduleApiRequest',
        endpoint: '/api/v1/groups/rules?limit=200',
      }),
    );
    expect(screen.getByText('Engineering Rule')).toBeInTheDocument();
    expect(screen.getByText('Sales Rule')).toBeInTheDocument();

    await openPanel(/^Stats/);
    expect(
      within(screen.getByText('Total Rules').closest('div')!).getByText('2'),
    ).toBeInTheDocument();
    expect(within(screen.getByText('Active').closest('div')!).getByText('1')).toBeInTheDocument();
  });

  it('serves rules from the RulesCache without a content-script fetch', async () => {
    rulesCacheGet.mockResolvedValue({
      rules: [rule({ name: 'Cached Rule' })],
      stats,
      conflicts: [],
      timestamp: Date.now(),
    });
    renderTab();
    await userEvent.click(screen.getAllByRole('button', { name: 'Load Rules' })[0]);

    await waitFor(() => expect(screen.getByText('Cached Rule')).toBeInTheDocument());
    expect(rulesFetchCalls()).toHaveLength(0);
  });

  it('gates activation behind a confirm that states what cannot be undone', async () => {
    renderTab();
    await openRuleRung('r2');

    const activateEndpoint = '/api/v1/groups/rules/r2/lifecycle/activate';
    await openMoreTier();
    await userEvent.click(screen.getByRole('button', { name: 'Activate rule' }));

    expect(await screen.findByRole('dialog')).toHaveTextContent(/only ever adds members/);
    expect(runtimeSendMessage).not.toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: activateEndpoint }),
    );

    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Activate' }),
    );
    await waitFor(() =>
      expect(runtimeSendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'scheduleApiRequest',
          endpoint: activateEndpoint,
          method: 'POST',
        }),
      ),
    );
  });

  it('writes nothing when the activation confirm is cancelled', async () => {
    renderTab();
    await openRuleRung('r2');

    await openMoreTier();
    await userEvent.click(screen.getByRole('button', { name: 'Activate rule' }));
    await userEvent.click(
      within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancel' }),
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(runtimeSendMessage).not.toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: '/api/v1/groups/rules/r2/lifecycle/activate' }),
    );
  });

  it('gates deactivation behind the impact modal, committing only on confirm', async () => {
    renderTab();
    await openRuleRung('r1');

    await openMoreTier();
    await userEvent.click(screen.getByRole('button', { name: 'Deactivate rule' }));
    const modal = await screen.findByTestId('impact-modal');
    expect(modal).toHaveAttribute('data-mode', 'deactivate');
    const deactivateEndpoint = '/api/v1/groups/rules/r1/lifecycle/deactivate';
    expect(runtimeSendMessage).not.toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: deactivateEndpoint }),
    );

    await userEvent.click(screen.getByRole('button', { name: 'confirm-deactivate' }));
    await waitFor(() =>
      expect(runtimeSendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'scheduleApiRequest',
          endpoint: deactivateEndpoint,
          method: 'POST',
        }),
      ),
    );
  });

  it('opens the impact modal in preview mode (read-only)', async () => {
    renderTab();
    await openRuleRung('r1');

    await userEvent.click(screen.getByRole('button', { name: 'Preview impact' }));
    const modal = await screen.findByTestId('impact-modal');
    expect(modal).toHaveAttribute('data-mode', 'preview');
    expect(runtimeSendMessage).not.toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: '/api/v1/groups/rules/r1/lifecycle/deactivate' }),
    );
  });

  it('filters the list by search query', async () => {
    renderTab();
    await userEvent.click(screen.getAllByRole('button', { name: 'Load Rules' })[0]);
    await waitFor(() => expect(screen.getByTestId('rule-r1')).toBeInTheDocument());

    await userEvent.type(screen.getByPlaceholderText(/Search rules/i), 'Sales');
    await waitFor(() => expect(screen.queryByTestId('rule-r1')).not.toBeInTheDocument());
    expect(screen.getByTestId('rule-r2')).toBeInTheDocument();
  });

  it('filters the list to active rules only', async () => {
    renderTab();
    await userEvent.click(screen.getAllByRole('button', { name: 'Load Rules' })[0]);
    await waitFor(() => expect(screen.getByTestId('rule-r2')).toBeInTheDocument());

    await openFilters();
    await userEvent.click(screen.getByRole('button', { name: 'Active Only' }));
    expect(screen.getByTestId('rule-r1')).toBeInTheDocument();
    expect(screen.queryByTestId('rule-r2')).not.toBeInTheDocument();
  });

  it('surfaces a load failure in the error banner', async () => {
    rulesFetchResponse = () => ({ success: false, error: 'Okta said no' });
    renderTab();
    await userEvent.click(screen.getAllByRole('button', { name: 'Load Rules' })[0]);
    await waitFor(() => expect(screen.getByText('Okta said no')).toBeInTheDocument());
  });

  it('auto-loads rules when deep-linked to a rule with nothing loaded yet', async () => {
    renderTab({ selectedRuleId: 'r2' });

    await waitFor(() => expect(screen.getByTestId('rule-action-bar')).toBeInTheDocument());
    expect(rulesFetchCalls()).toHaveLength(1);
    expect(screen.getByLabelText('Actions for Sales Rule')).toBeInTheDocument();
  });

  it('opens a deep-linked rule that the persisted filter would have hidden', async () => {
    loadTabState.mockResolvedValue({
      cachedRules: [rule(), rule({ id: 'r2', name: 'Sales Rule', status: 'INACTIVE' })],
      cachedStats: stats,
      lastFetchTime: new Date('2024-01-01').toISOString(),
      activeFilter: 'active',
    });

    renderTab({ selectedRuleId: 'r2' });

    await waitFor(() =>
      expect(screen.getByLabelText('Actions for Sales Rule')).toBeInTheDocument(),
    );
    expect(rulesFetchCalls()).toHaveLength(0);
  });

  it('the duplicates panel "View" link opens the rule\'s rung', async () => {
    renderTab();
    await userEvent.click(screen.getAllByRole('button', { name: 'Load Rules' })[0]);
    await waitFor(() => expect(screen.getByTestId('rule-r1')).toBeInTheDocument());
    expect(screen.queryByTestId('rule-action-bar')).not.toBeInTheDocument();

    await openPanel(/^Duplicates/);
    await userEvent.click(screen.getByRole('button', { name: /rules → .* target group/ }));
    const bannerRow = screen
      .getAllByText('Engineering Rule')
      .map((el) => el.closest('li'))
      .find((li) => li !== null);
    expect(bannerRow).toBeTruthy();
    if (bannerRow) {
      await userEvent.click(within(bannerRow).getByRole('button', { name: 'View' }));
    }

    expect(await screen.findByLabelText('Actions for Engineering Rule')).toBeInTheDocument();
  });
});

describe('RulesTab current-group filter', () => {
  it('scopes to the current group for rules served from the org-wide cache', async () => {
    rulesCacheGet.mockResolvedValue({
      rules: [
        rule({
          id: 'r1',
          name: 'Feeds Current Group',
          groupIds: ['g1'],
          affectsCurrentGroup: false,
        }),
        rule({
          id: 'r2',
          name: 'Feeds Another Group',
          groupIds: ['g2'],
          affectsCurrentGroup: false,
        }),
      ],
      stats,
      conflicts: [],
      timestamp: Date.now(),
    });

    renderTab({ currentGroupId: 'g1' });
    await userEvent.click(screen.getAllByRole('button', { name: 'Load Rules' })[0]);
    await waitFor(() => expect(screen.getByTestId('rule-r1')).toBeInTheDocument());

    await openFilters();
    await userEvent.click(screen.getByRole('button', { name: 'Current Group' }));

    expect(screen.getByTestId('rule-r1')).toBeInTheDocument();
    expect(screen.queryByTestId('rule-r2')).not.toBeInTheDocument();
  });

  it('excludes a rule that does not target the current group, even if flagged', async () => {
    rulesCacheGet.mockResolvedValue({
      rules: [
        rule({ id: 'r1', name: 'Feeds Current Group', groupIds: ['g0', 'g1'] }),
        rule({
          id: 'r2',
          name: 'Stale Flag Rule',
          groupIds: ['g2'],
          affectsCurrentGroup: true,
        }),
      ],
      stats,
      conflicts: [],
      timestamp: Date.now(),
    });

    renderTab({ currentGroupId: 'g1' });
    await userEvent.click(screen.getAllByRole('button', { name: 'Load Rules' })[0]);
    await waitFor(() => expect(screen.getByTestId('rule-r2')).toBeInTheDocument());

    await openFilters();
    await userEvent.click(screen.getByRole('button', { name: 'Current Group' }));

    expect(screen.getByTestId('rule-r1')).toBeInTheDocument();
    expect(screen.queryByTestId('rule-r2')).not.toBeInTheDocument();
  });

  it('yields an empty list when the restored filter has no current group', async () => {
    loadTabState.mockResolvedValue({
      cachedRules: [
        rule({ id: 'r1', groupIds: ['g1'], affectsCurrentGroup: true }),
        rule({ id: 'r2', name: 'Sales Rule', groupIds: ['g2'] }),
      ],
      cachedStats: stats,
      lastFetchTime: new Date('2024-01-01').toISOString(),
      activeFilter: 'current-group',
    });

    renderTab();

    await waitFor(() => expect(screen.getByText('No Matching Rules')).toBeInTheDocument());
    expect(screen.queryByTestId('rule-r1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('rule-r2')).not.toBeInTheDocument();
    await openFilters();
    expect(screen.getByRole('button', { name: 'All Rules' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Current Group' })).not.toBeInTheDocument();
  });
});
