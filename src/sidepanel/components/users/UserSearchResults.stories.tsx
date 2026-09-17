import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import UserSearchResults from './UserSearchResults';
import type { OktaUser, UserStatus } from '../../../shared/types';

const user = (n: number, first: string, last: string, status: UserStatus): OktaUser => ({
  id: `00uFAKE000${n}`,
  status,
  profile: {
    login: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    firstName: first,
    lastName: last,
  },
});

const active = user(1, 'Ada', 'Lovelace', 'ACTIVE');
const suspended = user(2, 'Grace', 'Hopper', 'SUSPENDED');
const provisioned = user(3, 'Alan', 'Turing', 'PROVISIONED');
const lockedOut = user(4, 'Katherine', 'Johnson', 'LOCKED_OUT');
const staged = user(5, 'Margaret', 'Hamilton', 'STAGED');
const deprovisioned = user(6, 'Annie', 'Easley', 'DEPROVISIONED');

const everyStatus = [active, suspended, provisioned, lockedOut, staged, deprovisioned];

const meta = {
  title: 'Users/UserSearchResults',
  component: UserSearchResults,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Compact, clickable list of user search results with per-user status badges, under one quiet `Eyebrow` reading the match count.\n\n' +
          'Presentational: each row is a `ListRow` at `compact` density showing a name, an email and a shared `Badge` coloured by `userStatusVariant`. It renders nothing when there are no results; the parent owns the search itself. The whole-row click target is a `StretchedButton` overlay rather than `ListRow as="button"`, because a row that holds a checkbox cannot also *be* a button (axe reports `nested-interactive`). Passing `onToggleSelect` adds the checkbox column that feeds the panel-wide selection basket; there is no Select-all, and a tick survives the next query wiping the list.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Story />
      </div>
    ),
  ],
  args: {
    results: [active, suspended, provisioned],
    truncated: false,
    onSelectUser: fn(),
  },
  argTypes: {
    results: { description: 'Matching users to render; an empty array renders nothing.' },
    truncated: {
      description:
        "Whether Okta held matches back, read from the search response's `Link` header. True, the count line says the page is a page and states no total.",
    },
    onSelectUser: { description: 'Invoked with the chosen user when a result row is clicked.' },
    selectedIds: {
      description:
        'Ids of the users sitting in the selection basket — routinely including people ticked in an earlier search who are no longer among `results`.',
    },
    onToggleSelect: {
      description:
        "Tick or untick one result, called with that user's id. Omitted renders no checkbox at all.",
    },
    actionLabel: {
      description:
        "Accessible name for the whole-row click target, describing what activating a result does on this host. Defaults to 'View user details'.",
    },
  },
} satisfies Meta<typeof UserSearchResults>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MixedStatuses: Story = {
  args: { results: everyStatus },
};

export const SingleResult: Story = {
  args: { results: [active] },
};

export const Empty: Story = {
  args: { results: [] },
};

export const Truncated: Story = {
  args: { results: everyStatus, truncated: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Showing the first 6 matches — narrow the search to see the rest'),
    ).toBeInTheDocument();
    await expect(canvas.queryByText('6 matches')).not.toBeInTheDocument();
  },
};

export const FullPageButComplete: Story = {
  args: { results: everyStatus, truncated: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('6 matches')).toBeInTheDocument();
    await expect(canvas.queryByText(/Showing the first/)).not.toBeInTheDocument();
  },
};

export const Compact360: Story = {
  args: {
    results: [
      user(7, 'Bartholomew', 'Featherstonehaugh-Wintergreen', 'ACTIVE'),
      suspended,
      deprovisioned,
    ],
  },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};

export const KeyboardActivation: Story = {
  args: { results: [active, suspended] },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const [firstRow] = canvas.getAllByRole('button');

    await userEvent.tab();
    await expect(firstRow).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(args.onSelectUser).toHaveBeenCalledWith(active);
  },
};

export const WithSelection: Story = {
  args: {
    results: everyStatus.slice(0, 4),
    selectedIds: new Set([suspended.id]),
    onToggleSelect: fn(),
  },
};

export const TickingDoesNotOpenTheUser: Story = {
  args: {
    results: [active, suspended],
    selectedIds: new Set<string>(),
    onToggleSelect: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select Ada Lovelace' }));

    await expect(args.onToggleSelect).toHaveBeenCalledWith(active.id);
    await expect(args.onSelectUser).not.toHaveBeenCalled();
  },
};

export const ManyResults: Story = {
  args: {
    results: Array.from({ length: 25 }, (_, i) =>
      user(100 + i, `First${i + 1}`, `Last${i + 1}`, i % 4 === 0 ? 'SUSPENDED' : 'ACTIVE'),
    ),
  },
};
