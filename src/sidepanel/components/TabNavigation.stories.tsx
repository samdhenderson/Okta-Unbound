import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
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
          "Sticky top icon rail for switching between the side panel's main views. Renders " +
          '`RAIL_TAB_DEFS` through the shared `Tabs` strip (`rail` variant); the caller owns ' +
          'which tab is active and hears selection through `onTabChange`.\n\n' +
          'The rail seats fewer sections than the panel has: Explorer and History are ' +
          '`railHidden` and reached through the ⌘K button at the trailing end, so on either of ' +
          'them no tab is selected and no indicator is drawn.',
      },
    },
  },
  argTypes: {
    activeTab: {
      description:
        'Currently selected tab, rendered with its label unfurled and the indicator beneath.',
    },
    onTabChange: { description: 'Called with the chosen tab id when a tab is clicked.' },
    onOpenCommandPalette: {
      description: 'Opens the ⌘K palette. Wire to `useCommandPalette().open` in the shell.',
    },
    shortcutPlatform: {
      description:
        'Which chord glyph to print. Defaults to the running platform, detected from the user agent.',
    },
  },
  args: {
    activeTab: 'home',
    onTabChange: fn(),
    onOpenCommandPalette: fn(),
  },
} satisfies Meta<typeof TabNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('tab', { name: 'Home' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await userEvent.click(canvas.getByRole('tab', { name: 'Groups' }));
    await expect(args.onTabChange).toHaveBeenCalledWith('groups');
  },
};

export const UsersActive: Story = {
  args: { activeTab: 'users' },
};

export const GroupsActive: Story = {
  args: { activeTab: 'groups' },
};

export const RulesActive: Story = {
  args: { activeTab: 'rules' },
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

export const ApplePlatform: Story = {
  args: { shortcutPlatform: 'apple' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('button', { name: 'Search and jump to a section, Command K' }),
    ).toBeVisible();
    await expect(canvas.getByText('⌘K')).toBeVisible();
  },
};

export const NonApplePlatform: Story = {
  args: { shortcutPlatform: 'other', activeTab: 'explorer' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('button', { name: 'Search and jump to a section, Ctrl K' }),
    ).toBeVisible();
  },
};

export const CompactWithShortcut: Story = {
  args: { activeTab: 'policies', shortcutPlatform: 'other' },
  globals: { viewport: { value: 'sidepanelCompact' } },
  render: atPanelWidth(360),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /Search and jump to a section/ }));
    await expect(args.onOpenCommandPalette).toHaveBeenCalled();
  },
};

export const MotionShowcase: Story = {
  args: { activeTab: 'groups' },
  parameters: { motion: 'on' },
  globals: { viewport: { value: 'sidepanelCompact' } },
  render: atPanelWidth(360),
};
