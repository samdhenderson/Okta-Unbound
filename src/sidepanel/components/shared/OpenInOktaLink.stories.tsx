import type { Meta, StoryObj } from '@storybook/react-vite';
import OpenInOktaLink from './OpenInOktaLink';

const meta = {
  title: 'Shared/OpenInOktaLink',
  component: OpenInOktaLink,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    oktaOrigin: 'https://example.okta.com',
    entityType: 'group',
    entityId: '00g1abcdEXAMPLE',
  },
} satisfies Meta<typeof OpenInOktaLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const User: Story = {
  args: { entityType: 'user', entityId: '00u1abcdEXAMPLE' },
};

export const Medium: Story = {
  args: { size: 'md' },
};

export const CustomLabel: Story = {
  args: { label: 'Open in Admin Console', size: 'md' },
};

export const NoOrigin: Story = {
  args: { oktaOrigin: null },
};
