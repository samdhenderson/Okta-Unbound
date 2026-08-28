import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tooltip from './Tooltip';

const Subject = ({ disabled = false }: { disabled?: boolean }) => (
  <Tooltip label="Groups" disabled={disabled}>
    {(trigger) => (
      <button type="button" aria-label="Groups" {...trigger}>
        icon
      </button>
    )}
  </Tooltip>
);

const PAST_HOVER_INTENT_MS = 600;

const sleepPastHoverIntent = () =>
  act(() => new Promise((resolve) => setTimeout(resolve, PAST_HOVER_INTENT_MS)));

describe('Tooltip', () => {
  it('holds the chip back until the hover-intent threshold has passed', async () => {
    const user = userEvent.setup();
    render(<Subject />);

    await user.hover(screen.getByRole('button', { name: 'Groups' }));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Groups');
  });

  it('describes its trigger only while the chip is open', async () => {
    const user = userEvent.setup();
    render(<Subject />);
    const trigger = screen.getByRole('button', { name: 'Groups' });

    expect(trigger).not.toHaveAttribute('aria-describedby');

    await user.hover(trigger);
    const chip = await screen.findByRole('tooltip');
    expect(trigger.getAttribute('aria-describedby')).toBe(chip.id);

    await user.unhover(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(trigger).not.toHaveAttribute('aria-describedby');
  });

  it('opens on focus, so a keyboard user gets the same affordance', async () => {
    render(<Subject />);
    act(() => {
      screen.getByRole('button', { name: 'Groups' }).focus();
    });

    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
  });

  it('closes on Escape and leaves focus where it was', async () => {
    const user = userEvent.setup();
    render(<Subject />);
    const trigger = screen.getByRole('button', { name: 'Groups' });

    act(() => {
      trigger.focus();
    });
    await screen.findByRole('tooltip');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('never opens while disabled', async () => {
    const user = userEvent.setup();
    render(<Subject disabled />);

    await user.hover(screen.getByRole('button', { name: 'Groups' }));
    await sleepPastHoverIntent();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
