import type { Meta, StoryObj } from '@storybook/react-vite';
import OpenInOktaLink from './OpenInOktaLink';

const meta = {
  title: 'Shared/OpenInOktaLink',
  component: OpenInOktaLink,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Shared “Open in Okta” deep link that opens an entity’s Admin Console page in a new tab, used by the context banner, group overview and user profile card. It renders nothing when the org origin or any part of the target is missing, so callers can drop it in unconditionally; the URL is built from the validated `oktaOrigin` and opened with `rel="noopener noreferrer"`.',
      },
    },
  },
  argTypes: {
    oktaOrigin: {
      description: 'Okta org origin used to build the admin URL; the link hides when absent.',
    },
    target: {
      description:
        'What to deep-link to; an app target also carries the app type key (`name`), which its Admin Console route needs.',
    },
    label: { description: 'Link text. Defaults to `Open in Okta`.' },
    size: { description: 'Compact (`sm`) or standard (`md`) sizing. Defaults to `sm`.' },
    className: { description: 'Extra classes merged onto the anchor.' },
  },
  args: {
    oktaOrigin: 'https://example.okta.com',
    target: { type: 'group', id: '00g1abcdEXAMPLE' },
  },
} satisfies Meta<typeof OpenInOktaLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const User: Story = {
  args: { target: { type: 'user', id: '00u1abcdEXAMPLE' } },
};

export const App: Story = {
  args: { target: { type: 'app', id: '0oa1abcdEXAMPLE', name: 'salesforce' } },
};

export const AppWithoutTypeKey: Story = {
  args: { target: { type: 'app', id: '0oa1abcdEXAMPLE', name: undefined } },
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
