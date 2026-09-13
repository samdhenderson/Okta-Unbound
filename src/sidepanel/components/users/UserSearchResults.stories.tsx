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
          'Compact, clickable list of user search results with per-user status badges.\n\n' +
          'Presentational: each row shows a name, an email and a shared `Badge` coloured by `userStatusVariant`, and clicking a row selects that user. Renders nothing when there are no results; the parent (`UsersTab`, or the comparison modal) owns the search itself. Results come from live Okta search via the scheduler path.\n\n' +
          'The block opens with one quiet `Eyebrow` reading `"{n} matches"`. It replaces an `<h3 className="text-lg font-semibold">Search Results</h3>` plus a separate count pill — two elements saying one thing, and together heavier than the `PageHeader` title above them.\n\n' +
          'Rows are `ListRow` at `compact` density (ADR-0029): previously a `<div onClick>` with no role, no `tabIndex` and no focus ring, so results were unreachable by keyboard. They are two lines, not three — the old `Login:` mono line duplicated the email in every real case.\n\n' +
          'The whole-row click target is a `StretchedButton` overlay rather than `ListRow as="button"`. A row that holds a checkbox cannot also *be* a button — axe reports `nested-interactive` — so the row is a plain `relative` card with an invisible full-bleed button over it and the checkbox on the `relative z-10` escape hatch, exactly as `GroupListItem` does.\n\n' +
          'Passing `onToggleSelect` adds the checkbox column that feeds the panel-wide selection basket. Because `searchUsers` is one unpaginated `q=` query capped at twenty rows, there is no Select-all here: the job this surface supports is assembling a team one search at a time, and a tick survives the next query wiping the list because the basket is keyed by `{kind, id}` and lives outside this component.\n\n' +
          '**Related internals:** [Hooks](?path=/docs/internals-hooks--docs), [Scheduler & messaging](?path=/docs/internals-scheduler-messaging--docs)',
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
    onSelectUser: fn(),
  },
  argTypes: {
    results: { description: 'Matching users to render; an empty array renders nothing.' },
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
