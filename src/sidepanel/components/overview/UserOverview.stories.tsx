import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect, within, waitFor } from 'storybook/test';
import UserOverview from './UserOverview';

const meta = {
  title: 'Overview/UserOverview',
  component: UserOverview,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Overview tab for a single Okta user: profile, membership stats, and an ' +
          'alphabetical groups preview.\n\n' +
          "Fetches the user's details from the content script and their group " +
          'memberships via {@link useUserMemberships} (which classifies each as direct ' +
          'vs. rule-based), then renders the profile card, stat cards, a groups preview ' +
          '(Compare / View all), and the {@link UserComparisonModal} launcher.\n\n' +
          '**Related internals:** [Hooks](?path=/docs/internals-hooks--docs), ' +
          '[Storage & cache](?path=/docs/internals-storage-cache--docs), ' +
          '[Types](?path=/docs/internals-types--docs)',
      },
    },
  },
  args: {
    userId: 'user1',
    userName: 'Ada Lovelace',
    targetTabId: 1,
    onViewAllGroups: fn(),
    oktaOrigin: 'https://example.okta.com',
  },
} satisfies Meta<typeof UserOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('Ada Lovelace')).toBeInTheDocument());
    expect(canvas.queryByText(/failed to load/i)).not.toBeInTheDocument();
  },
};
