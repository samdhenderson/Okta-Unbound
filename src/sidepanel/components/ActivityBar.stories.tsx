import type { Meta, StoryObj } from '@storybook/react-vite';
import ActivityBar from './ActivityBar';

const meta = {
  title: 'Sidepanel/ActivityBar',
  component: ActivityBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Container for the unified activity bar.\n\n' +
          'Wires `useActivityBar` (the merge of scheduler state + operation progress and the single Cancel path) to the pure `ActivityBarView`. This one bar replaces the previously overlapping `SchedulerStatusBar` and `LoadingBar`.\n\n' +
          '**Related internals:** [Hooks](?path=/docs/internals-hooks--docs), [Contexts](?path=/docs/internals-contexts--docs), [Scheduler & messaging](?path=/docs/internals-scheduler-messaging--docs)',
      },
    },
  },
} satisfies Meta<typeof ActivityBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
