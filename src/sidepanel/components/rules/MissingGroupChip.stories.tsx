import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import MissingGroupChip from './MissingGroupChip';

const meta = {
  title: 'Rules/MissingGroupChip',
  component: MissingGroupChip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "A rule target the org has no group for — a proven absence, so it takes a warning's weight. Distinct from `EntityLink`'s id-only mode, which says the name has not been loaded.",
      },
    },
  },
  args: { groupId: '00gFAKEGONE001' },
} satisfies Meta<typeof MissingGroupChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Group no longer exists')).toBeInTheDocument();
  },
};
