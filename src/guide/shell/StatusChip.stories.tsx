import type { Meta, StoryObj } from '@storybook/react-vite';
import StatusChip from './StatusChip';
import { STATUS_LABEL, type ChapterStatus } from '../status';

const meta = {
  title: 'Guide/Shell/StatusChip',
  component: StatusChip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'How settled a chapter is, from the `guide/status` registry. Colour comes from the status value; the word comes from `STATUS_LABEL`, so copy can change without moving a branch.',
      },
    },
  },
  args: { status: 'shipped' },
} satisfies Meta<typeof StatusChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Shipped: Story = {};

export const Every: Story = {
  render: () => (
    <div className="flex gap-2">
      {(Object.keys(STATUS_LABEL) as ChapterStatus[]).map((status) => (
        <StatusChip key={status} status={status} />
      ))}
    </div>
  ),
};
