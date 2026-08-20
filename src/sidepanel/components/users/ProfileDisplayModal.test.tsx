import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import ProfileDisplayModal from './ProfileDisplayModal';
import { DEFAULT_PROFILE_DISPLAY_CONFIG } from '../../../shared/storage/profileDisplayStore';
import type { ProfileDisplayConfig } from '../../../shared/storage/profileDisplayStore';
import type { AttributeDescriptor } from './profileAttributes';

const attribute = (
  name: string,
  kind: AttributeDescriptor['kind'],
  value: string,
): AttributeDescriptor => ({
  key: kind === 'system' ? name : `profile.${name}`,
  name,
  label: name,
  kind,
  value,
  raw: value,
  isEmpty: value === '',
});

const attributes: AttributeDescriptor[] = [
  attribute('login', 'base', 'user@example.com'),
  attribute('lastName', 'base', 'Lovelace'),
  attribute('firstName', 'base', 'Ada'),
  attribute('department', 'custom', ''),
  attribute('id', 'system', '00uFAKE0001'),
];

const config: ProfileDisplayConfig = {
  ...DEFAULT_PROFILE_DISPLAY_CONFIG,
  categories: [
    { key: 'identity', name: 'Identity' },
    { key: 'organization', name: 'Organization' },
  ],
  attrOrder: ['login', 'lastName', 'firstName', 'department', 'id'],
  assign: {
    login: 'identity',
    lastName: '',
    firstName: 'identity',
    department: 'organization',
    id: '',
  },
  hidden: {},
};

function Harness({
  onChange,
  initialConfig = config,
  ruleReads,
}: {
  onChange: (patch: Partial<ProfileDisplayConfig>) => void;
  initialConfig?: ProfileDisplayConfig;
  ruleReads?: Record<string, string[]>;
}) {
  const [current, setCurrent] = useState(initialConfig);
  return (
    <ProfileDisplayModal
      isOpen
      onClose={vi.fn()}
      attributes={attributes}
      config={current}
      onChange={(patch) => {
        onChange(patch);
        setCurrent((previous) => ({ ...previous, ...patch }));
      }}
      onReset={vi.fn()}
      ruleReads={ruleReads}
    />
  );
}

async function openAttributes(
  user: ReturnType<typeof userEvent.setup>,
  onChange = vi.fn(),
  ruleReads?: Record<string, string[]>,
) {
  render(<Harness onChange={onChange} ruleReads={ruleReads} />);
  await user.click(screen.getByRole('tab', { name: /Attributes/ }));
  return onChange;
}

describe('ProfileDisplayModal', () => {
  it('disables the up arrow on the first attribute of a category and the down arrow on the last', async () => {
    const user = userEvent.setup();
    await openAttributes(user);

    expect(screen.getByRole('button', { name: 'Move login up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move login down' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Move firstName up' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Move firstName down' })).toBeDisabled();

    expect(screen.getByRole('button', { name: 'Move department up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move department down' })).toBeDisabled();
  });

  it('moves an attribute within its own category, stepping over attributes in other categories', async () => {
    const user = userEvent.setup();
    const onChange = await openAttributes(user);

    await user.click(screen.getByRole('button', { name: 'Move firstName up' }));

    expect(onChange).toHaveBeenCalledWith({
      attrOrder: ['firstName', 'lastName', 'login', 'department', 'id'],
    });
  });

  it('returns a deleted category’s attributes to Uncategorized without hiding them', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Delete Identity' }));

    const patch = onChange.mock.calls[0][0] as Partial<ProfileDisplayConfig>;
    expect(patch.categories).toEqual([{ key: 'organization', name: 'Organization' }]);
    expect(patch.assign).toMatchObject({ login: '', firstName: '', department: 'organization' });
    expect(patch.hidden).toBeUndefined();

    await user.click(screen.getByRole('tab', { name: /Attributes/ }));
    expect(screen.getByText('4 uncategorized · 0 hidden')).toBeInTheDocument();
  });

  it('hides an attribute from the pane but keeps its row in the list', async () => {
    const user = userEvent.setup();
    const onChange = await openAttributes(user);

    await user.click(screen.getByRole('checkbox', { name: 'Show lastName' }));

    expect(onChange).toHaveBeenCalledWith({ hidden: { lastName: true } });
    const row = screen.getByRole('checkbox', { name: 'Show lastName' });
    expect(row).toBeInTheDocument();
    expect(row).not.toBeChecked();
    expect(screen.getByText('2 uncategorized · 1 hidden')).toBeInTheDocument();
  });

  it('emits a categories patch when a category is renamed in place', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    const field = screen.getByRole('textbox', { name: 'Category 1 name' });
    await user.clear(field);
    await user.type(field, 'People');

    expect(onChange).toHaveBeenLastCalledWith({
      categories: [
        { key: 'identity', name: 'People' },
        { key: 'organization', name: 'Organization' },
      ],
    });
    expect(screen.getByRole('button', { name: 'Delete People' })).toBeInTheDocument();
  });

  it('states how many of this profile’s attributes are empty on this user', async () => {
    render(<Harness onChange={vi.fn()} />);

    expect(screen.getByText('1 of 5 attributes are empty on this user.')).toBeInTheDocument();
  });

  it('emits a live layout patch and a whole-map assign patch', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Compact rows' }));
    expect(onChange).toHaveBeenLastCalledWith({ layout: 'compact' });
    expect(screen.getByRole('button', { name: 'Compact rows' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('tab', { name: /Attributes/ }));
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Category for lastName' }),
      'organization',
    );

    expect(onChange).toHaveBeenLastCalledWith({
      assign: {
        login: 'identity',
        lastName: 'organization',
        firstName: 'identity',
        department: 'organization',
        id: '',
      },
    });
  });

  it('filters the list without removing an attribute from the configuration', async () => {
    const user = userEvent.setup();
    await openAttributes(user, vi.fn(), { firstName: ['Engineering rule'] });

    await user.click(screen.getByRole('button', { name: 'Read by rules' }));

    expect(screen.getByRole('checkbox', { name: 'Show firstName' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Show login' })).not.toBeInTheDocument();
    expect(screen.getByText('2 uncategorized · 0 hidden')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^All 5$/ }));
    expect(screen.getByRole('checkbox', { name: 'Show login' })).toBeInTheDocument();
  });

  it('adds a category that attributes can immediately be filed under', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await user.type(screen.getByRole('textbox', { name: 'New category name' }), 'Contact & locale');
    await user.click(screen.getByRole('button', { name: 'Add category' }));

    expect(onChange).toHaveBeenLastCalledWith({
      categories: [
        { key: 'identity', name: 'Identity' },
        { key: 'organization', name: 'Organization' },
        { key: 'contact-locale', name: 'Contact & locale' },
      ],
    });

    await user.click(screen.getByRole('tab', { name: /Attributes/ }));
    const select = screen.getByRole('combobox', { name: 'Category for login' });
    expect(within(select).getByRole('option', { name: 'Contact & locale' })).toBeInTheDocument();
  });

  it('keeps the inactive tab out of the accessibility tree', async () => {
    const user = userEvent.setup();
    render(<Harness onChange={vi.fn()} />);

    expect(screen.queryByRole('textbox', { name: 'Find an attribute' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /Attributes/ }));

    expect(screen.getByRole('searchbox', { name: 'Find an attribute' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'New category name' })).not.toBeInTheDocument();
  });
});
