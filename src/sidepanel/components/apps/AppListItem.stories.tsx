import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import AppListItem from './AppListItem';
import type { AppAssignmentCounts } from '../../hooks/useOktaApi/appOperations';
import type { OktaAppListItem } from '../../../shared/schemas/okta';

const salesforce = {
  id: '0oaFAKE0001',
  name: 'salesforce',
  label: 'Salesforce',
  status: 'ACTIVE',
  signOnMode: 'SAML_2_0',
  created: '2026-01-15T09:00:00.000Z',
  lastUpdated: '2026-06-02T11:30:00.000Z',
} as OktaAppListItem;

const meta = {
  title: 'Apps/AppListItem',
  component: AppListItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A single expandable, read-only row in the Applications list.\n\n' +
          'Collapsed it shows the display label, status badge, sign-on mode, app key, and ' +
          'created date. Expanding reveals the ids/dates, an "Open in Okta" deep link built ' +
          'from the validated org origin, and — fetched lazily only once the row is open, ' +
          "then cached by app id — the app's user/group assignment counts.",
      },
    },
  },
  argTypes: {
    app: { description: 'The app to render.' },
    oktaOrigin: {
      description: 'Okta org origin, enabling the "Open in Okta" deep link when present.',
    },
    fetchAssignmentCounts: {
      description:
        "Loads this app's assignment counts; called only once the row is expanded. Must be stable.",
    },
  },
  args: {
    app: salesforce,
    oktaOrigin: 'https://example.okta.com',
    fetchAssignmentCounts: fn(async (): Promise<AppAssignmentCounts | null> => ({
      users: 128,
      groups: 4,
    })),
  },
} satisfies Meta<typeof AppListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Expanded: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Expand' }));
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Copy application id for Salesforce' }),
      ).toBeInTheDocument(),
    );
    await waitFor(() => expect(canvas.getByText('128 users')).toBeInTheDocument());
  },
};

export const Inactive: Story = {
  args: {
    app: {
      id: '0oaFAKE0002',
      name: 'workday',
      label: 'Workday HR',
      status: 'INACTIVE',
      signOnMode: 'SAML_2_0',
      created: '2026-03-01T09:00:00.000Z',
    } as OktaAppListItem,
  },
};

export const MinimalFields: Story = {
  args: { app: { id: '0oaFAKE0009' } as OktaAppListItem },
};

export const NoOktaOrigin: Story = {
  args: { oktaOrigin: undefined },
};

export const AssignmentCountsUnavailable: Story = {
  args: {
    app: { ...salesforce, id: '0oaFAKE0011' } as OktaAppListItem,
    fetchAssignmentCounts: fn(async (): Promise<AppAssignmentCounts | null> => null),
  },
};
