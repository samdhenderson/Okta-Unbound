import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const api = vi.hoisted(() => ({
  getAppById: vi.fn(async () => null as unknown),
  getAppAssignmentCounts: vi.fn(async () => null as unknown),
  isLoading: false,
}));

vi.mock('../hooks/useOktaApi', () => ({ useOktaApi: () => api }));
vi.mock('../../sidepanel/hooks/useOktaApi', () => ({ useOktaApi: () => api }));

import AppOverview from '../components/overview/AppOverview';
import AppListItem from '../components/apps/AppListItem';
import { resetEntityCache } from './entityCache';
import type { AppAssignmentCounts } from '../hooks/useOktaApi/appOperations';

const APP_ID = '0oaFAKE000000000001';
const COUNTS = { users: 1284, groups: 12 };

beforeEach(() => {
  vi.clearAllMocks();
  resetEntityCache();
  api.getAppById.mockResolvedValue({ id: APP_ID, label: 'Payroll', status: 'ACTIVE' });
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
  await userEvent.click(screen.getByRole('button', { name: 'Expand' }));
  return view;
}

const rowCountBadge = () =>
  screen.getAllByText((_content, el) => el?.textContent === '1,284 users' && el.tagName === 'SPAN');

describe('app assignment counts shared between the Overview and the Apps tab', () => {
  it('renders the row counts when the Overview populated the cache first', async () => {
    render(<AppOverview appId={APP_ID} appName="Payroll" targetTabId={1} onExport={vi.fn()} />);
    await screen.findByText('1,284');

    const { unmount } = await renderExpandedRow();
    await waitFor(() => expect(rowCountBadge().length).toBeGreaterThan(0));
    unmount();
  });

  it('renders the Overview counts when the Apps tab populated the cache first', async () => {
    const { unmount } = await renderExpandedRow();
    await waitFor(() => expect(rowCountBadge().length).toBeGreaterThan(0));
    unmount();

    render(<AppOverview appId={APP_ID} appName="Payroll" targetTabId={1} onExport={vi.fn()} />);
    expect(await screen.findByText('1,284')).toBeInTheDocument();
  });

  it('fetches the counts once across both consumers', async () => {
    render(<AppOverview appId={APP_ID} appName="Payroll" targetTabId={1} onExport={vi.fn()} />);
    await screen.findByText('1,284');
    const afterOverview = api.getAppAssignmentCounts.mock.calls.length;

    const { unmount } = await renderExpandedRow();
    await waitFor(() => expect(rowCountBadge().length).toBeGreaterThan(0));
    unmount();

    expect(api.getAppAssignmentCounts).toHaveBeenCalledTimes(afterOverview);
  });

  it('issues one GET /api/v1/apps/{id} per app overview', async () => {
    render(<AppOverview appId={APP_ID} appName="Payroll" targetTabId={1} onExport={vi.fn()} />);
    await screen.findByText('1,284');

    expect(api.getAppById).toHaveBeenCalledTimes(1);
  });
});
