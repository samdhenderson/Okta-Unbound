import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import GroupRulesSection from './GroupRulesSection';
import { NavigationProvider } from '../../../contexts/NavigationContext';
import { selectionStore } from '../../../selection/selectionStore';
import type { FormattedRule } from '../../../../shared/types';

const GROUP_NAMES: Record<string, string> = {
  '00gFAKEGROUP0001': 'Engineering — Platform',
  '00gFAKEGROUP0002': 'Contractors — EMEA',
};

const rule = (
  over: Partial<FormattedRule> & Pick<FormattedRule, 'id' | 'name'>,
): FormattedRule => ({
  status: 'ACTIVE',
  condition: 'department == "Engineering"',
  conditionExpression: 'user.department == "Engineering"',
  groupIds: ['00gFAKEGROUP0001'],
  userAttributes: ['department'],
  created: '2024-01-01T00:00:00.000Z',
  lastUpdated: '2025-01-01T00:00:00.000Z',
  ...over,
});

const assigningRules: FormattedRule[] = [
  rule({ id: '0prFAKE1', name: 'Engineering intake' }),
  rule({
    id: '0prFAKE2',
    name: 'Platform contractors',
    condition: 'in Contractors — EMEA and department is Platform',
    conditionExpression: 'isMemberOfAnyGroup("00gFAKEGROUP0002") AND user.department == "Platform"',
    allGroupNamesMap: GROUP_NAMES,
  }),
];

const referencingRules: FormattedRule[] = [
  rule({
    id: '0prFAKE3',
    name: 'Contractors gate',
    status: 'INACTIVE',
    condition: 'in Engineering — Platform',
    conditionExpression: 'isMemberOfAnyGroup("00gFAKEGROUP0001")',
    allGroupNamesMap: GROUP_NAMES,
  }),
];

const meta = {
  title: 'Groups/GroupRulesSection',
  component: GroupRulesSection,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The two rule relationships a group can have, listed separately: rules that **assign members into** it, and rules that merely **consult** it in a condition. Those are opposite facts, so they never share a count.\n\n' +
          'Each row is the same `RuleCard` the Rules tab renders, and pressing it deep-links to that rule’s detail rung. Under the row sits a read-only **When** line carrying the condition expression, so "what does that rule actually say?" is answered without leaving the Group tab (I-031). Group ids inside the expression resolve to named badges through the shared `RuleExpressionText`.\n\n' +
          'The section wires **no write verb at all** — it cannot activate, deactivate or create a rule, and it renders no control that would pretend otherwise (ADR-0039). Each list carries its own loading, empty and error state.',
      },
    },
  },
  decorators: [
    (Story) => (
      <NavigationProvider handlers={{ group: fn() }}>
        <Story />
      </NavigationProvider>
    ),
  ],
  beforeEach: () => {
    selectionStore.clearAll();
    return () => selectionStore.clearAll();
  },
  argTypes: {
    assigningRules: { description: 'Rules whose `assignUserToGroups` targets this group.' },
    assigningStatus: { description: 'Status of the assigning-rules load.' },
    assigningError: { description: 'Error message when the assigning-rules load failed.' },
    referencingRules: {
      description: 'Rules whose condition expression names this group by id.',
    },
    referencingStatus: { description: 'Status of the referencing-rules load.' },
    referencingError: { description: 'Error message when the referencing-rules load failed.' },
    onNavigateToRule: {
      description: "Opens a rule's detail rung on the Rules tab. Pressing a row is the jump.",
    },
  },
  args: {
    assigningRules,
    assigningStatus: 'done',
    assigningError: null,
    referencingRules,
    referencingStatus: 'done',
    referencingError: null,
    onNavigateToRule: fn(),
  },
} satisfies Meta<typeof GroupRulesSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ConditionInPlace: Story = {
  args: {
    assigningRules: [assigningRules[1]],
    referencingRules: [],
  },
};

export const NoRules: Story = {
  args: {
    assigningRules: [],
    referencingRules: [],
  },
};

export const LoadingOneAxis: Story = {
  args: {
    referencingStatus: 'loading',
    referencingRules: [],
  },
};

export const OneAxisFailed: Story = {
  args: {
    referencingStatus: 'error',
    referencingError: 'Rules listing unavailable',
    referencingRules: [],
  },
};

export const NoDeepLink: Story = {
  args: { onNavigateToRule: undefined },
};

export const TogglingASelection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: `Select ${assigningRules[0].name}` });
    await expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);

    await expect(checkbox).toBeChecked();
  },
};
