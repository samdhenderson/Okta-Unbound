import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import AttributeFilterList from './AttributeFilterList';
import { discoverAttributeBreakdowns } from './memberAnalytics';
import type { OktaUser } from '../../../shared/types';

const members: OktaUser[] = Array.from({ length: 30 }, (_, i) => ({
  id: `00uFAKE${i + 1}`,
  status: 'ACTIVE',
  profile: {
    login: `member${i + 1}@example.com`,
    email: `member${i + 1}@example.com`,
    firstName: `First${i + 1}`,
    lastName: `Last${i + 1}`,
    department: ['Engineering', 'Support', 'Finance'][i % 3],
    title: i % 2 === 0 ? 'Manager' : 'Individual Contributor',
    costCenter: `CC-${100 + (i % 9)}`,
  },
}));

const attributes = discoverAttributeBreakdowns(members);

const meta = {
  title: 'Members/AttributeFilterList',
  component: AttributeFilterList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Inside the filter drawer an attribute is a route to a value, not a report: picking ' +
          'one opens `BreakdownDetailsModal` over that attribute’s distribution, and picking a ' +
          'value there filters the member list. Each row is the shared `ListRow as="button"` ' +
          'and carries an accessible name saying what activating it does.',
      },
    },
  },
  args: {
    attributes,
    filteredKeys: new Set<string>(),
    onSelect: fn(),
  },
} satisfies Meta<typeof AttributeFilterList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Department: choose a value to filter by' }),
    );
    await expect(args.onSelect).toHaveBeenCalledWith('department');
  },
};

export const OneAttributeFiltering: Story = {
  args: { filteredKeys: new Set(['department']) },
};

export const NothingToFilterBy: Story = {
  args: { attributes: [] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/there is nothing to filter by/)).toBeVisible();
  },
};
