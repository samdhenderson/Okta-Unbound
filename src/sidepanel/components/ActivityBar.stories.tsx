import type { Meta, StoryObj } from '@storybook/react-vite';
import ActivityBar from './ActivityBar';
import { inSidePanelFrame } from '../../../.storybook/decorators';

const meta = {
  title: 'Sidepanel/ActivityBar',
  component: ActivityBar,
  tags: ['autodocs'],
  decorators: [inSidePanelFrame],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Container for the unified activity bar. Wires `useActivityBar` — the merge of ' +
          'scheduler state, operation progress and the single Cancel path — to the pure ' +
          '`ActivityBarView`.',
      },
    },
  },
} satisfies Meta<typeof ActivityBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
