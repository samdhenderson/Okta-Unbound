import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { MemberMfaResult } from '../../../shared/types';
import MfaScanButton from './MfaScanButton';

const mfaResults = new Map<string, MemberMfaResult>([
  ['u1', { userId: 'u1', factors: [], enrolled: true, factorCount: 2, factorLabels: [] }],
]);

const meta = {
  title: 'Members/MfaScanButton',
  component: MfaScanButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Shared trigger for the group MFA factor scan: `Run MFA scan` before a scan, a ' +
          'loading `Scanning…` while one runs, `Rescan` once results exist, and disabled for ' +
          'an empty group. The large-group confirmation gate is owned by the caller via ' +
          '`onScanClick`.',
      },
    },
  },
  argTypes: {
    mfaResults: { description: 'Per-member MFA scan results, or null before a scan has run.' },
    scanStatus: { description: 'Current MFA scan lifecycle status.' },
    memberCount: { description: 'Member count; scanning is disabled for an empty group.' },
    onScanClick: { description: 'Start (or confirm) the scan.' },
    size: { description: 'Button size; defaults to `sm`.' },
  },
  args: {
    mfaResults: null,
    scanStatus: 'idle',
    memberCount: 250,
    onScanClick: fn(),
  },
} satisfies Meta<typeof MfaScanButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotScanned: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /run mfa scan/i }));
    await expect(args.onScanClick).toHaveBeenCalledTimes(1);
  },
};

export const Scanning: Story = {
  args: { scanStatus: 'scanning' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onScanClick).not.toHaveBeenCalled();
  },
};

export const Scanned: Story = {
  args: { mfaResults, scanStatus: 'complete' },
};

export const Disabled: Story = {
  args: { memberCount: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button')).toBeDisabled();
  },
};
