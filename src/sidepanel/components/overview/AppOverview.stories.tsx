import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import AppOverview from './AppOverview';

const meta = {
  title: 'Overview/AppOverview',
  component: AppOverview,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    appId: '0oaFAKE001',
    appName: 'Salesforce',
    onExport: fn(),
  },
} satisfies Meta<typeof AppOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
