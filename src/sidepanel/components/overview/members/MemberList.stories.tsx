import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { MemberMfaResult } from '../../../../shared/types';
import MemberList from './MemberList';
import { mockUsers } from '../../../../test/mocks/handlers';

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
  title: 'Overview/Members/MemberList',
  component: MemberList,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    members: mockUsers.slice(0, 20),
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
