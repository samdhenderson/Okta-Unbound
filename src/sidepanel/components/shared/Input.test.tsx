import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import Input from './Input';

describe('Input', () => {
  it('reports typed characters through onChange', async () => {
    const onChange = vi.fn();
    render(<Input value="" onChange={onChange} placeholder="Name" />);
    await userEvent.type(screen.getByPlaceholderText('Name'), 'Ab');
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenNthCalledWith(1, 'A');
    expect(onChange).toHaveBeenNthCalledWith(2, 'b');
  });

  it('forwards key events via onKeyDown', async () => {
    const onKeyDown = vi.fn();
    render(<Input value="" onChange={() => {}} placeholder="Search" onKeyDown={onKeyDown} />);
    const input = screen.getByPlaceholderText('Search');
    input.focus();
    await userEvent.keyboard('{Enter}');
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onKeyDown.mock.calls[0][0].key).toBe('Enter');
  });

  it('focuses on mount when autoFocus is set', () => {
    render(<Input value="" onChange={() => {}} placeholder="Auto" autoFocus />);
    expect(screen.getByPlaceholderText('Auto')).toHaveFocus();
  });

  it('exposes the underlying input through inputRef', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input value="" onChange={() => {}} placeholder="Ref" inputRef={ref} />);
    expect(ref.current).toBe(screen.getByPlaceholderText('Ref'));
  });

  it('renders a label and an error message', () => {
    render(<Input value="" onChange={() => {}} label="Email" error="Required" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('associates the label with the field, and names the error as its description', () => {
    render(<Input value="" onChange={() => {}} label="Email" error="Required" />);
    const input = screen.getByLabelText('Email');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Required');
  });

  it('describes the field by its hint when there is no error', () => {
    render(<Input value="" onChange={() => {}} label="Email" hint="Work address" />);
    const input = screen.getByLabelText('Email');

    expect(input).toHaveAccessibleDescription('Work address');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('does not emit changes while disabled', async () => {
    const onChange = vi.fn();
    render(<Input value="" onChange={onChange} placeholder="Locked" disabled />);
    const input = screen.getByPlaceholderText('Locked');
    expect(input).toBeDisabled();
    await userEvent.type(input, 'x');
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('Input combobox mode', () => {
  const combobox = {
    expanded: true,
    listboxId: 'path-listbox',
    activeOptionId: 'path-option-2',
  };

  it('renders no combobox attributes at all when the mode is off', () => {
    render(<Input value="" onChange={() => {}} placeholder="Plain" />);
    const input = screen.getByPlaceholderText('Plain');

    expect(input).not.toHaveAttribute('role');
    expect(input).not.toHaveAttribute('aria-expanded');
    expect(input).not.toHaveAttribute('aria-controls');
    expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(input).not.toHaveAttribute('aria-autocomplete');
    expect(input).not.toHaveAttribute('autocomplete');
  });

  it('wires the field to the listbox the consumer renders', () => {
    render(<Input value="" onChange={() => {}} ariaLabel="API path" combobox={combobox} />);
    const input = screen.getByRole('combobox', { name: 'API path' });

    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-controls', 'path-listbox');
    expect(input).toHaveAttribute('aria-activedescendant', 'path-option-2');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
  });

  it('points at no option when none is active', () => {
    render(
      <Input
        value=""
        onChange={() => {}}
        ariaLabel="API path"
        combobox={{ ...combobox, activeOptionId: undefined }}
      />,
    );

    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-activedescendant');
  });

  it('collapses when the list is closed', () => {
    render(
      <Input
        value=""
        onChange={() => {}}
        ariaLabel="API path"
        combobox={{ ...combobox, expanded: false }}
      />,
    );

    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });

  it("turns off the browser's own suggestions, which would sit over the listbox", () => {
    render(<Input value="" onChange={() => {}} ariaLabel="API path" combobox={combobox} />);

    expect(screen.getByRole('combobox')).toHaveAttribute('autocomplete', 'off');
  });

  it('keeps focus in the field while the active option changes', async () => {
    const { rerender } = render(
      <Input value="/api/v1/g" onChange={() => {}} ariaLabel="API path" combobox={combobox} />,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    input.focus();
    input.setSelectionRange(4, 4);

    rerender(
      <Input
        value="/api/v1/g"
        onChange={() => {}}
        ariaLabel="API path"
        combobox={{ ...combobox, activeOptionId: 'path-option-5' }}
      />,
    );

    expect(input).toHaveFocus();
    expect(input.selectionStart).toBe(4);
  });

  it('reports caret moves through onSelect', async () => {
    const onSelect = vi.fn();
    render(
      <Input value="/api/v1/groups" onChange={() => {}} placeholder="Path" onSelect={onSelect} />,
    );
    const input = screen.getByPlaceholderText('Path') as HTMLInputElement;
    input.focus();
    await userEvent.keyboard('{ArrowLeft}');

    expect(onSelect).toHaveBeenCalled();
  });

  it('reports focus through onFocus, so a list can reopen on re-entry', async () => {
    const onFocus = vi.fn();
    render(<Input value="" onChange={() => {}} placeholder="Path" onFocus={onFocus} />);

    await userEvent.click(screen.getByPlaceholderText('Path'));

    expect(onFocus).toHaveBeenCalled();
  });
});
