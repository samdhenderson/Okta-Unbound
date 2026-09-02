import { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TabNavigation from './TabNavigation';
import TabJumpPalette from './TabJumpPalette';
import { useCommandPalette } from '../hooks/useCommandPalette';
import { RAIL_TAB_DEFS, type TabType } from '../tabs';

function Shell() {
  const palette = useCommandPalette();
  const [activeTab, setActiveTab] = useState<TabType>('home');

  return (
    <>
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCommandPalette={palette.open}
        shortcutPlatform="other"
      />
      <TabJumpPalette
        isOpen={palette.isOpen}
        onClose={palette.close}
        activeTab={activeTab}
        onSelect={setActiveTab}
      />
    </>
  );
}

const shortcutButton = () =>
  screen.getByRole('button', { name: 'Search and jump to a section, Ctrl K' });

describe('TabNavigation ⌘K affordance', () => {
  it('opens the palette when pressed', async () => {
    render(<Shell />);

    expect(screen.queryByRole('dialog')).toBeNull();

    await userEvent.click(shortcutButton());

    expect(await screen.findByRole('dialog')).toHaveAccessibleName('Jump to section');
  });

  it('reaches a section the rail has no seat for', async () => {
    render(<Shell />);

    expect(screen.queryByRole('tab', { name: 'Explorer' })).toBeNull();

    await userEvent.click(shortcutButton());
    await userEvent.click(await screen.findByRole('button', { name: /^Explorer/ }));

    expect(screen.queryByRole('dialog')).toBeNull();
    for (const tab of screen.getAllByRole('tab')) {
      expect(tab).toHaveAttribute('aria-selected', 'false');
    }
  });

  it('sits beside the tablist rather than inside it', () => {
    render(<Shell />);

    const rail = screen.getByRole('tablist', { name: 'Main sections' });
    expect(within(rail).queryByRole('button', { name: /Search and jump/ })).toBeNull();
    expect(screen.getAllByRole('tab')).toHaveLength(RAIL_TAB_DEFS.length);
  });
});
