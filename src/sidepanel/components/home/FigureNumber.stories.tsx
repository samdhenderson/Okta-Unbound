import type { Meta, StoryObj } from '@storybook/react-vite';
import FigureNumber from './FigureNumber';

const meta = {
  title: 'Home/FigureNumber',
  component: FigureNumber,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The leading number shared by Home’s findings and its reports. At least `2.6ch` of ' +
          '`tabular-nums` so the sentence beside it never shifts between a `4` and a `214`, and a ' +
          'minimum rather than a fixed width so a four-digit org widens the column instead of ' +
          'spilling out of it.',
      },
    },
  },
  argTypes: {
    value: { description: 'The count, or null when nothing behind it can support one.' },
  },
  args: { value: 31 },
} satisfies Meta<typeof FigureNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Count: Story = {};

export const Zero: Story = { args: { value: 0 } };

export const Wide: Story = { args: { value: 4821 } };

export const Unavailable: Story = { args: { value: null } };
