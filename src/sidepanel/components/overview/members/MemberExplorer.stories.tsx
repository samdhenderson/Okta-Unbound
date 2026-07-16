import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { MemberMfaResult } from '../../../../shared/types';
import MemberExplorer from './MemberExplorer';
import { mockUsers } from '../../../../test/mocks/handlers';

const mfaResults = new Map<string, MemberMfaResult>(
  mockUsers.map((user, i) => [
    user.id,
    {
      userId: user.id,
      factors: [],
      enrolled: i % 4 !== 0,
      factorCount: i % 4 === 0 ? 0 : (i % 4) + 1,
      factorLabels: i % 4 === 0 ? [] : ['Okta Verify (Fastpass)'].concat(i % 4 >= 2 ? ['SMS'] : []),
    },
  ]),
);

const meta = {
  title: 'Overview/Members/MemberExplorer',
  component: MemberExplorer,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    members: mockUsers,
    mfaResults: null,
    scanStatus: 'idle',
    onRunScan: fn(),
    onRequestConfirm: fn(),
    onCancelConfirm: fn(),
    oktaOrigin: null,
  },
} satisfies Meta<typeof MemberExplorer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ConfirmingScan: Story = {
  args: { scanStatus: 'confirming' },
};

export const Scanning: Story = {
  args: { scanStatus: 'scanning' },
};

export const ScanComplete: Story = {
  args: { mfaResults, scanStatus: 'complete' },
};

export const EmptyGroup: Story = {
  args: { members: [] },
};
