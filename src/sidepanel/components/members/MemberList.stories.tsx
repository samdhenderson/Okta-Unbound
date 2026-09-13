import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { MemberMfaResult } from '../../../shared/types';
import MemberList from './MemberList';
import { mockUsers } from '../../../test/mocks/fixtures';

const mfaResults = new Map<string, MemberMfaResult>(
  mockUsers.slice(0, 50).map((user, i) => [
    user.id,
    {
      userId: user.id,
      factors: [],
      enrolled: i % 3 !== 0,
      factorCount: i % 3 === 0 ? 0 : (i % 3) + 1,
      factorLabels:
        i % 3 === 0 ? [] : ['Okta Verify (Fastpass)'].concat(i % 3 === 2 ? ['SMS'] : []),
    },
  ]),
);

const meta = {
  title: 'Members/MemberList',
  component: MemberList,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Windowed, auto-paging scrollable list of member rows. Only the first `visibleCount` rows mount; the list grows via a "Load more" footer plus an IntersectionObserver sentinel, which caps DOM size for very large groups.\n\n' +
          'While `loading`, the rows are replaced by `Skeleton variant="row"` placeholders rather than a spinner, because the shape of what is coming is already known.',
      },
    },
  },
  argTypes: {
    members: { description: 'Members to display, already filtered and sorted by the caller.' },
    loading: {
      description:
        'True while the member set is being re-fetched; swaps the rows for skeleton placeholders.',
    },
    mfaResults: { description: 'Per-member MFA scan results, or null before a scan has run.' },
    mfaScanned: {
      description: 'True once a scan completed, so rows render "No MFA" for 0-factor users.',
    },
    visibleCount: { description: 'How many rows are currently mounted.' },
    onLoadMore: { description: 'Reveal the next page of rows.' },
    oktaOrigin: {
      description: 'Okta org origin for per-member Admin Console links (null when unknown).',
    },
    selectedIds: {
      description:
        'Which members are in the selection basket. May hold ids for people ticked elsewhere.',
    },
    onToggleSelect: {
      description: 'Tick or untick one member. Absent ⇒ no row renders a checkbox.',
    },
  },
  args: {
    members: mockUsers.slice(0, 20),
    loading: false,
    mfaResults: null,
    mfaScanned: false,
    visibleCount: 20,
    onLoadMore: fn(),
    oktaOrigin: null,
  },
} satisfies Meta<typeof MemberList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLoadMore: Story = {
  args: { members: mockUsers, visibleCount: 50 },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /^Load more/ }));
    await expect(args.onLoadMore).toHaveBeenCalled();
  },
};

export const WithMfaResults: Story = {
  args: {
    members: mockUsers.slice(0, 50),
    mfaResults,
    mfaScanned: true,
    visibleCount: 50,
  },
};

export const WithOktaOrigin: Story = {
  args: { oktaOrigin: 'https://example.okta.com' },
};

export const Empty: Story = {
  args: { members: [], visibleCount: 20 },
};

export const Reloading: Story = {
  args: { loading: true },
};

export const WithSelection: Story = {
  args: {
    onToggleSelect: fn(),
    selectedIds: new Set([mockUsers[0].id, mockUsers[2].id]),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const checked = canvas
      .getAllByRole('checkbox')
      .filter((box) => (box as HTMLInputElement).checked);
    await expect(checked).toHaveLength(2);

    await userEvent.click(checked[0]);
    await expect(args.onToggleSelect).toHaveBeenCalledWith(mockUsers[0].id);
  },
};
