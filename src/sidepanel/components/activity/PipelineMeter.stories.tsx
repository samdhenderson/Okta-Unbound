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
          'Segments run in pipeline order: **spent** → **in flight** → **queued** → **planned**. Each segment is a solid fill sized by its share of the declared total; the planned share is rendered the same way whether the plan sized it exactly or estimated it (ADR-0060).',
      },
    },
  },
  argTypes: {
    counts: { description: 'Requests in each pipeline state.' },
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
