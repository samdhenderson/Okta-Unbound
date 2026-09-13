import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import ClauseGroupList from './ClauseGroupList';
import Button from '../../shared/Button';
import type { ClauseGroupReference } from '../../../../shared/rules/explainExpression';

const ref = (over: Partial<ClauseGroupReference> = {}): ClauseGroupReference => ({
  match: 'id',
  value: '00gFAKEgroup00001',
  satisfied: false,
  ...over,
});

const meta = {
  title: 'Users/Comparison/ClauseGroupList',
  component: ClauseGroupList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The groups behind a failing group-membership clause. The two polarities are not ' +
          'mirror images: a positive clause failed because none of its groups matched, so every ' +
          'candidate is listed with satisfied entries marked rather than hidden; a negated ' +
          'clause failed because one did match, so only the memberships actually held are ' +
          'shown and the rest are counted.\n\n' +
          'Each entry is the shared `GroupReferenceChip`, and every state is stated in words ' +
          '(`already in`, `blocking`) — colour never carries a meaning alone.',
      },
    },
  },
  args: { contextName: 'Sam' },
} satisfies Meta<typeof ClauseGroupList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnePrerequisite: Story = {
  args: {
    requirement: 'member',
    references: [ref({ value: '00gFAKEunion00001' })],
    resolveGroupName: () => 'us.employees.union',
    renderGroupAction: () => (
      <Button size="sm" variant="primary" icon="plus">
        Add
      </Button>
    ),
  },
};

export const ResolvedWithCopyableId: Story = {
  args: {
    requirement: 'member',
    references: [ref({ value: '00gFAKEunion00001' })],
    resolveGroupName: () => 'us.employees.union',
  },
};

export const AnyOfSeveral: Story = {
  args: {
    requirement: 'member',
    references: [
      ref({ value: '00gFAKEunion00001' }),
      ref({ value: '00gFAKEstaff00001' }),
      ref({ value: '00gFAKEfte0000001' }),
    ],
    resolveGroupName: (id: string) =>
      ({
        '00gFAKEunion00001': 'us.employees.union',
        '00gFAKEstaff00001': 'us.employees.staff',
      })[id],
    renderGroupAction: () => (
      <Button size="sm" variant="primary" icon="plus">
        Add
      </Button>
    ),
  },
};

export const PartlySatisfied: Story = {
  args: {
    requirement: 'member',
    references: [
      ref({ value: '00gFAKEunion00001', satisfied: true, matchedGroupName: 'us.employees.union' }),
      ref({ value: '00gFAKEstaff00001' }),
    ],
  },
};

export const CollapsedCandidates: Story = {
  args: {
    requirement: 'member',
    references: Array.from({ length: 9 }, (_, i) => ref({ value: `00gFAKEgroup0000${i}` })),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reveal = canvas.getByRole('button', { name: /Show \d+ more groups?/ });

    await userEvent.click(reveal);

    await expect(canvas.queryByRole('button', { name: /Show \d+ more groups?/ })).toBeNull();
    await expect(canvas.getByText('00gFAKEgroup00008')).toBeInTheDocument();
  },
};

export const BlockedByOneOfTwenty: Story = {
  args: {
    requirement: 'non-member',
    references: [
      ref({
        value: '00gFAKEcontract01',
        satisfied: true,
        matchedGroupName: 'emea.contractors',
      }),
      ...Array.from({ length: 19 }, (_, i) => ref({ value: `00gFAKEexcluded${i}` })),
    ],
    renderGroupAction: () => (
      <Button size="sm" variant="secondary" icon="external-link">
        Open group
      </Button>
    ),
  },
};

export const PatternMatch: Story = {
  args: {
    requirement: 'member',
    references: [ref({ match: 'nameStartsWith', value: 'sso.' })],
  },
};

export const UnresolvableId: Story = {
  args: {
    requirement: 'member',
    references: [ref({ value: '00gFAKEunknown0001' })],
  },
};
