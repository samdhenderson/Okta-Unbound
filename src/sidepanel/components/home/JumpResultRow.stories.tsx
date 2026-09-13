import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import JumpResultRow from './JumpResultRow';

const meta = {
  title: 'Home/JumpResultRow',
  component: JumpResultRow,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'One row in the Home tab’s jump-bar results. The list mixes kinds, so every row names ' +
          'its destination on the right edge and pressing one is never a surprise.\n\n' +
          'A kind this build cannot navigate to is never a disabled row: it falls back to an ' +
          '`OpenInOktaLink`, a real route to the same entity. A rule has no admin-console route ' +
          'of its own, so an unreachable rule row shows no link rather than a fabricated one.',
      },
    },
  },
  argTypes: {
    result: { description: 'The resolved entity to render.' },
    onSelect: {
      description:
        'Open the entity on its owning tab. Omit to render the unreachable "Open in Okta" form.',
    },
    oktaOrigin: { description: 'Org origin for the Okta deep link. Fake in these stories.' },
  },
  args: {
    onSelect: fn(),
    oktaOrigin: 'https://example.okta.com',
    result: { kind: 'group', id: '00gFAKE0000000000001', name: 'Engineering' },
  },
} satisfies Meta<typeof JumpResultRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Group: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Engineering — open in Groups' }));
    await expect(args.onSelect).toHaveBeenCalledTimes(1);
  },
};

export const User: Story = {
  args: {
    result: {
      kind: 'user',
      id: '00uFAKE0000000000001',
      name: 'Ada Lovelace',
      secondary: 'ada@example.com',
    },
  },
};

export const PausedRule: Story = {
  args: {
    result: {
      kind: 'rule',
      id: '0prFAKE0000000000001',
      name: 'Eng — All ICs',
      secondary: 'Paused',
    },
  },
};

export const UnreachableApp: Story = {
  args: {
    onSelect: undefined,
    result: {
      kind: 'app',
      id: '0oaFAKE0000000000001',
      name: 'Datadog',
      appName: 'datadog_app',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await expect(canvas.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer');
  },
};

export const UnreachableRule: Story = {
  args: {
    onSelect: undefined,
    result: {
      kind: 'rule',
      id: '0prFAKE0000000000001',
      name: 'Eng — All ICs',
      secondary: 'Active',
    },
  },
};

export const LongName: Story = {
  args: {
    result: {
      kind: 'group',
      id: '00gFAKE0000000000002',
      name: 'Engineering — Platform — Identity and Access Management — On-call rotation',
      secondary: 'Every engineer carrying the identity pager, across all regions and time zones',
    },
  },
};

export const UnreachableAppWithoutTypeKey: Story = {
  args: {
    onSelect: undefined,
    result: { kind: 'app', id: '0oaFAKE0000000000001', name: 'Datadog' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Datadog')).toBeInTheDocument();
    await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
  },
};
