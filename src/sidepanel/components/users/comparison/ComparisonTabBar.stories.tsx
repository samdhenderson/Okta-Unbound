import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import ComparisonTabBar from './ComparisonTabBar';
import type { TabKey } from './comparisonAnalytics';

const meta = {
  title: 'Users/Comparison/ComparisonTabBar',
  component: ComparisonTabBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Tab bar (Overview / Groups / Apps / Attributes) for the comparison surface — the shared `Tabs` in its default `underline` variant, purely presentational, with selection owned by the parent.\n\n' +
          'The four labels carry no glyphs and no diff-count badges: with them the strip measured 489px against the 328px of track a 360px side panel gives it. Each tab states its own difference count in its body instead.',
      },
    },
  },
  args: {
    activeTab: 'overview',
    onChange: fn(),
  },
  argTypes: {
    activeTab: { description: 'Currently selected tab.' },
    onChange: { description: 'Invoked with the newly selected tab key.' },
  },
} satisfies Meta<typeof ComparisonTabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const GroupsActive: Story = {
  args: { activeTab: 'groups' },
};

export const AppsActive: Story = {
  args: { activeTab: 'apps' },
};

export const AttributesActive: Story = {
  args: { activeTab: 'attributes' },
};

export const CompactPanel: Story = {
  args: { activeTab: 'attributes' },
  parameters: { layout: 'padded', viewport: { value: 'sidepanelCompact' } },
};

const ControlledTabBar = ({ initial }: { initial: TabKey }) => {
  const [active, setActive] = useState<TabKey>(initial);
  return (
    <div style={{ width: 480 }}>
      <ComparisonTabBar activeTab={active} onChange={setActive} />
    </div>
  );
};

export const KeyboardNavigation: Story = {
  render: () => <ControlledTabBar initial="overview" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    const groups = canvas.getByRole('tab', { name: /Groups/ });
    const attributes = canvas.getByRole('tab', { name: /Attributes/ });

    await expect(overview).toHaveAttribute('tabindex', '0');
    await expect(groups).toHaveAttribute('tabindex', '-1');

    overview.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(groups).toHaveFocus();
    await expect(groups).toHaveAttribute('aria-selected', 'true');
    await expect(overview).toHaveAttribute('aria-selected', 'false');

    await userEvent.keyboard('{ArrowLeft}');
    await expect(overview).toHaveFocus();
    await expect(overview).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{End}');
    await expect(attributes).toHaveFocus();
    await expect(attributes).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{Home}');
    await expect(overview).toHaveFocus();
    await expect(overview).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{ArrowLeft}');
    await expect(attributes).toHaveFocus();
    await expect(attributes).toHaveAttribute('aria-selected', 'true');
  },
};
