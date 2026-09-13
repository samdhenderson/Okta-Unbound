import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import Tabs, { type TabItem, type TabsVariant } from './Tabs';

const SECTION_TABS: TabItem[] = [
  { key: 'account', label: 'Account' },
  { key: 'org', label: 'Org' },
  { key: 'contact', label: 'Contact' },
  { key: 'custom', label: 'Custom', count: 7 },
  { key: 'all', label: 'All' },
];

const COMPARISON_TABS: TabItem[] = [
  { key: 'overview', label: 'Overview', icon: 'chart' },
  { key: 'groups', label: 'Groups', icon: 'users', count: 3, countDisplay: 'nonzero' },
  { key: 'apps', label: 'Apps', icon: 'app', count: 12, countDisplay: 'nonzero' },
  { key: 'attributes', label: 'Attributes', icon: 'list', count: 0, countDisplay: 'nonzero' },
];

const COMPOSITION_TABS: TabItem[] = [
  { key: 'attrs', label: 'Attributes', count: 9 },
  { key: 'mfa', label: 'MFA factors' },
];

const RAIL_TABS: TabItem[] = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'users', label: 'Users', icon: 'user' },
  { key: 'groups', label: 'Groups', icon: 'users' },
  { key: 'apps', label: 'Apps', icon: 'app' },
  { key: 'rules', label: 'Rules', icon: 'bolt' },
  { key: 'policies', label: 'Policies', icon: 'shield' },
  { key: 'export', label: 'Export', icon: 'download' },
  { key: 'explorer', label: 'Explorer', icon: 'terminal' },
  { key: 'history', label: 'History', icon: 'clipboard' },
];

const meta = {
  title: 'Shared/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Accessible tab bar with `underline` and `rail` variants. It renders the strip only — callers own the panels and toggle them on the active key — and implements the ARIA tablist pattern with roving `tabindex` and Left/Right/Home/End navigation.\n\n' +
          "The `rail` variant is icon-first: inactive tabs show only their glyph while the active tab's label unfurls beside it, so many sections fit a narrow panel. Every rail tab carries its label as `aria-label` and a tooltip naming it on hover and focus.",
      },
    },
  },
  argTypes: {
    tabs: { description: 'Tabs to render, in display order.' },
    activeKey: { description: 'Key of the currently selected tab.' },
    onChange: { description: 'Invoked with the newly selected tab key.' },
    variant: {
      description:
        '`underline` (default) for section navigation; `rail` for icon-first navigation in a narrow panel.',
    },
    ariaLabel: { description: 'Accessible label for the tablist (e.g. “User profile sections”).' },
    className: { description: 'Extra classes merged onto the tablist container.' },
  },
  args: {
    tabs: SECTION_TABS,
    activeKey: 'account',
    onChange: () => {},
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const ControlledTabs = ({
  tabs,
  initial,
  variant,
  width,
}: {
  tabs: TabItem[];
  initial: string;
  variant: TabsVariant;
  width: number;
}) => {
  const [active, setActive] = useState(initial);
  return (
    <div style={{ width }}>
      <Tabs
        tabs={tabs}
        activeKey={active}
        onChange={setActive}
        variant={variant}
        ariaLabel="Demo"
      />
      <p className="text-sm text-neutral-600" style={{ padding: 12 }}>
        Active: <strong>{active}</strong>
      </p>
    </div>
  );
};

export const Underline: Story = {
  render: () => (
    <ControlledTabs tabs={SECTION_TABS} initial="account" variant="underline" width={340} />
  ),
};

export const UnderlineCompact: Story = {
  render: () => (
    <ControlledTabs tabs={COMPOSITION_TABS} initial="attrs" variant="underline" width={260} />
  ),
};

export const UnderlineWithIcons: Story = {
  render: () => (
    <ControlledTabs tabs={COMPARISON_TABS} initial="overview" variant="underline" width={480} />
  ),
};

export const UnderlineCompactPanel: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <ControlledTabs
      tabs={COMPARISON_TABS.map(({ icon: _icon, count: _count, countDisplay: _cd, ...tab }) => tab)}
      initial="groups"
      variant="underline"
      width={330}
    />
  ),
};

export const Rail: Story = {
  render: () => <ControlledTabs tabs={RAIL_TABS} initial="home" variant="rail" width={360} />,
};

export const RailMotion: Story = {
  parameters: { motion: 'on' },
  render: () => <ControlledTabs tabs={RAIL_TABS} initial="groups" variant="rail" width={360} />,
};

export const RailWide: Story = {
  render: () => <ControlledTabs tabs={RAIL_TABS} initial="history" variant="rail" width={720} />,
};

export const KeyboardNavigation: Story = {
  render: () => (
    <ControlledTabs tabs={SECTION_TABS} initial="account" variant="underline" width={340} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const account = canvas.getByRole('tab', { name: 'Account' });
    account.focus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Org' })).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{Home}');
    await expect(canvas.getByRole('tab', { name: 'Account' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};
