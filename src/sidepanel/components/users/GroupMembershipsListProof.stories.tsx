import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import MembershipProofAction, { type MembershipProofOutcome } from './GroupMembershipsListProof';
import type { GroupMembership } from '../../../shared/types';

const deducedMembership: GroupMembership = {
  group: {
    id: '00gFAKE00000000000001',
    type: 'OKTA_GROUP',
    profile: { name: 'Engineering Staff', description: 'All engineering employees' },
  },
  membershipType: 'DIRECT',
  attribution: 'inferred',
  rules: [],
};

const provenByRule: GroupMembership = {
  ...deducedMembership,
  provenance: {
    source: 'okta',
    rules: [{ id: '0prFAKErule00001', name: 'Auto-add Engineers' }],
  },
};

const provenManual: GroupMembership = {
  ...deducedMembership,
  provenance: { source: 'okta', rules: [] },
};

const meta = {
  title: 'Users/MembershipProofAction',
  component: MembershipProofAction,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One explicit request that converts a deduced membership line into Okta’s own answer. It is a button and never an effect: the read costs one call per membership, so it is offered inside a row a reader has already opened.\n\n' +
          'The three outcomes stay three. Okta naming rules and Okta naming none are both answers; Okta saying nothing — a failed request, an absent embed — renders as no answer at all and leaves the classifier’s deduced line standing, because collapsing the last two would manufacture “added directly” out of a failure.',
      },
    },
  },
  argTypes: {
    membership: { description: 'The membership this row is about, as the classifier produced it.' },
    outcome: { description: 'Where this row has got to, or undefined before anyone asked.' },
    onProve: { description: 'Asks Okta about this membership.' },
  },
  args: {
    membership: deducedMembership,
    outcome: undefined,
    onProve: fn(),
  },
} satisfies Meta<typeof MembershipProofAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unasked: Story = {};

export const Pending: Story = {
  args: { outcome: { status: 'pending' } },
};

export const ProvenByRule: Story = {
  args: { outcome: { status: 'proven', membership: provenByRule } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Okta confirms: added by rule/)).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Ask Okta' })).toBeNull();
  },
};

export const ProvenManualAdd: Story = {
  args: { outcome: { status: 'proven', membership: provenManual } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Okta confirms: added directly')).toBeInTheDocument();
  },
};

export const Unanswered: Story = {
  args: { outcome: { status: 'unanswered' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/still stands as a deduction/)).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Ask Okta' })).toBeInTheDocument();
  },
};

export const AskingOkta: Story = {
  render: (args) => {
    const Harness = () => {
      const [outcome, setOutcome] = useState<MembershipProofOutcome | undefined>(undefined);
      return (
        <MembershipProofAction
          {...args}
          outcome={outcome}
          onProve={() => {
            setOutcome({ status: 'pending' });
            setTimeout(() => setOutcome({ status: 'proven', membership: provenByRule }), 150);
          }}
        />
      );
    };
    return <Harness />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Ask Okta' }));
    await expect(await canvas.findByText(/Okta confirms: added by rule/)).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Ask Okta' })).toBeNull();
  },
};
