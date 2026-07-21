import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { MemberMfaResult } from '../../../../shared/types';
import MfaScanButton from './MfaScanButton';

const mfaResults = new Map<string, MemberMfaResult>([
  ['u1', { userId: 'u1', factors: [], enrolled: true, factorCount: 2, factorLabels: [] }],
]);

const meta = {
  title: 'Overview/Members/MfaScanButton',
  component: MfaScanButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    mfaResults: null,
    scanStatus: 'idle',
    memberCount: 250,
    onScanClick: fn(),
  },
} satisfies Meta<typeof MfaScanButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotScanned: Story = {};

export const Scanning: Story = {
  args: { scanStatus: 'scanning' },
};

export const Scanned: Story = {
  args: { mfaResults, scanStatus: 'complete' },
};

export const EmptyGroup: Story = {
  args: { memberCount: 0 },
};
