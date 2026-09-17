import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import PoliciesListActionBar from './PoliciesListActionBar';
import Input from '../shared/Input';
import Icon from '../shared/Icon';

const meta = {
  title: 'Policies/PoliciesListActionBar',
  component: PoliciesListActionBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The auth-policies rung is read-only by design, so it declares no page verbs — the ' +
          '`actions` array is empty and `ActionBar` draws no row for it. The search is the ' +
          'sub-row; the selection furniture is the register, ranged right.\n\n' +
          'No control here states a count: `PoliciesListPanel`’s `ListCountLine` above the rows ' +
          'is the rung’s one statement of both numbers.',
      },
    },
  },
  args: {
    selectedCount: 0,
    filteredCount: 11,
    allFilteredSelected: false,
    onSelectAll: fn(),
    onDeselectAll: fn(),
  },
  argTypes: {
    search: { description: 'The rung’s search field, rendered as the band’s sub-row.' },
    selectedCount: {
      description: 'How many policies are in the basket, including picks made elsewhere.',
    },
    filteredCount: { description: 'How many policies the current search matches.' },
    allFilteredSelected: {
      description: 'Whether every searched policy is already picked — passed, never derived.',
    },
    onSelectAll: { description: 'Replaces the policy selection with every searched policy.' },
    onDeselectAll: { description: 'Empties the policy partition.' },
  },
} satisfies Meta<typeof PoliciesListActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const register = canvas.getByRole('group', {
      name: 'Selection actions for the auth policies list',
    });

    await expect(within(register).getAllByRole('button')).toHaveLength(1);
    await expect(canvas.queryByRole('button', { name: 'Deselect all' })).not.toBeInTheDocument();

    await userEvent.click(within(register).getByRole('button', { name: 'Select all' }));
    await expect(args.onSelectAll).toHaveBeenCalledTimes(1);
  },
};

export const NoActionRowIsDrawn: Story = {
  args: { selectedCount: 2 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const band = canvas.getByTestId('policies-list-action-bar');
    const register = canvas.getByTestId('action-bar-register');

    await expect(band.children[0]).toBe(register);
    await expect(within(register).getAllByRole('button').length).toBeGreaterThan(0);
    await expect(canvas.getAllByRole('button')).toHaveLength(
      within(register).getAllByRole('button').length,
    );
  },
};

export const WithSelection: Story = {
  args: { selectedCount: 2 },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const register = canvas.getByRole('group', {
      name: 'Selection actions for the auth policies list',
    });

    await expect(within(register).getAllByRole('button')[0]).toHaveAccessibleName('Deselect all');

    await userEvent.click(within(register).getByRole('button', { name: 'Deselect all' }));
    await expect(args.onDeselectAll).toHaveBeenCalledTimes(1);
  },
};

export const AllSelected: Story = {
  args: { selectedCount: 11, allFilteredSelected: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectAll = canvas.getByRole('button', { name: 'Select all' });

    await expect(selectAll).toBeDisabled();
    await expect(selectAll).toHaveAccessibleDescription(
      'All 11 policies matching the current search are already selected',
    );
    await expect(canvas.getByRole('button', { name: 'Deselect all' })).toBeEnabled();
  },
};

export const NoFilteredPolicies: Story = {
  args: { filteredCount: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectAll = canvas.getByRole('button', { name: 'Select all' });

    await expect(selectAll).toBeDisabled();
    await expect(selectAll).toHaveAccessibleDescription('No policies match the current search');
  },
};

export const WithSearch: Story = {
  args: {
    selectedCount: 1,
    search: (
      <Input
        value=""
        onChange={fn()}
        type="search"
        icon={<Icon type="search" size="md" />}
        ariaLabel="Search auth policies"
        placeholder="Search policies by name or description…"
      />
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const band = canvas.getByTestId('policies-list-action-bar');
    await expect(within(band).getByLabelText('Search auth policies')).toBeInTheDocument();
  },
};
