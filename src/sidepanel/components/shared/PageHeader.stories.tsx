import type { Meta, StoryObj } from '@storybook/react-vite';
import Button from './Button';
import PageHeader from './PageHeader';

const meta = {
  title: 'Shared/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Top-of-view header bar rendered at the top of a tab/view — title with optional subtitle, status badge, and trailing actions.\n\n' +
          'The optional badge uses PageHeader’s own local palette (`primary | success | warning | error | neutral`), which still keys on `error`; this is distinct from the canonical `StatusType` vocabulary (which uses `danger`, ADR-0002). Actions are right-aligned.',
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

export const WithBadgeError: Story = {
  args: {
    title: 'Groups',
    badge: { text: 'Error', variant: 'error' },
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
