import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import Breadcrumbs from './Breadcrumbs';
import Button from './Button';
import EntityIdentity from './EntityIdentity';
import PageHeader from './PageHeader';
import WorkingSetPinButton from './WorkingSetPinButton';

const meta = {
  title: 'Shared/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Top-of-view header bar rendered at the top of a tab/view — title with optional subtitle, status badge, leading slot, breadcrumb trail, and trailing actions.\n\n' +
          'The optional badge renders through the shared `Badge` primitive, so it speaks the canonical vocabulary — `danger`, never `error` (ADR-0002). Actions are right-aligned.\n\n' +
          'For an entity-identity rung, the badge column is reserved for `danger` only — a deactivated or locked entity should shout. Every calmer status is demoted to a dot-marked `status` fact inside the identity region instead ("demoted to facts"), which is what keeps the header a constant height regardless of how many statuses an entity carries. `groupIdentity`/`userIdentity` make that call; list-rung callers passing `badge` for a plain count (`GroupsTab`, `AppsTab`) are unaffected.\n\n' +
          'The leading-slot props (`onBack`, `leading`, `breadcrumbs`) are additive and optional — omitting them renders the original layout unchanged. They exist so a tab driven by `useViewStack` keeps **one** header mounted whose contents swap in place as views are pushed and popped, rather than each view rendering its own header.\n\n' +
          '`identity` extends that downward: an expanding region describing the entity you are browsing, so a detail view no longer opens with a card repeating the title. Changing `identityKey` crossfades it; the `<h1>` and its badge never do.\n\n' +
          '`cornerAction` parks a small control in the bottom-right corner, below the actions — a different weight of thing from a page verb, kept out of `actions` so it does not read as one. It is in flow, not absolutely positioned, so it cannot land on top of a long identity region at 360px.\n\n' +
          '**Related internals:** [Hooks](?path=/docs/internals-hooks--docs)',
      },
    },
  },
  argTypes: {
    title: { description: 'Page/section heading.' },
    subtitle: { description: 'Optional secondary line under the title.' },
    actions: { description: 'Optional trailing action node(s), right-aligned (e.g. a `Button`).' },
    badge: {
      description: 'Optional coloured badge next to the title. Variant defaults to `neutral`.',
    },
    onBack: {
      description: 'When set, renders a leading chevron-left back button before the title.',
    },
    backLabel: {
      description: 'Accessible name / tooltip for the back button. Defaults to `Back`.',
    },
    leading: {
      description: 'Custom leading-slot node; takes precedence over the default back button.',
    },
    breadcrumbs: {
      description: 'Optional breadcrumb trail rendered above the title (e.g. a `Breadcrumbs`).',
    },
    identity: {
      description:
        'Optional expanding region below the title describing the browsed entity — normally an `EntityIdentity`.',
    },
    identityKey: {
      description:
        'Stable key for the described entity. Changing it crossfades the region; leaving it alone swaps content silently.',
    },
  },
  args: {
    title: 'Groups',
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSubtitle: Story = {
  args: {
    title: 'Groups',
    subtitle: 'Manage Okta group membership',
  },
};

export const WithBadgePrimary: Story = {
  args: {
    title: 'Groups',
    badge: { text: 'Beta', variant: 'primary' },
  },
};

export const WithBadgeSuccess: Story = {
  args: {
    title: 'Groups',
    badge: { text: 'Active', variant: 'success' },
  },
};

export const WithBadgeWarning: Story = {
  args: {
    title: 'Groups',
    badge: { text: 'Caution', variant: 'warning' },
  },
};

export const WithBadgeDanger: Story = {
  args: {
    title: 'Groups',
    badge: { text: 'Locked out', variant: 'danger' },
  },
};

export const WithActions: Story = {
  args: {
    title: 'Groups',
    actions: <Button icon="plus">New Group</Button>,
  },
};

export const Full: Story = {
  args: {
    title: 'Groups',
    subtitle: 'Manage Okta group membership',
    badge: { text: 'Beta', variant: 'primary' },
    actions: <Button icon="plus">Add Group</Button>,
  },
};

export const WithBackButton: Story = {
  args: {
    title: 'Engineering',
    subtitle: '184 members',
    onBack: fn(),
  },
};

export const WithBreadcrumbs: Story = {
  args: {
    title: 'Engineering',
    subtitle: '184 members',
    onBack: fn(),
    breadcrumbs: (
      <Breadcrumbs
        items={[
          { key: 'root', label: 'Groups', onSelect: fn() },
          { key: 'detail', label: 'Engineering' },
        ]}
      />
    ),
    actions: <Button icon="external-link">Open in Okta</Button>,
  },
};

export const WithIdentity: Story = {
  args: {
    title: 'Engineering',
    onBack: fn(),
    backLabel: 'Back to groups',
    identityKey: '00gFAKE1a2b3c4d5e6',
    identity: (
      <EntityIdentity
        rows={[
          [
            { kind: 'status', variant: 'primary', text: 'Okta group' },
            { kind: 'id', value: '00gFAKE1a2b3c4d5e6', copyLabel: 'Copy group id' },
          ],
          [
            { kind: 'metric', icon: 'users', value: '1,284', label: 'members' },
            { kind: 'metric', icon: 'bolt', value: '2', label: 'rules' },
          ],
          [
            { kind: 'text', icon: 'clock', text: 'Created 12 Mar 2021' },
            { kind: 'text', text: 'Updated 4 days ago' },
          ],
        ]}
      />
    ),
    actions: <Button icon="external-link">Open in Okta</Button>,
  },
};

export const WithCornerAction: Story = {
  args: {
    ...WithIdentity.args,
    cornerAction: <WorkingSetPinButton pinned={false} onToggle={fn()} />,
  },
};

export const WithCornerActionPinned: Story = {
  args: {
    ...WithIdentity.args,
    cornerAction: <WorkingSetPinButton pinned onToggle={fn()} />,
  },
};

export const CornerActionWithoutIdentity: Story = {
  args: {
    title: 'Groups',
    subtitle: 'Browse, search, and manage groups',
    cornerAction: <WorkingSetPinButton pinned={false} onToggle={fn()} />,
  },
};

export const WithIdentityNarrow: Story = {
  args: WithIdentity.args,
  parameters: { viewport: { value: 'sidepanelCompact' } },
};

export const WithIdentityUser: Story = {
  args: {
    title: 'Priya Raman',
    onBack: fn(),
    backLabel: 'Back to search',
    identityKey: '00uFAKE9z8y7x6w5v',
    identity: (
      <EntityIdentity
        rows={[
          [
            { kind: 'status', variant: 'success', text: 'ACTIVE' },
            { kind: 'id', value: '00uFAKE9z8y7x6w5v', copyLabel: 'Copy user id' },
          ],
          [{ kind: 'metric', icon: 'users', value: '42', label: 'groups' }],
          [{ kind: 'text', icon: 'clock', text: 'Last login 2 days ago' }],
        ]}
      />
    ),
    actions: <Button icon="external-link">Open in Okta</Button>,
  },
};

export const WithIdentityUserLockedOut: Story = {
  args: {
    title: 'Priya Raman',
    badge: { text: 'LOCKED_OUT', variant: 'danger' },
    onBack: fn(),
    backLabel: 'Back to search',
    identityKey: '00uFAKE9z8y7x6w5v',
    identity: (
      <EntityIdentity
        rows={[
          [{ kind: 'id', value: '00uFAKE9z8y7x6w5v', copyLabel: 'Copy user id' }],
          [{ kind: 'metric', icon: 'users', value: '42', label: 'groups' }],
          [{ kind: 'text', icon: 'clock', text: 'Last login 2 days ago' }],
        ]}
      />
    ),
    actions: <Button icon="external-link">Open in Okta</Button>,
  },
};

export const WithMultipleStatusFactsNarrow: Story = {
  args: {
    title: 'Priya Raman',
    onBack: fn(),
    backLabel: 'Back to search',
    identityKey: '00uFAKE9z8y7x6w5v',
    identity: (
      <EntityIdentity
        rows={[
          [
            { kind: 'status', variant: 'success', text: 'ACTIVE' },
            { kind: 'status', variant: 'warning', text: 'PASSWORD_EXPIRED' },
            { kind: 'id', value: '00uFAKE9z8y7x6w5v', copyLabel: 'Copy user id' },
          ],
          [{ kind: 'metric', icon: 'users', value: '42', label: 'groups' }],
          [{ kind: 'text', icon: 'clock', text: 'Last login 2 days ago' }],
        ]}
      />
    ),
    actions: <Button icon="external-link">Open in Okta</Button>,
  },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};

export const WithoutIdentity: Story = {
  args: {
    title: 'Groups',
    subtitle: 'Browse, search, and manage groups',
    badge: { text: '1,284 Cached', variant: 'success' },
  },
};

export const WithCustomLeading: Story = {
  args: {
    title: 'Engineering',
    leading: (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-light text-sm font-semibold text-primary-text">
        EN
      </span>
    ),
  },
};
