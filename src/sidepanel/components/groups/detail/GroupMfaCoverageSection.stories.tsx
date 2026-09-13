import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import GroupMfaCoverageSection from './GroupMfaCoverageSection';
import type { OktaUser, MemberMfaResult } from '../../../../shared/types';

const members: OktaUser[] = Array.from({ length: 12 }, (_, i) => ({
  id: `user${i + 1}`,
  status: 'ACTIVE',
  profile: {
    login: `user${i + 1}@example.com`,
    email: `user${i + 1}@example.com`,
    firstName: `First${i + 1}`,
    lastName: `Last${i + 1}`,
  },
}));

const result = (id: string, labels: string[]): MemberMfaResult => ({
  userId: id,
  factors: [],
  enrolled: labels.length > 0,
  factorCount: labels.length,
  factorLabels: labels,
});

const mfaResults = new Map<string, MemberMfaResult>(
  members.map((m, i) => [
    m.id,
    result(
      m.id,
      i % 4 === 0
        ? []
        : i % 4 === 1
          ? ['Okta Verify']
          : i % 4 === 2
            ? ['SMS']
            : ['Okta Verify', 'SMS'],
    ),
  ]),
);

const partialResults = new Map<string, MemberMfaResult>(
  members.slice(0, 5).map((m, i) => [m.id, result(m.id, i === 0 ? [] : ['Okta Verify'])]),
);

const noFactorResults = new Map<string, MemberMfaResult>(
  members.map((m) => [m.id, result(m.id, [])]),
);

const meta = {
  title: 'Groups/GroupMfaCoverageSection',
  component: GroupMfaCoverageSection,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "The gated, opt-in MFA-coverage scan for the group's Insights tab. It never auto-runs: it costs one API call per member, and above `MFA_AUTO_THRESHOLD` (500) members a confirmation `Modal` stands between the trigger and the scan.\n\n" +
          'Every figure is over the members the scan actually reached, not the roster — a partial scan says so on the card rather than reporting an unreached member as uncovered.',
      },
    },
  },
  argTypes: {
    members: { description: 'The group roster — the scan reads exactly these members.' },
    mfaResults: { description: 'Per-member MFA scan results, or `null` before a scan has run.' },
    scanStatus: { description: 'Current MFA scan lifecycle status.' },
    onFilterMembers: {
      description:
        'Applies one bucket or factor type as a member filter and moves to the Members tab. Omit and the rows render inert rather than promising a destination.',
    },
  },
  args: {
    members,
    mfaResults: null,
    scanStatus: 'idle',
    onRunScan: fn(),
    onRequestConfirm: fn(),
    onCancelConfirm: fn(),
    onFilterMembers: fn(),
  },
} satisfies Meta<typeof GroupMfaCoverageSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const Confirming: Story = { args: { scanStatus: 'confirming' } };

export const Scanning: Story = { args: { scanStatus: 'scanning' } };

export const Complete: Story = { args: { scanStatus: 'complete', mfaResults } };

export const PartialScan: Story = {
  args: { scanStatus: 'complete', mfaResults: partialResults },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Scanned 5 of 12 members.')).toBeInTheDocument();
    expect(canvas.getByText('5 of 12 scanned')).toBeInTheDocument();
  },
};

export const NoFactorTypes: Story = {
  args: { scanStatus: 'complete', mfaResults: noFactorResults },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('12 with no factor')).toBeInTheDocument();
    expect(canvas.getByText(/No scanned member holds an active factor/)).toBeInTheDocument();
  },
};

export const ErrorState: Story = { args: { scanStatus: 'error' } };

export const EnrollmentExpanded: Story = {
  args: { scanStatus: 'complete', mfaResults },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show the bucket breakdown for MFA enrollment' }),
    );
    expect(
      canvas.getByRole('button', { name: /Open Members filtered by No factors enrolled/ }),
    ).toBeInTheDocument();
    expect(
      canvas.getByRole('button', { name: /Open Members filtered by One factor/ }),
    ).toBeInTheDocument();
  },
};

export const RowsInertWhenUnwired: Story = {
  args: { scanStatus: 'complete', mfaResults, onFilterMembers: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show the bucket breakdown for MFA enrollment' }),
    );
    expect(canvas.getByText('No factors enrolled')).toBeInTheDocument();
    expect(canvas.queryByRole('button', { name: /Open Members filtered by/ })).toBeNull();
  },
};
