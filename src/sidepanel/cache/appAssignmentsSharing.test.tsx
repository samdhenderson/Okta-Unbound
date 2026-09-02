import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const api = vi.hoisted(() => ({
  getAppAssignmentCounts: vi.fn(async () => null as unknown),
  isLoading: false,
}));

vi.mock('../hooks/useOktaApi', () => ({ useOktaApi: () => api }));
vi.mock('../../sidepanel/hooks/useOktaApi', () => ({ useOktaApi: () => api }));

import AppListItem from '../components/apps/AppListItem';
import { peek, resetEntityCache } from './entityCache';
import { cacheKeys } from './keys';
import type { AppAssignmentCounts } from '../hooks/useOktaApi/appOperations';

const APP_ID = '0oaFAKE000000000001';
const COUNTS = { users: 1284, groups: 12 };

beforeEach(() => {
  vi.clearAllMocks();
  resetEntityCache();
  api.getAppAssignmentCounts.mockResolvedValue(COUNTS);
});

async function renderExpandedRow() {
  const view = render(
    <AppListItem
      app={{ id: APP_ID, label: 'Payroll', status: 'ACTIVE', signOnMode: 'SAML_2_0' }}
      fetchAssignmentCounts={
        api.getAppAssignmentCounts as unknown as (id: string) => Promise<AppAssignmentCounts | null>
      }
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Expand Payroll' }));
  return view;
}

const rowCountBadge = () =>
  screen.getAllByText((_content, el) => el?.textContent === '1,284 users' && el.tagName === 'SPAN');

describe('the shared app assignment-counts cache entry', () => {
  it('holds the counts themselves, not a wrapper around them', async () => {
    const { unmount } = await renderExpandedRow();
    await waitFor(() => expect(rowCountBadge().length).toBeGreaterThan(0));
    expect(peek(cacheKeys.appAssignmentCounts(APP_ID))).toEqual(COUNTS);
    unmount();
  });

  it('fetches once, then serves the entry warm', async () => {
    const first = await renderExpandedRow();
    await waitFor(() => expect(rowCountBadge().length).toBeGreaterThan(0));
    first.unmount();

    const second = await renderExpandedRow();
    await waitFor(() => expect(rowCountBadge().length).toBeGreaterThan(0));
    expect(api.getAppAssignmentCounts).toHaveBeenCalledTimes(1);
    second.unmount();
  });
});
