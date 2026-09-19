import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import RulesMetaRow from './RulesMetaRow';

const meta = {
  title: 'Rules/RulesMetaRow',
  component: RulesMetaRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'What the last load cost in API requests. There is no cached-at chip: a stale list ' +
          'is refetched by hand, so the timestamp only spent a row. Renders nothing when the ' +
          'cost is unknown — a load served from cache cost nothing this session.',
      },
    },
  },
  argTypes: {
    apiCost: { description: 'API requests the last load cost, or null when unknown.' },
  },
  args: { apiCost: 12 },
} satisfies Meta<typeof RulesMetaRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('12')).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: { apiCost: null },
};
