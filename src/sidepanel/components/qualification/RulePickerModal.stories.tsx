import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import RulePickerModal from './RulePickerModal';
import { rule } from './storyFixtures';

const rules = [
  rule({ id: '0prFAKE1', name: 'Engineers into SecOps' }),
  rule({ id: '0prFAKE2', name: 'Directors into Leadership', status: 'INACTIVE' }),
  rule({ id: '0prFAKE3', name: 'Contractors into Contractors', status: 'INVALID' }),
];

const meta = {
  title: 'Qualification/RulePickerModal',
  component: RulePickerModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Pick one rule from the inventory the rung already holds — a local name filter, zero requests. Inactive and invalid rules are listed with their status: checking a user against a rule that places nobody is still a question with an answer.',
      },
    },
  },
  args: { isOpen: true, onClose: fn(), onPick: fn(), rules },
} satisfies Meta<typeof RulePickerModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('list', { name: 'Rules' }).children).toHaveLength(3);
    await userEvent.click(canvas.getByRole('button', { name: /Engineers into SecOps/ }));
    await expect(args.onPick).toHaveBeenCalledWith(rules[0]);
  },
};

export const Filtered: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.type(canvas.getByRole('searchbox', { name: 'Filter rules by name' }), 'dir');
    await expect(canvas.getByRole('list', { name: 'Rules' }).children).toHaveLength(1);
    await expect(canvas.getByText('Inactive')).toBeInTheDocument();
  },
};

export const NoMatch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.type(canvas.getByRole('searchbox', { name: 'Filter rules by name' }), 'zzz');
    await expect(canvas.getByText(/No rule name contains/)).toBeInTheDocument();
  },
};

export const EmptyInventory: Story = {
  args: { rules: [] },
};
