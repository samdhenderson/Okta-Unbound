import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import HomeTab from './HomeTab';
import { NavigationProvider } from '../contexts/NavigationContext';
import { OrgEntityIndexProvider } from '../contexts/OrgEntityIndexContext';
import { useOktaApi, makeUseOktaApiValue } from '../../../.storybook/mocks/useOktaApi.mock';
import {
  resetSyncSnapshotResponder,
  resetStorageSeed,
  setStorageSeed,
  setSyncSnapshotResponder,
} from '../../../.storybook/mocks/chrome';
import { orgSnapshotStore } from '../../shared/snapshot/orgSnapshotStore';
import { WORKING_SET_STORAGE_KEY } from '../../shared/storage/workingSetStore';
import type { RawOktaGroup } from './groups/groupSummary';
import type { OktaAppListItem } from '../../shared/schemas/okta';
import type { OktaGroupRule } from '../../shared/types';

const ORIGIN = 'https://example.okta.com';

const ENG_ID = '00gFAKE0000000000001';
const ADA_ID = '00uFAKE0000000000001';

const sampleGroups = [
  {
    id: ENG_ID,
    type: 'OKTA_GROUP',
    profile: { name: 'Engineering', description: 'All engineers' },
  },
  {
    id: '00gFAKE0000000000002',
    type: 'OKTA_GROUP',
    profile: { name: 'Engineering — On-call' },
  },
] as RawOktaGroup[];

const sampleRules = [
  {
    id: '0prFAKE0000000000001',
    name: 'Eng — All ICs',
    status: 'INACTIVE',
    type: 'group_rule',
    created: '2026-01-04T09:00:00.000Z',
    lastUpdated: '2026-05-11T09:00:00.000Z',
  },
] as OktaGroupRule[];

const sampleApps = [
  { id: '0oaFAKE0000000000001', name: 'salesforce', label: 'Salesforce', status: 'ACTIVE' },
] as OktaAppListItem[];

async function seedSnapshot({ complete = true }: { complete?: boolean } = {}): Promise<void> {
  await orgSnapshotStore.clearOrigin(ORIGIN);
  await orgSnapshotStore.upsertMany(
    'groups',
    ORIGIN,
    sampleGroups.map((entity) => ({ id: entity.id, entity })),
    Date.now(),
  );
  await orgSnapshotStore.upsertMany(
    'rules',
    ORIGIN,
    sampleRules.map((entity) => ({ id: entity.id, entity })),
    Date.now(),
  );
  await orgSnapshotStore.patchMeta('groups', ORIGIN, {
    complete,
    lastFullWalkAt: complete ? Date.now() : null,
    itemCount: sampleGroups.length,
  });
  await orgSnapshotStore.upsertMany(
    'apps',
    ORIGIN,
    sampleApps.map((entity) => ({ id: entity.id, entity })),
    Date.now(),
  );
  await orgSnapshotStore.patchMeta('rules', ORIGIN, {
    complete,
    lastFullWalkAt: complete ? Date.now() : null,
    itemCount: sampleRules.length,
  });
  await orgSnapshotStore.patchMeta('apps', ORIGIN, {
    complete: true,
    lastFullWalkAt: Date.now(),
    itemCount: sampleApps.length,
  });
}

function makeOps() {
  return {
    searchGroups: fn(async (query: string) =>
      query.toLowerCase().startsWith('eng')
        ? [{ id: ENG_ID, name: 'Engineering', description: 'All engineers' }]
        : [],
    ).mockName('searchGroups'),
    searchUsers: fn(async () => [
      {
        id: ADA_ID,
        firstName: 'Ada',
        lastName: 'Lovelace',
        login: 'ada@example.com',
        email: 'ada@example.com',
      },
    ]).mockName('searchUsers'),
    getGroupById: fn(async (id: string) => ({
      id,
      name: 'Engineering',
      description: 'All engineers',
    })).mockName('getGroupById'),
    getUserById: fn(async (id: string) => ({
      id,
      firstName: 'Ada',
      lastName: 'Lovelace',
      login: 'ada@example.com',
      email: 'ada@example.com',
    })).mockName('getUserById'),
  };
}

let ops = makeOps();

let syncRequests = 0;

const field = (canvasElement: HTMLElement) =>
  within(canvasElement).getByLabelText('Search groups, apps, users, rules');

const meta = {
  title: 'Home/HomeTab',
  component: HomeTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
    docs: {
      description: {
        component:
          'The side panel’s first tab. The reader says what they want, and every fact ' +
          'either arrives free, arrives in one list request, or is a button. Home has no ' +
          '`PageHeader` — one could only say "Home" — so the jump bar is the first thing in ' +
          'the scroller.\n\n' +
          'The stories below are about that cost rule, which is the part a screenshot cannot ' +
          'show: each asserts the number of Okta requests its interaction spends. An id ' +
          'already in the local org snapshot resolves at zero, a user id costs one because ' +
          'user records are deliberately kept out of local storage, and an incomplete ' +
          'snapshot spends one rather than reporting an absence it cannot support.',
      },
    },
  },
  decorators: [
    (Story, { args }) => (
      <NavigationProvider handlers={{ group: fn(), user: fn() }}>
        <OrgEntityIndexProvider
          oktaOrigin={args.oktaOrigin ?? null}
          targetTabId={args.targetTabId}
          enabled={args.isActive}
        >
          <Story />
        </OrgEntityIndexProvider>
      </NavigationProvider>
    ),
  ],
  argTypes: {
    isActive: {
      description: 'Whether Home is the tab on screen. A hidden Home issues no traffic.',
    },
    targetTabId: { description: 'Chrome tab id of the connected Okta tab.' },
    oktaOrigin: { description: 'Okta org origin — scopes the snapshot and builds deep links.' },
  },
  args: {
    isActive: true,
    targetTabId: 1,
    oktaOrigin: ORIGIN,
    onOpenListView: fn(),
    onOpenTab: fn(),
    onScanGroupMfa: fn(),
  },
  beforeEach: async () => {
    resetSyncSnapshotResponder();
    resetStorageSeed();
    ops = makeOps();
    useOktaApi.mockReturnValue(makeUseOktaApiValue(ops));
    await seedSnapshot();
  },
} satisfies Meta<typeof HomeTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(field(canvasElement)).toHaveValue('');
    await expect(field(canvasElement)).toHaveAttribute(
      'placeholder',
      'Search groups, apps, users, rules, etc.',
    );
  },
};

export const IdResolvesWithoutARequest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(field(canvasElement), `${ENG_ID}{Enter}`);

    await expect(await canvas.findByText('Engineering')).toBeInTheDocument();
    await expect(canvas.getByText(/no request/)).toBeInTheDocument();
    await expect(ops.getGroupById).not.toHaveBeenCalled();
  },
};

export const UserIdCostsOneRequest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(field(canvasElement), `${ADA_ID}{Enter}`);

    await expect(await canvas.findByText('Ada Lovelace')).toBeInTheDocument();
    await expect(canvas.getByText(/1 request/)).toBeInTheDocument();
    await expect(ops.getUserById).toHaveBeenCalledTimes(1);
  },
};

export const AbsentIdCostsNothing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(field(canvasElement), '00gFAKE0000000000009{Enter}');

    await expect(await canvas.findByText('Nothing matched')).toBeInTheDocument();
    await expect(ops.getGroupById).not.toHaveBeenCalled();
  },
};

export const IncompleteSnapshotFallsThroughToOkta: Story = {
  beforeEach: async () => {
    await seedSnapshot({ complete: false });
  },
  play: async ({ canvasElement }) => {
    await userEvent.type(field(canvasElement), '00gFAKE0000000000009{Enter}');
    await waitFor(() => expect(ops.getGroupById).toHaveBeenCalledTimes(1));
  },
};

export const NameSearch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(field(canvasElement), 'eng');

    await expect(await canvas.findByText('Engineering')).toBeInTheDocument();
    await expect(await canvas.findByText('Ada Lovelace')).toBeInTheDocument();
    await expect(ops.searchGroups).not.toHaveBeenCalledWith('e');
    await expect(ops.searchGroups).not.toHaveBeenCalledWith('en');
  },
};

export const IdTypedNotYetSubmitted: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.type(field(canvasElement), ENG_ID);

    await expect(ops.searchGroups).not.toHaveBeenCalled();
    await expect(ops.getGroupById).not.toHaveBeenCalled();
  },
};

export const Inactive: Story = {
  args: { isActive: false },
  play: async ({ canvasElement }) => {
    await userEvent.type(field(canvasElement), 'eng');
    await expect(ops.searchGroups).not.toHaveBeenCalled();
  },
};

export const WithWorkingSet: Story = {
  beforeEach: async () => {
    setStorageSeed({
      [WORKING_SET_STORAGE_KEY]: {
        version: 1,
        origins: {
          [ORIGIN]: {
            pinned: [
              {
                kind: 'group',
                id: ENG_ID,
                name: 'Engineering',
                lastPane: 'Members',
                lastSeenAt: Date.now(),
              },
            ],
            recent: [
              {
                kind: 'user',
                id: ADA_ID,
                name: 'Ada Lovelace',
                lastPane: 'Profile',
                lastSeenAt: Date.now() - 86_400_000,
              },
            ],
          },
        },
      },
    });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Engineering')).toBeInTheDocument();
    await expect(await canvas.findByText('Ada Lovelace')).toBeInTheDocument();
    await expect(ops.getGroupById).not.toHaveBeenCalled();
    await expect(ops.getUserById).not.toHaveBeenCalled();
  },
};

export const ColdWorkingSet: Story = {
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText(/Nothing pinned yet/)).toBeInTheDocument();
  },
};

export const OrgFiguresAreFree: Story = {
  beforeEach: async () => {
    setSyncSnapshotResponder(async () => {
      syncRequests += 1;
      return { success: true };
    });
    syncRequests = 0;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole('button', {
        name: 'Groups with no members that no rule fills — 2',
      }),
    ).toBeInTheDocument();
    await expect(await canvas.findByRole('button', { name: '2 groups' })).toBeInTheDocument();
    await expect(await canvas.findByText('App access no rule maintains')).toBeInTheDocument();
    await waitFor(() => expect(syncRequests).toBe(0));
  },
};

export const CardStackCascades: Story = {
  play: async ({ canvasElement }) => {
    const stack = await within(canvasElement).findByTestId('home-card-stack');
    await waitFor(() => expect(stack).toHaveAttribute('data-stagger-reveal', 'on'));
  },
};
