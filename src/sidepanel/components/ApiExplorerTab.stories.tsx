import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import ApiExplorerTab from './ApiExplorerTab';
import { useOktaApi, makeUseOktaApiValue } from '../../../.storybook/mocks/useOktaApi.mock';

const meta = {
  title: 'ApiExplorer/ApiExplorerTab',
  component: ApiExplorerTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
    docs: {
      description: {
        component:
          "A dev-tool surface for discovering what an Okta endpoint's response actually " +
          'contains. It is GET-only and goes through the same scheduler path as every other ' +
          'feature, so it adds no write surface. The response viewer defaults to the ' +
          'values-free Shape view; Redacted and Raw are one click away.',
      },
    },
  },
  argTypes: {
    targetTabId: {
      description: 'Chrome tab id of the connected Okta tab; sending is disabled when null.',
    },
    oktaOrigin: {
      description: 'Okta org origin, used to redact it out of embedded response URLs.',
    },
  },
  args: {
    targetTabId: 1,
    oktaOrigin: 'https://example.okta.com',
  },
  beforeEach: () => {
    useOktaApi.mockReturnValue(makeUseOktaApiValue());
  },
} satisfies Meta<typeof ApiExplorerTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sent: Story = {
  beforeEach: () => {
    useOktaApi.mockReturnValue(
      makeUseOktaApiValue({
        makeApiRequest: fn(async () => ({
          success: true,
          status: 200,
          data: {
            id: '00uFAKE000000000001',
            status: 'ACTIVE',
            profile: { login: 'ada@example.com' },
          },
        })),
      }),
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'API path' });
    await userEvent.type(input, '/api/v1/users/00uFAKE000000000001');
    await userEvent.click(canvas.getByRole('button', { name: 'Send' }));
    await waitFor(() => expect(canvas.getByText('200')).toBeInTheDocument());
  },
};

export const ErrorState: Story = {
  beforeEach: () => {
    useOktaApi.mockReturnValue(
      makeUseOktaApiValue({
        makeApiRequest: fn(async () => ({ success: false, error: 'Endpoint not found' })),
      }),
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'API path' });
    await userEvent.type(input, '/api/v1/nope');
    await userEvent.click(canvas.getByRole('button', { name: 'Send' }));
    await waitFor(() => expect(canvas.getByText('Endpoint not found')).toBeInTheDocument());
  },
};

export const Disconnected: Story = {
  args: { targetTabId: null },
};
