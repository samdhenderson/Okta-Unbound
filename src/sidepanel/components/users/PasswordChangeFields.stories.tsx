import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import PasswordChangeFields from './PasswordChangeFields';

const meta = {
  title: 'Users/PasswordChangeFields',
  component: PasswordChangeFields,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The body of the Reset Password confirm. Okta has four ways to change a password and ' +
          'they are not interchangeable, so this is a picker with the consequence stated beside ' +
          'each choice rather than four verbs in the action strip.\n\n' +
          '**Email them a reset link** changes nothing until the user follows it, and is no help ' +
          'when you cannot reach their mailbox. **Set a password now** takes effect immediately ' +
          'and stays in force — the break-glass case, and the one write in this app that cannot ' +
          'be undone. **Set a one-time password** does the same and then makes them replace it. ' +
          '**Generate a temporary password** has Okta produce the value and return it once.\n\n' +
          'Only the two middle modes take a value, so only they render a field. Fully controlled: ' +
          'the parent owns the mode and the value, and drops the value when the modal closes.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm rounded-md border border-neutral-200 bg-white p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    email: 'ada@example.com',
    mode: 'email-reset',
    onModeChange: fn(),
    password: '',
    onPasswordChange: fn(),
    disabled: false,
  },
  argTypes: {
    email: { description: 'Who the reset link would go to, named in the copy for that mode.' },
    mode: { description: 'The chosen operation.' },
    onModeChange: { description: 'Report a new choice.' },
    password: { description: 'The typed value. Empty for the modes that need none.' },
    onPasswordChange: { description: 'Report a new value.' },
    disabled: { description: 'True while a confirmed action is in flight.' },
  },
} satisfies Meta<typeof PasswordChangeFields>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmailReset: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('ada@example.com')).toBeInTheDocument();
    await expect(canvas.queryByLabelText('New password')).not.toBeInTheDocument();
  },
};

export const SetDirectly: Story = {
  args: { mode: 'set' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText('New password')).toHaveAttribute('type', 'password');
    await expect(canvas.getByText(/cannot be undone/i)).toBeInTheDocument();
  },
};

export const ChangingModeClearsTheValue: Story = {
  args: { mode: 'set', password: 'FAKE-value-1' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: 'What should happen' }),
      'email-reset',
    );

    await expect(args.onPasswordChange).toHaveBeenCalledWith('');
    await expect(args.onModeChange).toHaveBeenCalledWith('email-reset');
  },
};

export const Revealed: Story = {
  args: { mode: 'set-and-expire', password: 'FAKE-value-1' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Show password' }));

    await expect(canvas.getByLabelText('New password')).toHaveAttribute('type', 'text');
    await expect(canvas.getByRole('button', { name: 'Hide password' })).toBeInTheDocument();
  },
};

export const Generated: Story = {
  args: { mode: 'set' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Generate' }));

    const value = (args.onPasswordChange as ReturnType<typeof fn>).mock.calls.at(-1)?.[0] as string;
    await expect(value.length).toBeGreaterThan(11);
  },
};

export const TemporaryPassword: Story = {
  args: { mode: 'temp' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByLabelText('New password')).not.toBeInTheDocument();
    await expect(canvas.getByText(/shown to you once/i)).toBeInTheDocument();
  },
};

export const Disabled: Story = {
  args: { mode: 'set', password: 'FAKE-value-1', disabled: true },
};

export const Narrow: Story = {
  args: { mode: 'set' },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};
