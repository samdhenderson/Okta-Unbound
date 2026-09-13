import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactElement } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import GroupListItem from './GroupListItem';
import { resetEntityCache } from '../../cache/entityCache';
import { writeMemberSource } from '../../cache/memberSourceCache';
import type { GroupSummary } from '../../../shared/types';
import type { MemberSourceBreakdown } from '../../../shared/membership/groupSource';

const plainGroup: GroupSummary = {
  id: '00gFAKE000000000001',
  name: 'Engineering',
  description: 'All engineering staff across every team.',
  type: 'OKTA_GROUP',
  memberCount: 128,
  hasRules: false,
  ruleCount: 0,
  usedInRuleCount: 0,
  created: new Date('2023-01-15'),
  lastUpdated: new Date('2026-06-01'),
};

const oneRuleGroup: GroupSummary = {
  ...plainGroup,
  id: '00gFAKE000000000002',
  name: 'Contractors',
  description: 'Non-employee workers with time-boxed access.',
  memberCount: 34,
  hasRules: true,
  ruleCount: 1,
  usedInRuleCount: 0,
};

const multiRuleGroup: GroupSummary = {
  ...plainGroup,
  id: '00gFAKE000000000003',
  name: 'EU Employees',
  description: 'Everyone whose work location is in the EU.',
  memberCount: 412,
  hasRules: true,
  ruleCount: 2,
  usedInRuleCount: 3,
};

const appGroup: GroupSummary = {
  id: '00gFAKE000000000004',
  name: 'Salesforce Users',
  description: 'Mastered by Salesforce and pushed to AD.',
  type: 'APP_GROUP',
  memberCount: 42,
  hasRules: false,
  ruleCount: 0,
  usedInRuleCount: 0,
  sourceAppId: '0oaFAKEapp000000001',
  sourceAppName: 'Salesforce',
  created: new Date('2022-08-02'),
  lastUpdated: new Date('2026-05-11'),
  pushMappings: [
    {
      mappingId: 'apm000000000000001',
      sourceUserGroupId: '00gFAKE000000000004',
      targetGroupName: 'AD — Salesforce Users',
      priority: 0,
      appId: '0oaFAKEapp000000002',
      appName: 'Active Directory',
    },
    {
      mappingId: 'apm000000000000002',
      sourceUserGroupId: '00gFAKE000000000004',
      targetGroupName: 'Workday — Salesforce Users',
      priority: 1,
      appId: '0oaFAKEapp000000003',
      appName: 'Workday',
    },
  ],
};

const emptyGroup: GroupSummary = {
  ...plainGroup,
  id: '00gFAKE000000000005',
  name: 'Legacy VPN Access',
  description: 'Retired in the 2025 network migration.',
  memberCount: 0,
};

const undescribedGroup: GroupSummary = {
  ...plainGroup,
  id: '00gFAKE000000000006',
  name: 'temp-group-2',
  description: '',
};

const longTextGroup: GroupSummary = {
  ...plainGroup,
  id: '00gFAKE000000000007',
  name: 'A Very Long Group Name That Describes A Highly Specific Cross-Functional Access Boundary',
  description:
    'A correspondingly long description explaining the purpose, scope, and ownership of this group in more detail than the row can possibly show.',
};

const cleanSplit: MemberSourceBreakdown = {
  total: 34,
  direct: 6,
  ruleBased: 28,
  unattributed: 0,
  byRule: [{ ruleId: '0prFAKE000000000001', ruleName: 'Contractor onboarding', count: 28 }],
};

const indeterminateSplit: MemberSourceBreakdown = {
  total: 412,
  direct: 32,
  ruleBased: 380,
  unattributed: 90,
  byRule: [
    { ruleId: '0prFAKE000000000002', ruleName: 'EU work location', count: 250 },
    { ruleId: '0prFAKE000000000003', ruleName: 'EU contractor sync', count: 40 },
  ],
};

const withBreakdown = (groupId: string, breakdown: MemberSourceBreakdown) => () => {
  writeMemberSource(groupId, breakdown);
};

const meta = {
  title: 'Groups/GroupListItem',
  component: GroupListItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'One compact row in the groups list, built around a single question: where do this group’s members come from? The signal line carries the member-source meter, the member count, and the rule and push facts — with "fed by" (rules that assign into the group) and "used in" (rules that merely test membership) kept apart.\n\n' +
          '**The meter never fetches.** A split costs `ceil(N/200)` member requests, so the row renders one only when the Group Detail view has already banked it; otherwise it says "Source not analyzed" and offers an explicit analyze action. Two open affordances carry two names: the chevron expands an inline preview, the row body drills into the detail view.',
      },
    },
  },
  argTypes: {
    group: { description: 'The group to render.' },
    selected: {
      description: 'Whether this row is selected — a selected row shows its checkbox always.',
    },
    onToggleSelect: { description: "Toggles selection for this group's id." },
    oktaOrigin: {
      description: 'Okta origin, enabling the "Open in Okta" deep link when present.',
    },
    onOpenDetail: {
      description: "Drills into this group's read-only detail view (the row-body affordance).",
    },
    onAnalyzeSource: {
      description: 'Requests the (paid) member-source analysis; offered only while none is cached.',
    },
    isHighlighted: {
      description: 'When true, the row auto-expands and shows a highlight ring (deep-link target).',
    },
  },
  args: {
    group: plainGroup,
    selected: false,
    onToggleSelect: fn(),
    onOpenDetail: fn(),
    onAnalyzeSource: fn(),
  },
  beforeEach: () => {
    resetEntityCache();
  },
} satisfies Meta<typeof GroupListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OneFeedingRule: Story = {
  args: { group: oneRuleGroup },
};

export const MultipleRuleRelationships: Story = {
  args: { group: multiRuleGroup },
};

export const MeterWithIndeterminateMembers: Story = {
  args: { group: multiRuleGroup },
  beforeEach: withBreakdown(multiRuleGroup.id, indeterminateSplit),
};

export const MeterComputed: Story = {
  args: { group: oneRuleGroup },
  beforeEach: withBreakdown(oneRuleGroup.id, cleanSplit),
};

export const MeterNotComputed: Story = {
  args: { group: multiRuleGroup },
};

export const MeterNotComputedWithoutAction: Story = {
  args: { group: multiRuleGroup, onAnalyzeSource: undefined },
};

export const AppGroup: Story = {
  args: { group: appGroup },
};

export const Empty: Story = {
  args: { group: emptyGroup },
};

export const WithoutDescription: Story = {
  args: { group: undescribedGroup },
};

export const Selected: Story = {
  args: { selected: true },
};

export const Expanded: Story = {
  args: { group: appGroup },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const { name } = args.group;
    await userEvent.click(canvas.getByRole('button', { name: `Expand ${name}` }));
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: `Collapse ${name}` })).toHaveAttribute(
        'aria-expanded',
        'true',
      ),
    );
  },
};

export const ExpandedWithMeter: Story = {
  args: { group: oneRuleGroup },
  beforeEach: withBreakdown(oneRuleGroup.id, cleanSplit),
  play: Expanded.play,
};

export const Highlighted: Story = {
  args: { isHighlighted: true },
};

export const WithOktaLink: Story = {
  args: { oktaOrigin: 'https://example.okta.com' },
};

export const WithoutOpenDetail: Story = {
  args: { onOpenDetail: undefined },
};

const SelectableRow = (): ReactElement => {
  const [selected, setSelected] = useState(false);
  return (
    <GroupListItem
      group={plainGroup}
      selected={selected}
      onToggleSelect={() => setSelected((current) => !current)}
      onOpenDetail={fn()}
      onAnalyzeSource={fn()}
    />
  );
};

export const Selecting: Story = {
  render: () => <SelectableRow />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: `Select ${plainGroup.name}` });
    await expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();
  },
};

export const Hover: Story = {
  parameters: { pseudo: { hover: true } },
};

export const LongText: Story = {
  args: { group: longTextGroup },
  parameters: { viewport: { value: 'sidepanelCompact' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByText(longTextGroup.name);
    await expect(name).toBeInTheDocument();
    await expect(name).toHaveAttribute('title', longTextGroup.name);
  },
};
