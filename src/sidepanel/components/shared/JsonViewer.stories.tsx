import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import JsonViewer from './JsonViewer';
import { redactJson } from '../../../shared/utils/redact';
import { shapeOutline } from '../../../shared/utils/shapeInference';

const OKTA_ORIGIN = 'https://example.okta.com';

const SAMPLE_RESPONSE = {
  id: '0oaFAKEAPP0000000001',
  status: 'ACTIVE',
  label: 'Expense Reports',
  _links: {
    self: { href: 'https://example.okta.com/api/v1/apps/0oaFAKEAPP0000000001' },
  },
  _embedded: {
    users: [
      {
        id: '00uFAKEUSER000000001',
        status: 'ACTIVE',
        profile: {
          email: 'jane.doe@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
          mobilePhone: '555-123-4567',
        },
      },
      {
        id: '00uFAKEUSER000000002',
        status: 'ACTIVE',
        profile: {
          email: 'john.smith@example.com',
          firstName: 'John',
          lastName: 'Smith',
        },
      },
    ],
  },
};

const { data: redacted, redactedCount } = redactJson(SAMPLE_RESPONSE, OKTA_ORIGIN);
const shape = shapeOutline(SAMPLE_RESPONSE);

const meta = {
  title: 'Shared/JsonViewer',
  component: JsonViewer,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Response viewer for the API Explorer. Opens on the values-free Shape view rather ' +
          'than Redacted or Raw, so no redaction gap can leak into the first render. Raw ' +
          'carries an explicit warning strip since it is fully unredacted.',
      },
    },
  },
  argTypes: {
    raw: { description: 'Untouched response data.' },
    redacted: { description: '`raw` with PII and Okta ids swapped for placeholders.' },
    redactedCount: { description: 'How many substitutions produced `redacted`.' },
    shape: { description: 'Pre-rendered, values-free type outline of `raw`.' },
  },
  args: {
    raw: SAMPLE_RESPONSE,
    redacted,
    redactedCount,
    shape,
  },
} satisfies Meta<typeof JsonViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NothingToRedact: Story = {
  args: {
    raw: { status: 'ACTIVE', count: 3 },
    redacted: { status: 'ACTIVE', count: 3 },
    redactedCount: 0,
    shape: shapeOutline({ status: 'ACTIVE', count: 3 }),
  },
};

export const SwitchingViews: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const shapeTab = canvas.getByRole('tab', { name: /shape/i });
    await expect(shapeTab).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.queryByText(/fully unredacted/i)).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('tab', { name: /redacted/i }));
    await expect(canvas.getByRole('tab', { name: /redacted/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(canvas.queryByText(/fully unredacted/i)).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('tab', { name: /raw/i }));
    await expect(canvas.getByText(/fully unredacted/i)).toBeInTheDocument();
  },
};
