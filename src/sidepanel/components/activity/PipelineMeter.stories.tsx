import type { Meta, StoryObj } from '@storybook/react-vite';
import PipelineMeter from './PipelineMeter';

const meta = {
  title: 'Sidepanel/Activity/PipelineMeter',
  component: PipelineMeter,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The four-state pipeline bar used by the expanded activity bar.\n\n' +
          'Segments run in pipeline order: **spent** → **in flight** → **queued** → **planned**. When any leg of the plan is a floor rather than a fact (`atLeast`, or an unsized `unknown`), the planned segment is hatched instead of solid — state is encoded in form as well as colour, so "at least this much more" never reads as "exactly this much more" (ADR-0060).',
      },
    },
  },
  argTypes: {
    counts: { description: 'Requests in each pipeline state.' },
    approximate: {
      description: 'Marks the total as a floor rather than a fact; hatches the planned segment.',
    },
    label: { description: 'Accessible description — the meter is content, not decoration.' },
  },
} satisfies Meta<typeof PipelineMeter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    counts: { spent: 0, active: 0, queued: 0, planned: 0 },
    label: 'No requests',
  },
};

export const PartlySpent: Story = {
  args: {
    counts: { spent: 312, active: 4, queued: 26, planned: 470 },
    label: '312 spent, 4 in flight, 26 queued, 470 planned',
  },
};

export const ApproximateTotal: Story = {
  args: {
    counts: { spent: 312, active: 4, queued: 26, planned: 470 },
    approximate: true,
    label: '312 spent, 4 in flight, 26 queued, at least 470 more planned',
  },
};

export const AllPlanned: Story = {
  args: {
    counts: { spent: 0, active: 0, queued: 0, planned: 812 },
    label: '812 planned',
  },
};

export const Complete: Story = {
  args: {
    counts: { spent: 812, active: 0, queued: 0, planned: 0 },
    label: '812 spent',
  },
};
