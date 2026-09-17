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
          'Collapsed it shows the display label, status badge, sign-on mode, app key and ' +
          'created date. Expanding reveals the ids and dates, an "Open in Okta" deep link ' +
          "built from the validated org origin, and the app's assignment counts — fetched " +
          'only once the row is open, then cached by app id.',
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
    selected: {
      description:
        "Whether this app is in the selection basket; a ticked row paints ListRow's selected state.",
    },
    onToggleSelect: {
      description: 'Tick or untick this app. Omitted ⇒ no checkbox renders at all.',
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
    await userEvent.click(canvas.getByRole('button', { name: 'Expand Salesforce' }));
    await waitFor(() =>
      expect(
        canvas.getByRole('button', {
          name: `Copy application id for Salesforce (${salesforce.id})`,
        }),
      ).toBeInTheDocument(),
    );
    await waitFor(() => expect(canvas.getByText('128 users')).toBeInTheDocument());
  },
};

export const DuplicateLabelsStayDistinguishable: Story = {
  render: (args) => (
    <div className="space-y-2">
      <AppListItem {...args} app={{ ...salesforce, id: '0oaFAKE0001' }} />
      <AppListItem {...args} app={{ ...salesforce, id: '0oaFAKE0099' }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggles = canvas.getAllByRole('button', { name: 'Expand Salesforce' });
    expect(toggles).toHaveLength(2);
    await userEvent.click(toggles[0]);
    await userEvent.click(toggles[1]);

    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Copy application id for Salesforce (0oaFAKE0001)' }),
      ).toBeInTheDocument(),
    );
    await expect(
      canvas.getByRole('button', { name: 'Copy application id for Salesforce (0oaFAKE0099)' }),
    ).toBeInTheDocument();
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

export const HeaderClickToggles: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show details' }));
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Collapse Salesforce' })).toHaveAttribute(
        'aria-expanded',
        'true',
      ),
    );
    await expect(canvas.getByRole('button', { name: 'Hide details' })).toBeInTheDocument();
  },
};

export const KeyboardExpandsTheHeader: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByRole('button', { name: 'Show details' });
    await expect(header).not.toHaveAttribute('aria-expanded');

    header.focus();
    await expect(header).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Collapse Salesforce' })).toHaveAttribute(
        'aria-expanded',
        'true',
      ),
    );
    await waitFor(() => expect(canvas.getByText('128 users')).toBeInTheDocument());
  },
};

export const SpaceCollapsesAgain: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('button', { name: 'Show details' }).focus();
    await userEvent.keyboard(' ');
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Collapse Salesforce' })).toHaveAttribute(
        'aria-expanded',
        'true',
      ),
    );

    canvas.getByRole('button', { name: 'Hide details' }).focus();
    await userEvent.keyboard(' ');
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Expand Salesforce' })).toHaveAttribute(
        'aria-expanded',
        'false',
      ),
    );
  },
};

export const Selectable: Story = {
  args: { onToggleSelect: fn() },
  play: async ({ args, canvas }) => {
    const box = canvas.getByRole('checkbox', { name: 'Select Salesforce' });
    await expect(box).not.toBeChecked();

    await userEvent.click(box);
    await expect(args.onToggleSelect).toHaveBeenCalledWith(salesforce.id);
    await expect(canvas.getByRole('button', { name: 'Expand Salesforce' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  },
};

export const Selected: Story = {
  args: { onToggleSelect: fn(), selected: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('checkbox', { name: 'Select Salesforce' })).toBeChecked();
  },
};
