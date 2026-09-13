import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import RulesDuplicatesPanel from './RulesDuplicatesPanel';
import type { MergeableRuleGroup } from '../../../shared/rules/consolidation';

const clusters: MergeableRuleGroup[] = [
  {
    expression: 'user.department == "Engineering"',
    unionGroupIds: ['00g1eng', '00g2eng-leads'],
    rules: [
      {
        id: 'rul1',
        name: 'Engineering Auto-Assign',
        status: 'ACTIVE',
        type: 'group_rule',
        created: '2025-01-10T00:00:00.000Z',
        lastUpdated: '2025-01-10T00:00:00.000Z',
        actions: { assignUserToGroups: { groupIds: ['00g1eng'] } },
      },
      {
        id: 'rul2',
        name: 'Engineering Leads Sync',
        status: 'INACTIVE',
        type: 'group_rule',
        created: '2025-02-14T00:00:00.000Z',
        lastUpdated: '2025-02-14T00:00:00.000Z',
        actions: { assignUserToGroups: { groupIds: ['00g2eng-leads'] } },
      },
    ],
  },
  {
    expression: 'user.city == "Austin"',
    unionGroupIds: ['00g3austin'],
    rules: [
      {
        id: 'rul3',
        name: 'Austin Office',
        status: 'ACTIVE',
        type: 'group_rule',
        created: '2025-03-01T00:00:00.000Z',
        lastUpdated: '2025-03-01T00:00:00.000Z',
        actions: { assignUserToGroups: { groupIds: ['00g3austin'] } },
      },
      {
        id: 'rul4',
        name: 'Austin Office Backup',
        status: 'ACTIVE',
        type: 'group_rule',
        created: '2025-03-02T00:00:00.000Z',
        lastUpdated: '2025-03-02T00:00:00.000Z',
        actions: { assignUserToGroups: { groupIds: ['00g3austin'] } },
      },
    ],
  },
];

const meta = {
  title: 'Rules/RulesDuplicatesPanel',
  component: RulesDuplicatesPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "The duplicate-condition panel, opened from the rules strip's **Duplicates (N)** " +
          'verb. Rules sharing a match expression but targeting different groups are redundant ' +
          'and can be folded into one rule carrying the union of their targets, with no change ' +
          'to who is matched.\n\n' +
          'Each cluster expands to reveal its shared condition and member rules, each with a ' +
          '"View" link that scrolls to the rule\'s card. Merging opens a non-destructive preview ' +
          'wizard — nothing is written until the admin confirms. Renders nothing with no clusters.',
      },
    },
  },
  argTypes: {
    clusters: { description: 'Clusters of identical-expression rules (2+ each).' },
    onMerge: {
      description: 'Start merging a cluster (opens the non-destructive preview wizard).',
    },
    onFocusRule: { description: 'Scroll to and highlight a rule by id (its "View" link).' },
  },
  args: {
    clusters,
    onMerge: fn(),
    onFocusRule: fn(),
  },
} satisfies Meta<typeof RulesDuplicatesPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getAllByRole('button', { name: /2 rules/ })[0]);
    await expect(canvas.getByText('Engineering Auto-Assign')).toBeInTheDocument();

    await userEvent.click(canvas.getAllByRole('button', { name: 'View' })[0]);
    await expect(args.onFocusRule).toHaveBeenCalledWith('rul1');

    await userEvent.click(canvas.getAllByRole('button', { name: 'Review & merge' })[0]);
    await expect(args.onMerge).toHaveBeenCalled();
  },
};

export const SingleCluster: Story = {
  args: { clusters: [clusters[0]] },
};

export const WithoutFocusLink: Story = {
  args: { onFocusRule: undefined },
};

export const BrokenMemberRule: Story = {
  args: {
    clusters: [
      {
        ...clusters[0],
        rules: [
          clusters[0].rules[0],
          {
            ...clusters[0].rules[1],
            id: 'rul5',
            name: 'Engineering Contractors',
            status: 'INVALID',
          },
        ],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /2 rules/ }));
    await expect(canvas.getByText('Broken')).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: { clusters: [] },
};
