import type { Meta, StoryObj } from '@storybook/react-vite';
import ComparisonHero from './ComparisonHero';
import { mockUsers } from '../../../../test/mocks/fixtures';

const contextUser = mockUsers[0];
const comparedUser = mockUsers[1];

const meta = {
  title: 'Users/Comparison/ComparisonHero',
  component: ComparisonHero,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Compact header naming both users, with their overall Jaccard match as a tone-coded overlap bar.\n\n' +
          'When the percentage covers less than everything, pass `scopeNote` so the label states what it covers rather than implying a whole-account figure.',
      },
    },
  },
  args: {
    contextUser,
    comparedUser,
    contextName: 'First1 Last1',
    comparedName: 'First2 Last2',
    similarity: 62,
    isLoading: false,
  },
  argTypes: {
    contextUser: { description: 'The context user (left side).' },
    comparedUser: { description: 'The compared user (right side).' },
    contextName: { description: 'Display name for the context user.' },
    comparedName: { description: 'Display name for the compared user.' },
    similarity: {
      description:
        'Overall similarity as a whole percent (0–100), shown as the label and the bar fill.',
    },
    scopeNote: {
      description:
        'What the percentage covers, when that is less than everything — e.g. "groups only" while the app half could not be read. Appended to the `Match` label.',
    },
    isLoading: {
      description: 'When true, renders placeholder glyphs instead of the match percentage.',
    },
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

export const ScopedToGroups: Story = {
  args: { similarity: 25, scopeNote: 'groups only' },
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
