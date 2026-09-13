import type { Meta, StoryObj } from '@storybook/react-vite';
import EntityIdentity from './EntityIdentity';

const meta = {
  title: 'Shared/EntityIdentity',
  component: EntityIdentity,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "Renders the `rows` of an `EntityIdentityDescriptor` to the design system's secondary-text contract, with a `metric`'s value emphasised and an `id` through the shared `CopyableId`. Facts inside a row wrap together, separated by a middot.\n\n" +
          "An **empty row is dropped** rather than rendered as blank space, and a `status` fact is a demoted dot-plus-label rather than the header's loud trailing badge — which stays reserved for `danger`. It renders rows only: the name, badge and Okta link belong to the header's title row.",
      },
    },
  },
  argTypes: {
    rows: { description: 'The descriptor’s fact rows, in render order. Empty rows are dropped.' },
  },
} satisfies Meta<typeof EntityIdentity>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Group: Story = {
  args: {
    rows: [
      [{ kind: 'id', value: '00gFAKE1a2b3c4d5e6', copyLabel: 'Copy group id' }],
      [
        { kind: 'metric', icon: 'users', value: '1,284', label: 'members' },
        { kind: 'metric', icon: 'bolt', value: '2', label: 'rules' },
        { kind: 'metric', icon: 'link', value: '3', label: 'references' },
      ],
      [
        { kind: 'text', icon: 'clock', text: 'Created 12 Mar 2021' },
        { kind: 'text', text: 'Updated 4 days ago' },
      ],
    ],
  },
};

export const GroupBeforeRulesLoad: Story = {
  args: {
    rows: [
      [{ kind: 'id', value: '00gFAKE1a2b3c4d5e6', copyLabel: 'Copy group id' }],
      [{ kind: 'metric', icon: 'users', value: '1,284', label: 'members' }],
      [{ kind: 'text', icon: 'clock', text: 'Created 12 Mar 2021' }],
    ],
  },
};

export const SingleMember: Story = {
  args: {
    rows: [
      [{ kind: 'id', value: '00gFAKE1a2b3c4d5e6', copyLabel: 'Copy group id' }],
      [{ kind: 'metric', icon: 'users', value: '1', label: 'member' }],
    ],
  },
};

export const User: Story = {
  args: {
    rows: [
      [
        { kind: 'status', variant: 'success', text: 'ACTIVE' },
        { kind: 'id', value: '00uFAKE9z8y7x6w5v', copyLabel: 'Copy user id' },
      ],
      [
        { kind: 'metric', icon: 'users', value: '42', label: 'groups' },
        { kind: 'metric', icon: 'bolt', value: '3', label: 'rules' },
      ],
      [
        { kind: 'text', icon: 'clock', text: 'Last login 2 days ago' },
        { kind: 'text', text: 'Created 2 Feb 2022' },
      ],
    ],
  },
};

export const MultipleStatuses: Story = {
  args: {
    rows: [
      [
        { kind: 'status', variant: 'success', text: 'ACTIVE' },
        { kind: 'status', variant: 'warning', text: 'PASSWORD_EXPIRED' },
        { kind: 'id', value: '00uFAKE9z8y7x6w5v', copyLabel: 'Copy user id' },
      ],
      [{ kind: 'metric', icon: 'users', value: '42', label: 'groups' }],
    ],
  },
};

export const MultipleStatusesNarrow: Story = {
  args: MultipleStatuses.args,
  parameters: { viewport: { value: 'sidepanelCompact' } },
};

export const NeverSignedIn: Story = {
  args: {
    rows: [
      [{ kind: 'id', value: '00uFAKE9z8y7x6w5v', copyLabel: 'Copy user id' }],
      [{ kind: 'metric', icon: 'users', value: '0', label: 'groups' }],
      [{ kind: 'text', icon: 'clock', text: 'Last login never' }],
    ],
  },
};

export const Narrow: Story = {
  args: Group.args,
  parameters: { viewport: { value: 'sidepanelCompact' } },
};

export const Empty: Story = {
  args: { rows: [[], []] },
};
