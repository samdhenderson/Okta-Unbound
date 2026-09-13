import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import UserRungHeader from './UserRungHeader';
import type { OktaUser } from '../../../shared/types';
import type { ViewStack, ViewStackCrumb } from '../../hooks/useViewStack';
import type { UsersViewEntry } from '../../hooks/useUsersTabState';

const user: OktaUser = {
  id: '00uFAKE00000000000001',
  status: 'ACTIVE',
  created: '2024-03-11T09:12:00.000Z',
  lastLogin: '2026-08-17T08:41:00.000Z',
  profile: {
    login: 'user@example.com',
    email: 'user@example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    department: 'Platform Engineering',
    title: 'Staff Engineer',
  },
};

const longNameUser: OktaUser = {
  ...user,
  id: '00uFAKE00000000000002',
  status: 'PROVISIONED',
  profile: {
    ...user.profile,
    firstName: 'Wilhelmina-Constance',
    lastName: 'Featherstonehaugh-Villanueva',
  },
};

const makeNav = (entries: UsersViewEntry[]): ViewStack<UsersViewEntry> => {
  const trail: ViewStackCrumb[] = [
    {
      key: 'root',
      label: 'User Search',
      depth: 0,
      isCurrent: entries.length === 0,
      ...(entries.length === 0 ? {} : { onSelect: fn() }),
    },
    ...entries.map((entry, index) => ({
      key: `${entry.kind}-${entry.userId}`,
      label: entry.kind === 'compare' ? 'Compare users' : entry.userName,
      depth: index + 1,
      isCurrent: index === entries.length - 1,
      ...(index === entries.length - 1 ? {} : { onSelect: fn() }),
    })),
  ];

  return {
    entries,
    currentEntry: entries[entries.length - 1],
    depth: entries.length,
    isRoot: entries.length === 0,
    trail,
    transition: null,
    push: fn(),
    pop: fn(),
    popTo: fn(),
    reset: fn(),
  };
};

const searchNav = makeNav([]);
const detailNav = makeNav([{ kind: 'detail', userId: user.id, userName: 'Ada Lovelace' }]);
const longNameNav = makeNav([
  {
    kind: 'detail',
    userId: longNameUser.id,
    userName: 'Wilhelmina-Constance Featherstonehaugh-Villanueva',
  },
]);
const compareNav = makeNav([
  { kind: 'detail', userId: user.id, userName: 'Ada Lovelace' },
  { kind: 'compare', userId: user.id, userName: 'Ada Lovelace' },
]);

const meta = {
  title: 'Users/UserRungHeader',
  component: UserRungHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'What the Users tab’s single `PageHeader` says on each rung of its view stack: **search** shows the stack’s root label, **detail** the user’s display name plus the `userIdentity` region, and **compare** `Compare users`, because the subject there is two users.\n\n' +
          'An unloaded count is absent, not `0` — `appCount: undefined` drops the metric entirely, and the group count does the same while memberships load. The header never falls back to the entity detected on the live Okta tab; that is `ContextBar`’s subject.',
      },
    },
  },
  decorators: [
    (Story: () => React.ReactElement) => (
      <div className="bg-canvas">
        <Story />
      </div>
    ),
  ],
  args: {
    nav: detailNav,
    isDetailOpen: true,
    isCompareOpen: false,
    selectedUser: user,
    membershipCount: 12,
    isLoadingMemberships: false,
    appCount: undefined,
    oktaOrigin: 'https://example.okta.com',
    isActive: true,
  },
  argTypes: {
    nav: { description: 'The tab’s sub-navigation stack: search → a user’s detail → comparison.' },
    isDetailOpen: { description: 'Whether a user’s detail page is the view on screen.' },
    isCompareOpen: { description: 'Whether a comparison is the view on screen.' },
    selectedUser: { description: 'The user the tab has loaded, or `null`.' },
    membershipCount: { description: 'How many groups that user is in.' },
    isLoadingMemberships: {
      description: 'True while memberships load — the group count is then omitted, not zeroed.',
    },
    appCount: {
      description:
        'How many apps the user has; `undefined` omits the metric rather than zeroing it.',
    },
    oktaOrigin: {
      description: 'Origin for the header’s "Open in Okta" link; it hides without one.',
    },
    isActive: {
      description:
        'Whether the Users tab is the visible one, so a hidden panel publishes no `--header-h`.',
    },
  },
} satisfies Meta<typeof UserRungHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SearchRung: Story = {
  args: {
    nav: searchNav,
    isDetailOpen: false,
    selectedUser: null,
    membershipCount: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'User Search' }),
    ).toBeInTheDocument();
  },
};

export const DetailWithoutAppsMetric: Story = {
  args: { appCount: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('12')).toBeInTheDocument();
    await expect(canvas.queryByText('apps')).toBeNull();
    await expect(canvas.queryByText('app')).toBeNull();
  },
};

export const DetailWithAppsMetric: Story = {
  args: { appCount: 7 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('apps')).toBeInTheDocument();
  },
};

export const DetailWithOneApp: Story = {
  args: { appCount: 1 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('app')).toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: { isLoadingMemberships: true, appCount: undefined },
};

export const LongDisplayName: Story = {
  args: { nav: longNameNav, selectedUser: longNameUser, membershipCount: 41, appCount: 23 },
};

export const CompareRung: Story = {
  args: { nav: compareNav, isCompareOpen: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Compare users' }),
    ).toBeInTheDocument();
  },
};

export const SnapshotNameOnly: Story = {
  args: { selectedUser: null },
};

export const WithoutOktaOrigin: Story = {
  args: { oktaOrigin: null, appCount: 7 },
};

export const Compact: Story = {
  args: { nav: longNameNav, selectedUser: longNameUser, membershipCount: 41, appCount: 23 },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};
