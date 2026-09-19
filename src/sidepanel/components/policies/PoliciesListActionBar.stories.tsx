import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
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
          'sub-row, and it is the only thing this band carries.\n\n' +
          'There is **no selection register**: `Select all` and `Deselect all` are furniture ' +
          'rather than verbs, and they stand on `PoliciesListPanel`’s count row beside the ' +
          'numbers they act on. The register is a measured row that exists to stop a ' +
          'selection verb popping into the band on the first tick; this rung has no such verb, ' +
          'so an empty register would be reserved space for nothing.\n\n' +
          'No control here states a count: `PoliciesListPanel`’s count row is the rung’s one ' +
          'statement of both numbers.',
      },
    },
  },
  argTypes: {
    search: { description: 'The rung’s search field, rendered as the band’s sub-row.' },
  },
  args: {},
} satisfies Meta<typeof PoliciesListActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('policies-list-action-bar')).toBeInTheDocument();
    await expect(canvas.queryAllByRole('button')).toHaveLength(0);
  },
};

export const NoSelectionRegister: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByTestId('action-bar-register')).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('group', { name: 'Selection actions for the auth policies list' }),
    ).not.toBeInTheDocument();
    for (const name of ['Select all', 'Deselect all']) {
      await expect(canvas.queryByRole('button', { name })).not.toBeInTheDocument();
    }
  },
};

export const WithSearch: Story = {
  args: {
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
    const search = within(band).getByLabelText('Search auth policies');

    await expect(search).toBeInTheDocument();
    await expect(band).toContainElement(search);
    await expect(canvas.queryAllByRole('button')).toHaveLength(0);
  },
};
