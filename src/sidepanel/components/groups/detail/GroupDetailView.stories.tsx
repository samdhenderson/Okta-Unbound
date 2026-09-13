import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import GroupDetailView from './GroupDetailView';
import type { GroupSummary } from '../../../../shared/types';

const group: GroupSummary = {
  id: '00gFAKEGROUP0001',
  name: 'Engineering — All',
  description: 'Everyone in the Engineering org, fed by the department rule.',
  type: 'OKTA_GROUP',
  memberCount: 412,
  hasRules: true,
  ruleCount: 1,
  created: new Date('2024-01-15T09:00:00Z'),
  lastUpdated: new Date('2026-06-01T14:30:00Z'),
};

const smallGroup: GroupSummary = {
  ...group,
  id: '00gFAKEGROUP0002',
  name: 'Platform Leads',
  memberCount: 6,
  hasRules: false,
  ruleCount: 0,
};

const meta = {
  title: 'Groups/GroupDetailView',
  component: GroupDetailView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
    docs: {
      description: {
        component:
          'The container half of the Group Detail rung: five panes behind one `Tabs` strip — Overview, Members, Access, Rules and Insights — none gated behind another, with `activeTab` as page-local state rather than sub-navigation.\n\n' +
          'It owns the read-only loads and hands their state to pure sections. `initialPane` only chooses where a caller lands; nothing costly runs unasked, and the Insights pane leaves its per-member MFA scan armed and un-run.',
      },
    },
  },
  argTypes: {
    group: { description: 'The group to explain; changing its identity re-opens the loads.' },
    targetTabId: { description: 'Connected Okta tab id; reads are disabled when null.' },
    oktaOrigin: { description: 'Org origin behind every "View in Okta" affordance.' },
    onNavigateToRule: { description: 'Deep-links a rule in the Rules tab.' },
    initialPane: { description: 'Which pane the caller asked to land on.' },
    isActive: {
      description: 'Whether the Groups tab is the visible one; hidden defers the loads.',
    },
    onExportGroup: {
      description: 'Opens the Export tab scoped to this group; omitting it omits the action.',
    },
  },
  args: {
    group,
    targetTabId: 42,
    oktaOrigin: 'https://example.okta.com',
    onNavigateToRule: fn(),
    onExportGroup: fn(),
    isActive: true,
  },
} satisfies Meta<typeof GroupDetailView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MembersPane: Story = {
  args: { initialPane: 'members' },
};

export const AccessPane: Story = {
  args: { initialPane: 'access' },
};

export const RulesPane: Story = {
  args: { initialPane: 'rules' },
};

export const InsightsPane: Story = {
  args: { initialPane: 'insights' },
};

export const SmallGroup: Story = {
  args: { group: smallGroup },
};

export const Disconnected: Story = {
  args: { targetTabId: null },
};

export const WithoutExport: Story = {
  args: { onExportGroup: undefined },
};

export const Inactive: Story = {
  args: { isActive: false },
};

export const SwitchingPanes: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    await expect(overview).toHaveAttribute('aria-selected', 'true');

    await userEvent.click(canvas.getByRole('tab', { name: 'Access' }));
    await expect(canvas.getByRole('tab', { name: 'Access' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(overview).toHaveAttribute('aria-selected', 'false');
  },
};
