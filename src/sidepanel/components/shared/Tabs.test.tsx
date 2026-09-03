import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tabs, { type TabItem } from './Tabs';

const TABS: TabItem[] = [
  { key: 'account', label: 'Account' },
  { key: 'org', label: 'Org' },
  { key: 'custom', label: 'Custom', count: 7 },
];

describe('Tabs', () => {
  it('renders a tablist and marks the active tab with aria-selected', () => {
    render(<Tabs tabs={TABS} activeKey="org" onChange={vi.fn()} ariaLabel="Sections" />);
    expect(screen.getByRole('tablist', { name: 'Sections' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Org' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /Account/ })).toHaveAttribute('aria-selected', 'false');
  });

  it('gives only the active tab a tabIndex of 0 (roving tabindex)', () => {
    render(<Tabs tabs={TABS} activeKey="account" onChange={vi.fn()} />);
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Org' })).toHaveAttribute('tabindex', '-1');
  });

  it('keeps one tab stop when activeKey matches no tab, without claiming a selection', () => {
    render(<Tabs tabs={TABS} activeKey="not-a-tab" onChange={vi.fn()} />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs.filter((tab) => tab.getAttribute('tabindex') === '0')).toHaveLength(1);
    expect(tabs[0]).toHaveAttribute('tabindex', '0');
    for (const tab of tabs) {
      expect(tab).toHaveAttribute('aria-selected', 'false');
    }
  });

  it('fires onChange with the tab key when clicked', async () => {
    const onChange = vi.fn();
    render(<Tabs tabs={TABS} activeKey="account" onChange={onChange} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Org' }));
    expect(onChange).toHaveBeenCalledWith('org');
  });

  it('renders the count badge when provided', () => {
    render(<Tabs tabs={TABS} activeKey="account" onChange={vi.fn()} />);
    expect(screen.getByRole('tab', { name: /Custom/ })).toHaveTextContent('7');
  });

  it('moves selection with arrow keys and wraps at the ends', async () => {
    const onChange = vi.fn();
    render(<Tabs tabs={TABS} activeKey="account" onChange={onChange} />);
    const account = screen.getByRole('tab', { name: 'Account' });
    account.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('org');
    account.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith('custom');
  });

  it('hides a nonzero-display count of 0 and shows it once there is something to report', () => {
    const { rerender } = render(
      <Tabs
        tabs={[{ key: 'diff', label: 'Groups', count: 0, countDisplay: 'nonzero' }]}
        activeKey="diff"
        onChange={vi.fn()}
      />,
    );
    expect(within(screen.getByRole('tab', { name: 'Groups' })).queryByText('0')).toBeNull();

    rerender(
      <Tabs
        tabs={[{ key: 'diff', label: 'Groups', count: 3, countDisplay: 'nonzero' }]}
        activeKey="diff"
        onChange={vi.fn()}
      />,
    );
    expect(within(screen.getByRole('tab', { name: /Groups/ })).getByText('3')).toBeInTheDocument();
  });

  it('still badges a zero count by default, where zero is an answer', () => {
    render(
      <Tabs
        tabs={[{ key: 'size', label: 'Groups', count: 0 }]}
        activeKey="size"
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('tab', { name: /Groups/ })).toHaveTextContent('0');
  });

  it('leaves a non-rail tab named by its label alone when it carries an icon', () => {
    render(
      <Tabs
        tabs={[{ key: 'groups', label: 'Groups', icon: 'users' }]}
        activeKey="groups"
        onChange={vi.fn()}
        variant="segmented"
      />,
    );
    expect(screen.getByRole('tab', { name: 'Groups' })).toBeInTheDocument();
  });

  it('supports the segmented variant', () => {
    render(<Tabs tabs={TABS} activeKey="account" onChange={vi.fn()} variant="segmented" />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  describe('rail variant', () => {
    const RAIL_TABS: TabItem[] = [
      { key: 'overview', label: 'Overview', icon: 'chart' },
      { key: 'groups', label: 'Groups', icon: 'users' },
    ];

    it('names every icon-only tab after its label, exactly once', () => {
      render(<Tabs tabs={RAIL_TABS} activeKey="overview" onChange={vi.fn()} variant="rail" />);
      expect(screen.getByRole('tab', { name: 'Groups' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });
  });
});
