import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import TabNavigation from './TabNavigation';

const meta = {
  title: 'Sidepanel/TabNavigation',
  component: TabNavigation,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "Sticky top icon rail for switching between the side panel's main views.\n\n" +
          'Renders `RAIL_TAB_DEFS` from the central `sidepanel/tabs` registry via the shared accessible `Tabs` strip (`rail` variant) and highlights the active one. Selection is reported via `onTabChange`; which tab is active is owned by the caller.\n\n' +
          '**Seven seats, nine sections.** Explorer and History carry `railHidden` and are reached through the ⌘K palette instead (ADR-0063), so they have no glyph here. On either of them no tab matches `activeKey`: the strip shows no selection and no indicator, and the roving anchor falls back to the first tab so the tablist keeps exactly one tab stop — see the `RailHiddenSectionActive` story.\n\n' +
          "Even seven text tabs need well past 450px of strip, but the panel opens at 480px and the user can drag it to 360px — so inactive tabs are icon-only and the active tab's label unfurls beside its glyph, with a tooltip naming any icon on hover or focus. What does not fit still scrolls, with edge fades marking the hidden side, the active tab scrolled into view, and a 2px underline sliding beneath. Compare the `Compact`, `Default` and `Wide` stories: the strip is complete at every width.\n\nThis `nav` is also the bottom of the top-chrome slab: `ContextBar` above it and a rung's `PageHeader` below are borderless, and the single rule closing the chrome lives here.",
      },
    },
  },
  argTypes: {
    activeTab: {
      description:
        'Currently selected tab, rendered with its label unfurled and the indicator beneath.',
    },
    onTabChange: { description: 'Called with the chosen tab id when a tab is clicked.' },
  },
  args: {
    activeTab: 'home',
    onTabChange: fn(),
  },
} satisfies Meta<typeof TabNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const UsersActive: Story = {
  args: { activeTab: 'users' },
};

export const GroupsActive: Story = {
  args: { activeTab: 'groups' },
};

export const RulesActive: Story = {
  args: { activeTab: 'rules' },
};

export const HistoryActive: Story = {
  args: { activeTab: 'history' },
};

const atPanelWidth = (width: number): Story['render'] =>
  function PanelFrame(args) {
    return (
      <div style={{ width }} className="border border-neutral-200">
        <TabNavigation {...args} />
      </div>
    );
  };

export const Compact: Story = {
  args: { activeTab: 'policies' },
  globals: { viewport: { value: 'sidepanelCompact' } },
  render: atPanelWidth(360),
};

export const DefaultWidth: Story = {
  args: { activeTab: 'export' },
  globals: { viewport: { value: 'sidepanelDefault' } },
  render: atPanelWidth(480),
};

export const Wide: Story = {
  args: { activeTab: 'apps' },
  globals: { viewport: { value: 'sidepanelWide' } },
  render: atPanelWidth(720),
};

export const RailHiddenSectionActive: Story = {
  args: { activeTab: 'history' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole('tab');

    await expect(canvas.queryByRole('tab', { name: 'History' })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('tab', { name: 'Explorer' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('tab', { name: 'Home' })).toBeVisible();

    for (const tab of tabs) {
      await expect(tab).toHaveAttribute('aria-selected', 'false');
    }
    await expect(tabs.filter((tab) => tab.getAttribute('tabindex') === '0')).toHaveLength(1);
  },
};

export const MotionShowcase: Story = {
  args: { activeTab: 'groups' },
  parameters: { motion: 'on' },
  globals: { viewport: { value: 'sidepanelCompact' } },
  render: atPanelWidth(360),
};
