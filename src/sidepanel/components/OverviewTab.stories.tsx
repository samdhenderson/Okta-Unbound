import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import OverviewTab from './OverviewTab';

const meta = {
  title: 'Components/OverviewTab',
  component: OverviewTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Context-aware landing tab that adapts to the detected Okta page.\n\n' +
          '**Related internals:** [Hooks](?path=/docs/internals-hooks--docs)',
      },
    },
  },
  args: {
    onTabChange: fn(),
  },
} satisfies Meta<typeof OverviewTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
