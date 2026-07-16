import type { Meta, StoryObj } from '@storybook/react-vite';
import ComparisonHero from './ComparisonHero';
import { mockUsers } from '../../../../test/mocks/handlers';

const contextUser = mockUsers[0];
const comparedUser = mockUsers[1];

const meta = {
  title: 'Users/Comparison/ComparisonHero',
  component: ComparisonHero,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    contextUser,
    comparedUser,
    contextName: 'First1 Last1',
    comparedName: 'First2 Last2',
    similarity: 62,
    isLoading: false,
  },
} satisfies Meta<typeof ComparisonHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HighMatch: Story = {
  args: { similarity: 92 },
};

export const LowMatch: Story = {
  args: { similarity: 8 },
};

export const Loading: Story = {
  args: { isLoading: true },
};

export const LongNames: Story = {
  args: {
    contextName: 'Alexandria Fitzgerald-Montgomery-Whitcombe',
    comparedName: 'Bartholomew Christopherson-Van Der Berg',
  },
};
