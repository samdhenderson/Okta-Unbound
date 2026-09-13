import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import AppsTab from './AppsTab';
import { useOktaApi, makeUseOktaApiValue } from '../../../.storybook/mocks/useOktaApi.mock';
import {
  setSyncSnapshotResponder,
  resetSyncSnapshotResponder,
} from '../../../.storybook/mocks/chrome';
import { orgSnapshotStore } from '../../shared/snapshot/orgSnapshotStore';
import type { OktaAppListItem } from '../../shared/schemas/okta';

const ORIGIN = 'https://example.okta.com';

async function seedInventory(apps: OktaAppListItem[]): Promise<void> {
  await orgSnapshotStore.clearOrigin(ORIGIN);
  if (apps.length > 0) {
    await orgSnapshotStore.upsertMany(
      'apps',
      ORIGIN,
      apps.map((entity) => ({ id: entity.id, entity })),
      Date.now(),
    );
  }
  await orgSnapshotStore.patchMeta('apps', ORIGIN, {
    complete: true,
    lastFullWalkAt: Date.now(),
    itemCount: apps.length,
  });
}

const sampleApps = [
  {
    id: '0oaFAKE0001',
    name: 'salesforce',
    label: 'Salesforce',
    status: 'ACTIVE',
    signOnMode: 'SAML_2_0',
    created: '2026-01-15T09:00:00.000Z',
    lastUpdated: '2026-06-02T11:30:00.000Z',
  },
  {
    id: '0oaFAKE0002',
    name: 'workday',
    label: 'Workday HR',
    status: 'INACTIVE',
    signOnMode: 'SAML_2_0',
    created: '2026-03-01T09:00:00.000Z',
  },
  {
    id: '0oaFAKE0003',
    name: 'bookmark',
    label: 'Internal Wiki',
    status: 'ACTIVE',
    signOnMode: 'BOOKMARK',
    created: '2025-11-20T09:00:00.000Z',
  },
  {
    id: '0oaFAKE0004',
    name: 'okta_org2org',
    status: 'ACTIVE',
    signOnMode: 'SAML_2_0',
  },
] as OktaAppListItem[];

const meta = {
  title: 'Apps/AppsTab',
  component: AppsTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
    docs: {
      description: {
        component:
          "Applications tab shell: browse, search, filter and sort the org's application inventory. It is read-only by construction — the rows come from the background-owned org snapshot, and the tab reaches for the API only lazily, per expanded row. A failed load surfaces as a dismissible `danger` banner rather than an empty list presented as complete.",
      },
    },
  },
  argTypes: {
    targetTabId: {
      description:
        'Chrome tab id of the connected Okta tab; the inventory load is skipped when null.',
    },
    oktaOrigin: {
      description: 'Okta org origin used to build each row\'s "Open in Okta" deep link.',
    },
  },
  args: {
    targetTabId: 1,
    oktaOrigin: 'https://example.okta.com',
  },
  beforeEach: async () => {
    resetSyncSnapshotResponder();
    useOktaApi.mockReturnValue(
      makeUseOktaApiValue({
        getAppAssignmentCounts: fn(async () => ({ users: 128, groups: 4 })),
      }),
    );
    await seedInventory(sampleApps);
  },
} satisfies Meta<typeof AppsTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText('Salesforce')).toBeInTheDocument();
  },
};

export const Searching: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Salesforce');

    await userEvent.type(canvas.getByRole('searchbox', { name: 'Search applications' }), 'Workday');

    await expect(await canvas.findByText('Workday HR')).toBeInTheDocument();
    await expect(canvas.queryByText('Salesforce')).not.toBeInTheDocument();
  },
};

export const Loading: Story = {
  beforeEach: async () => {
    await seedInventory([]);
    setSyncSnapshotResponder(() => new Promise<unknown>(() => {}));
  },
};

export const Empty: Story = {
  beforeEach: async () => {
    await seedInventory([]);
  },
};

export const ErrorState: Story = {
  beforeEach: async () => {
    await seedInventory([]);
    setSyncSnapshotResponder(async () => ({ success: false, error: 'Failed to fetch apps' }));
  },
};

export const Disconnected: Story = {
  args: { targetTabId: null },
};

export const LargeInventory: Story = {
  beforeEach: async () => {
    await seedInventory(
      Array.from({ length: 60 }, (_, i) => ({
        id: `0oaFAKE${String(i).padStart(4, '0')}`,
        name: `sample_app_${i}`,
        label: `Sample App ${i + 1}`,
        status: i % 4 === 0 ? 'INACTIVE' : 'ACTIVE',
        signOnMode: i % 3 === 0 ? 'BOOKMARK' : 'SAML_2_0',
        created: '2026-02-01T09:00:00.000Z',
      })) as OktaAppListItem[],
    );
  },
};
