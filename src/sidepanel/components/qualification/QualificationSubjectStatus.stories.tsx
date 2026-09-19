import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import QualificationSubjectStatus from './QualificationSubjectStatus';

const meta = {
  title: 'Qualification/QualificationSubjectStatus',
  component: QualificationSubjectStatus,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The non-verdict states of a subject load: a spinner while the two requests run, a danger alert naming the leg that failed. Never a verdict — absent is not zero.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QualificationSubjectStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: { state: { status: 'loading', userId: '00uFAKEQUAL001' } },
};

export const UserNotFound: Story = {
  args: { state: { status: 'failed', userId: '00uFAKEQUAL001', reason: 'user-not-found' } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/could not be loaded/)).toBeInTheDocument();
  },
};

export const GroupsFailed: Story = {
  args: { state: { status: 'failed', userId: '00uFAKEQUAL001', reason: 'groups-failed' } },
};

export const NoTab: Story = {
  args: { state: { status: 'failed', userId: '00uFAKEQUAL001', reason: 'no-tab' } },
};

export const Idle: Story = {
  args: { state: { status: 'idle' } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[role="alert"]')).toBeNull();
  },
};
