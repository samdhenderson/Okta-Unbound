import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import AppOverview from './AppOverview';
import { useOktaApi, makeUseOktaApiValue } from '../../../../.storybook/mocks/useOktaApi.mock';

const appRecord = (overrides: Record<string, unknown> = {}) => ({
  id: '0oaFAKE001',
  label: 'Salesforce',
  name: 'salesforce',
  status: 'ACTIVE',
  signOnMode: 'SAML_2_0',
  ...overrides,
});

const meta = {
  title: 'Overview/AppOverview',
  component: AppOverview,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    appId: { description: 'Detected Okta app id.' },
    appName: { description: 'Detected Okta app display name.' },
    targetTabId: {
      description: 'Tab hosting the Okta session; omit to render identity + exports only.',
    },
    onExport: { description: 'Open the Export tab pre-scoped to an app-scoped descriptor.' },
  },
  args: {
    appId: '0oaFAKE001',
    appName: 'Salesforce',
    targetTabId: 1,
    onExport: fn(),
  },
  beforeEach: () => {
    useOktaApi.mockReturnValue(
      makeUseOktaApiValue({
        getAppById: fn(async () => appRecord()),
        getAppAssignmentCounts: fn(async () => ({ users: 1284, groups: 12 })),
      }),
    );
  },
} satisfies Meta<typeof AppOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAppSpecificPolicy: Story = {
  args: { appId: '0oaFAKE002' },
  beforeEach: () => {
    useOktaApi.mockReturnValue(
      makeUseOktaApiValue({
        getAppById: fn(async () => ({
          ...appRecord({ id: '0oaFAKE002' }),
          _links: {
            accessPolicy: {
              href: 'https://example.okta.com/api/v1/policies/rstFAKE0123456789abc',
            },
          },
        })),
        getAppAssignmentCounts: fn(async () => ({ users: 42, groups: 3 })),
      }),
    );
  },
};

export const Inactive: Story = {
  args: { appId: '0oaFAKE003' },
  beforeEach: () => {
    useOktaApi.mockReturnValue(
      makeUseOktaApiValue({
        getAppById: fn(async () => appRecord({ id: '0oaFAKE003', status: 'INACTIVE' })),
        getAppAssignmentCounts: fn(async () => ({ users: 0, groups: 0 })),
      }),
    );
  },
};

export const EnrichmentUnavailable: Story = {
  args: { appId: '0oaFAKE004' },
  beforeEach: () => {
    useOktaApi.mockReturnValue(
      makeUseOktaApiValue({
        getAppById: fn(async () => null),
        getAppAssignmentCounts: fn(async () => null),
      }),
    );
  },
};
