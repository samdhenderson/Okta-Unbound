import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CopyIconButton from './CopyIconButton';

const stubClipboard = (writeText: ReturnType<typeof vi.fn>): ReturnType<typeof vi.fn> => {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  return writeText;
};

describe('CopyIconButton', () => {
  it('flips its accessible name to a confirmation after a successful copy', async () => {
    const user = userEvent.setup();
    const writeText = stubClipboard(vi.fn().mockResolvedValue(undefined));

    render(<CopyIconButton value="00gFAKE1a2b3c4d5e6" label="Copy group id" />);

    await user.click(screen.getByRole('button', { name: 'Copy group id' }));

    expect(writeText).toHaveBeenCalledWith('00gFAKE1a2b3c4d5e6');
    expect(await screen.findByRole('button', { name: 'Copied!' })).toBeInTheDocument();
  });

  it('stays in its resting state when the clipboard write is refused', async () => {
    const user = userEvent.setup();
    const writeText = stubClipboard(vi.fn().mockRejectedValue(new Error('blocked')));

    render(<CopyIconButton value="00gFAKE1a2b3c4d5e6" label="Copy group id" />);

    await user.click(screen.getByRole('button', { name: 'Copy group id' }));

    expect(writeText).toHaveBeenCalledWith('00gFAKE1a2b3c4d5e6');
    expect(screen.getByRole('button', { name: 'Copy group id' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copied!' })).not.toBeInTheDocument();
  });
});
