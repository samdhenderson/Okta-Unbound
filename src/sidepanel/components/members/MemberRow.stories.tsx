import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { GroupMembership, MemberMfaResult } from '../../../shared/types';
import MemberRow from './MemberRow';
import { mockUsers } from '../../../test/mocks/fixtures';

const activeUser = mockUsers.find((u) => u.status === 'ACTIVE')!;
const suspendedUser = mockUsers.find((u) => u.status === 'SUSPENDED')!;
const deprovisionedUser = mockUsers.find((u) => u.status === 'DEPROVISIONED')!;

const userWithDistinctLogin = {
  ...activeUser,
  profile: { ...activeUser.profile, login: 'jdoe' },
};

const enrolledMfa: MemberMfaResult = {
  userId: activeUser.id,
  factors: [],
  enrolled: true,
  factorCount: 2,
  factorLabels: ['Okta Verify (Fastpass)', 'SMS'],
};

const noFactorsMfa: MemberMfaResult = {
  userId: activeUser.id,
  factors: [],
  enrolled: false,
  factorCount: 0,
  factorLabels: [],
};

const engineeringGroup = {
  id: '00gFAKE1',
  type: 'OKTA_GROUP' as const,
  profile: { name: 'Engineering' },
};

const feedingRule = {
  id: '0prFAKE1',
  name: 'Engineering department',
  status: 'ACTIVE' as const,
  conditionExpression: 'user.department == "Engineering"',
};

const provenMembership: GroupMembership = {
  group: engineeringGroup,
  membershipType: 'RULE_BASED',
  rules: [feedingRule],
  attribution: 'exact',
  provenance: { source: 'okta', rules: [{ id: '0prFAKE1', name: 'Engineering department' }] },
};

const deducedMembership: GroupMembership = {
  group: engineeringGroup,
  membershipType: 'RULE_BASED',
  rules: [feedingRule],
  attribution: 'inferred',
};

const meta = {
  title: 'Members/MemberRow',
  component: MemberRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Single member card: name, email, the login only when it differs from the email, a ' +
          'status badge, MFA factor tags once a scan has completed, and a disclosure carrying ' +
          "the member's profile attributes and an Okta deep link. The row is never itself a " +
          'link — a chevron inside an anchor is `nested-interactive` — and `expanded` is owned ' +
          'by the list, so filtering a row out and back in does not close it.\n\n' +
          'Pass a `membership` and the row also explains **why** this person is in the group: a ' +
          'verdict badge and one source line collapsed, the full caveat plus one evidence card ' +
          "per attributed rule expanded. This surface holds one group's roster and no " +
          '`groupContext`, so `isMemberOf*` clauses read "Cannot be determined", which is true.\n\n' +
          '**The row carries a selection checkbox**, revealed on hover or keyboard focus and ' +
          'drawn unconditionally while ticked, so a pick cannot fade out as the reader scrolls ' +
          'past it. Its name says who (`Select Ada Lovelace`); omitting `onToggleSelect` ' +
          'renders no checkbox.',
      },
    },
  },
  argTypes: {
    user: { description: 'The member to render.' },
    mfa: { description: "This member's MFA scan result, if available." },
    mfaScanned: {
      description: 'True once an MFA scan has completed, so "No MFA" can show for 0-factor users.',
    },
    oktaOrigin: {
      description:
        "Okta org origin; when set, the disclosure offers a link to the member's Admin Console profile.",
    },
    expanded: { description: "Whether this row's disclosure is open. Owned by the list." },
    onToggle: {
      description: "Called with the member's id when the disclosure control is pressed.",
    },
    membership: {
      description: 'Why this member is in the group. Absent ⇒ the row says nothing about source.',
    },
    onRemove: {
      description: 'Request removal. Omitted ⇒ no control renders — never a disabled one.',
    },
    selected: {
      description:
        "Whether this member is in the selection basket; a ticked row paints ListRow's selected state.",
    },
    onToggleSelect: {
      description: 'Tick or untick this member. Omitted ⇒ no checkbox renders at all.',
    },
  },
  args: {
    user: activeUser,
    mfaScanned: false,
    oktaOrigin: null,
    expanded: false,
    onToggle: fn(),
  },
} satisfies Meta<typeof MemberRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Suspended: Story = {
  args: { user: suspendedUser },
};

export const Deprovisioned: Story = {
  args: { user: deprovisionedUser },
};

export const LoginDiffersFromEmail: Story = {
  args: { user: userWithDistinctLogin },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('jdoe')).toBeInTheDocument();
  },
};

export const WithMfaFactors: Story = {
  args: { mfaScanned: true, mfa: enrolledMfa },
};

export const NoMfaEnrolled: Story = {
  args: { mfaScanned: true, mfa: noFactorsMfa },
};

export const WithOktaOrigin: Story = {
  args: { oktaOrigin: 'https://example.okta.com', mfaScanned: true, mfa: enrolledMfa },
};

export const Expanded: Story = {
  args: {
    expanded: true,
    oktaOrigin: 'https://example.okta.com',
    mfaScanned: true,
    mfa: enrolledMfa,
  },
};

export const TogglesFromTheChevronOnly: Story = {
  args: { oktaOrigin: 'https://example.okta.com' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvasElement.querySelector('a button')).toBeNull();
    await expect(canvasElement.querySelector('a [role="button"]')).toBeNull();

    const toggle = canvas.getByRole('button', { name: /Show details for/ });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    await expect(args.onToggle).toHaveBeenCalledWith(activeUser.id);
  },
};

export const ExplainedByOkta: Story = {
  args: { membership: provenMembership, expanded: true, oktaOrigin: 'https://example.okta.com' },
};

export const DeducedWithProofOnOffer: Story = {
  args: {
    membership: deducedMembership,
    expanded: true,
    proofEnabled: true,
    onProve: fn(),
    oktaOrigin: 'https://example.okta.com',
  },
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Ask Okta' }));
    await expect(args.onProve).toHaveBeenCalledWith(deducedMembership, activeUser.id);
  },
};

export const WithRemove: Story = {
  args: { onRemove: fn() },
  play: async ({ args, canvas }) => {
    const remove = canvas.getByRole('button', { name: /^Remove .* from this group$/ });
    await userEvent.click(remove);
    await expect(args.onRemove).toHaveBeenCalledWith(activeUser);
  },
};

export const Selectable: Story = {
  args: { onToggleSelect: fn() },
  play: async ({ args, canvas }) => {
    const box = canvas.getByRole('checkbox', { name: /^Select / });
    await expect(box).not.toBeChecked();

    await userEvent.click(box);
    await expect(args.onToggleSelect).toHaveBeenCalledWith(activeUser.id);
  },
};

export const Selected: Story = {
  args: { onToggleSelect: fn(), selected: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('checkbox', { name: /^Select / })).toBeChecked();
  },
};
