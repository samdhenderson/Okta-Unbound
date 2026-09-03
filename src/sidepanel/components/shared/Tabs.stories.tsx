import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
          'Accessible tab bar with `underline`, `segmented` and `rail` variants.\n\n' +
          'Renders the tab strip only — callers own the panels and toggle them on the active key. Implements the ARIA tablist pattern (`role="tablist"`/`role="tab"`, `aria-selected`, roving `tabindex`) with Left/Right/Home/End keyboard navigation and automatic activation. Tabs may carry an optional count badge.\n\n' +
          "The `rail` variant is icon-first: inactive tabs show only their glyph and the active tab's label unfurls beside it, so many sections fit a narrow panel. It stays horizontally scrollable with edge fades, scrolls the active tab into view, and slides a 2px underline beneath. Active is Odyssey's `Tabs` marking — `--color-primary-text` at bold weight, no filled block; the hover wash and the inset focus ring are Odyssey's `SideNav`. Every rail tab carries its label as `aria-label` **and** a `Tooltip` naming it on hover and on focus: the label answers “where am I?”, the chip answers “what is this?”.\n\n" +
          '**Related internals:** [Hooks](?path=/docs/internals-hooks--docs)',
      },
    },
  },
  argTypes: {
    tabs: { description: 'Tabs to render, in display order.' },
    activeKey: { description: 'Key of the currently selected tab.' },
    onChange: { description: 'Invoked with the newly selected tab key.' },
    variant: {
      description:
        '`underline` (default) for section navigation; `segmented` for compact toggles; `rail` for icon-first navigation in a narrow panel.',
    },
    wrap: {
      description:
        'Let a `segmented` strip take a second row on a narrow panel: two equal columns below `sm`, one row above it. Ignored by `underline` and `rail`.',
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
  wrap = false,
}: {
  tabs: TabItem[];
  initial: string;
  variant: TabsVariant;
  width: number;
  wrap?: boolean;
}) => {
  const [active, setActive] = useState(initial);
  return (
    <div style={{ width }}>
      <Tabs
        tabs={tabs}
        activeKey={active}
        onChange={setActive}
        variant={variant}
        wrap={wrap}
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

export const Segmented: Story = {
  render: () => (
    <ControlledTabs tabs={COMPOSITION_TABS} initial="attrs" variant="segmented" width={260} />
  ),
};

export const SegmentedWithIcons: Story = {
  render: () => (
    <ControlledTabs tabs={COMPARISON_TABS} initial="overview" variant="segmented" width={480} />
  ),
};

export const SegmentedWrapped: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <ControlledTabs tabs={COMPARISON_TABS} initial="groups" variant="segmented" width={330} wrap />
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
