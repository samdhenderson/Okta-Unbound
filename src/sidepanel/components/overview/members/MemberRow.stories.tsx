import type { Meta, StoryObj } from '@storybook/react-vite';
import type { MemberMfaResult } from '../../../../shared/types';
import MemberRow from './MemberRow';
import { mockUsers } from '../../../../test/mocks/handlers';

const activeUser = mockUsers.find((u) => u.status === 'ACTIVE')!;
const suspendedUser = mockUsers.find((u) => u.status === 'SUSPENDED')!;
const deprovisionedUser = mockUsers.find((u) => u.status === 'DEPROVISIONED')!;

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

const meta = {
  title: 'Overview/Members/MemberRow',
  component: MemberRow,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    user: activeUser,
    mfaScanned: false,
    oktaOrigin: null,
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

export const WithMfaFactors: Story = {
  args: { mfaScanned: true, mfa: enrolledMfa },
};

export const NoMfaEnrolled: Story = {
  args: { mfaScanned: true, mfa: noFactorsMfa },
};

export const WithOktaOrigin: Story = {
  args: { oktaOrigin: 'https://example.okta.com', mfaScanned: true, mfa: enrolledMfa },
};
