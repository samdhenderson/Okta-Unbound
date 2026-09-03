import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import RuleDetailView from './RuleDetailView';
import { NavigationProvider } from '../../contexts/NavigationContext';
import type { FormattedRule } from '../../../shared/types';

const GROUP_A = '00g1a2b3c4d5e6f7g8h9';
const GROUP_B = '00g9z8y7x6w5v4u3t2s1';

const navigationHandlers = { rule: fn(), group: fn(), user: fn(), app: fn(), policy: fn() };

const rule = (over: Partial<FormattedRule> = {}): FormattedRule => ({
  id: '00rFAKE0000000000001',
  name: 'Engineering – Auto-assign by department',
  status: 'ACTIVE',
  condition: 'user.department == "Engineering"',
  conditionExpression: 'user.department == "Engineering"',
  groupIds: [GROUP_A, GROUP_B],
  groupNames: ['Engineering – All', 'Slack – Eng Channel'],
  allGroupNamesMap: { [GROUP_A]: 'Engineering – All', [GROUP_B]: 'Slack – Eng Channel' },
  userAttributes: ['department'],
  created: '2024-01-15T09:00:00.000Z',
  lastUpdated: '2026-06-01T14:30:00.000Z',
  ...over,
});

const meta = {
  title: 'Rules/RuleDetailView',
  component: RuleDetailView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'All of this was the expanded body of `RuleCard`, which ADR-0030’s inventory named as one ' +
          'of the five layout dialects the app had for what is conceptually one thing — eyebrow ' +
          'blocks on `bg-neutral-50`, `tracking-wider`, a hand-laid action row. It was the last of ' +
          'the five never converted. Three things follow from converting it:\n\n' +
          '- **The verbs get a strip.** Four of them were flex-wrapped at the bottom of a card body, ' +
          'which is exactly the "the page’s main verb read as a section’s property" failure ' +
          'ADR-0030 §2 exists to stop. They are ' +
          '[RuleActionBar](?path=/docs/rules-ruleactionbar--docs) now, split by the consequence test ' +
          'rather than by what fitted.\n' +
          '- **The sections get the shared primitive.** `DetailSection`’s `tracking-wide` eyebrow is ' +
          'the survivor of the `tracking-wide`/`tracking-wider` split this body was on the wrong ' +
          'side of.\n' +
          '- **There is room.** Feature H — the clause-level rule explainer — names "a rule’s card in ' +
          'the Rules tab" as its surface, and a per-clause pass/fail breakdown against a picked user ' +
          'does not fit in a list row’s disclosure.\n\n' +
          'A `DetailSection` **stack**, not tabbed panes: `docs/components.md` reserves the tabbed ' +
          'shape for a rung answering several questions about one entity, and a rule has one ' +
          'condition and three facts about it, all already in hand.\n\n' +
          '**There is no header here.** `RulesTab` keeps one `PageHeader` and feeds it ' +
          '`ruleIdentity` (ADR-0032), so this view never repeats the rule’s name, status, id or ' +
          'counts. In the explorer that header is simply absent — these stories start at the strip.\n\n' +
          '**It fetches nothing.** Everything shown is already on the `FormattedRule` the list was ' +
          'rendering, which is what lets the tab push the rung straight from a row with no loading ' +
          'state.',
      },
    },
  },
  decorators: [
    (Story) => (
      <NavigationProvider handlers={navigationHandlers}>
        <div className="p-(--sp-gutter)">
          <Story />
        </div>
      </NavigationProvider>
    ),
  ],
  args: {
    rule: rule(),
    oktaOrigin: 'https://example.okta.com',
    onPreviewImpact: fn(),
    tierOpen: false,
    onTierOpenChange: fn(),
    isLifecycleLoading: false,
    isConfirmingActivate: false,
    onRequestActivate: fn(),
    onCancelActivate: fn(),
    onConfirmActivate: fn(),
    onRequestDeactivate: fn(),
    onAddTargetGroup: fn(),
    sticky: false,
  },
  argTypes: {
    rule: { description: 'The rule being browsed.' },
    oktaOrigin: { description: 'Okta org origin, for the Admin Console rules-page link.' },
    onPreviewImpact: {
      description: 'Opens the impact preview. Omitted when the rule targets no groups.',
    },
    tierOpen: { description: 'Whether the strip’s disclosure tier is open.' },
    sticky: {
      description: 'Pin the strip below the header. `false` in stories — nothing scrolls.',
    },
  },
} satisfies Meta<typeof RuleDetailView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NamedTargetGroups: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Open group Engineering – All' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: `Copy group id ${GROUP_A}` }),
    ).toBeInTheDocument();
  },
};

export const UnresolvedTargetGroups: Story = {
  args: { rule: rule({ groupNames: undefined, allGroupNamesMap: {} }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('Group name not loaded')).toHaveLength(2);
    await expect(
      canvas.getAllByRole('button', { name: /^Group name not loaded — open group 00g/ }),
    ).toHaveLength(2);
  },
};

export const MissingTargetGroup: Story = {
  args: {
    rule: rule({
      groupNames: ['Engineering – All', GROUP_B],
      allGroupNamesMap: { [GROUP_A]: 'Engineering – All' },
      missingGroupIds: [GROUP_B],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Group no longer exists')).toBeInTheDocument();
    await expect(canvas.getByText(/One target no longer exists/)).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Open group Engineering – All' }),
    ).toBeInTheDocument();
  },
};

export const ConditionNamesAGroup: Story = {
  args: {
    rule: rule({
      condition: `isMemberOfAnyGroup("${GROUP_A}")`,
      conditionExpression: `isMemberOfAnyGroup("${GROUP_A}")`,
    }),
  },
};

export const NoTargetGroups: Story = {
  args: { rule: rule({ groupIds: [], groupNames: [] }), onPreviewImpact: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/assigns to no groups/)).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Preview impact' })).not.toBeInTheDocument();
  },
};

export const WithConflicts: Story = {
  args: {
    rule: rule({
      conflicts: [
        {
          rule1: { id: '00rFAKE0000000000001', name: 'Engineering – Auto-assign by department' },
          rule2: { id: '00rFAKE0000000000002', name: 'Contractors – Auto-assign by department' },
          reason: 'Both rules assign users to "Engineering – All" based on overlapping conditions.',
          severity: 'high',
          affectedGroups: [GROUP_A],
        },
      ],
    }),
  },
};

export const TierOpen: Story = {
  args: { tierOpen: true },
};

export const WithoutOktaOrigin: Story = {
  args: { oktaOrigin: null },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('link', { name: /Open the rules page/ }),
    ).not.toBeInTheDocument();
  },
};

export const Narrow: Story = {
  args: {
    rule: rule({
      conditionExpression:
        'user.department == "Engineering" AND user.employeeType == "Full-Time" AND user.countryCode == "GB"',
    }),
  },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};
