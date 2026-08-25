import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const api = vi.hoisted(() => ({
  getAllGroupMembers: vi.fn(async () => [] as unknown[]),
  removeDeprovisioned: vi.fn(async () => {}),
  exportMembers: vi.fn(async () => {}),
  scanGroupMfa: vi.fn(async () => new Map()),
  isLoading: false,
}));

vi.mock('../../hooks/useOktaApi', () => ({
  useOktaApi: () => api,
}));

const progress = vi.hoisted(() => ({
  startProgress: vi.fn(),
  completeProgress: vi.fn(),
  updateProgress: vi.fn(),
  incrementApiCalls: vi.fn(),
  progress: { isLoading: false, current: 0, total: 0, message: '', apiCalls: 0 },
}));

vi.mock('../../contexts/ProgressContext', () => ({
  useProgress: () => progress,
}));

vi.mock('../members/MemberExplorer', () => ({
  default: () => <div data-testid="member-explorer" />,
}));

import GroupOverview from './GroupOverview';
import { resetEntityCache } from '../../cache/entityCache';

const baseProps = {
  groupId: 'g1',
  groupName: 'Group One',
  targetTabId: 1,
  onViewRules: () => {},
  onExportMembers: () => {},
};

beforeEach(() => {
  vi.clearAllMocks();
  resetEntityCache();
});

describe('GroupOverview member-load effect', () => {
  it('loads members exactly once on mount and does NOT loop across unrelated re-renders', async () => {
    const { rerender } = render(<GroupOverview {...baseProps} />);

    await waitFor(() => expect(api.getAllGroupMembers).toHaveBeenCalledTimes(1));
    expect(api.getAllGroupMembers).toHaveBeenCalledWith('g1');

    for (let i = 0; i < 5; i++) {
      rerender(<GroupOverview {...baseProps} oktaOrigin={`https://x${i}.okta.com`} />);
    }
    await new Promise((r) => setTimeout(r, 0));

    expect(api.getAllGroupMembers).toHaveBeenCalledTimes(1);
  });

  it('re-loads when groupId changes', async () => {
    const { rerender } = render(<GroupOverview {...baseProps} />);
    await waitFor(() => expect(api.getAllGroupMembers).toHaveBeenCalledWith('g1'));

    rerender(<GroupOverview {...baseProps} groupId="g2" />);
    await waitFor(() => expect(api.getAllGroupMembers).toHaveBeenCalledWith('g2'));

    expect(api.getAllGroupMembers).toHaveBeenCalledTimes(2);
  });
});

describe('GroupOverview member export', () => {
  it('deep-links "Export Members" to the Export tab instead of a bespoke modal', async () => {
    const onExportMembers = vi.fn();
    render(<GroupOverview {...baseProps} onExportMembers={onExportMembers} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Export Members' }));

    expect(onExportMembers).toHaveBeenCalledWith('g1', 'Group One');
    expect(screen.queryByText('Export Group Members')).not.toBeInTheDocument();
    expect(api.exportMembers).not.toHaveBeenCalled();
  });
});
