import type { ComponentProps } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ComparisonAttributesTab from './ComparisonAttributesTab';
import type { AttributeParityRow, AttributeVerdict } from './attributeParity';
import type { AttributeEditCell } from '../../../hooks/useProfileEdit';
import type { ComparisonEditSide } from '../../../hooks/useComparisonProfileEdit';
import {
  DEFAULT_PROFILE_DISPLAY_CONFIG,
  type ProfileDisplayConfig,
} from '../../../../shared/storage/profileDisplayStore';

const row = (
  name: string,
  label: string,
  contextValue: string,
  comparedValue: string,
  verdict: AttributeVerdict,
  over: Partial<AttributeParityRow> = {},
): AttributeParityRow => ({
  key: `profile.${name}`,
  name,
  label,
  kind: 'base',
  contextValue,
  comparedValue,
  verdict,
  categoryKey: 'organization',
  hiddenByConfig: false,
  ...over,
});

const ROWS: AttributeParityRow[] = [
  row('department', 'Department', 'Engineering', 'Design', 'differs'),
  row('manager', 'Manager', 'dana@example.com', '', 'onlyContext'),
  row('userType', 'User type', 'Employee', 'Employee', 'same', { categoryKey: 'identity' }),
  row('nickName', 'Nickname', '', '', 'bothEmpty', { categoryKey: '' }),
];

const HIDDEN_ROWS: AttributeParityRow[] = [
  row('employeeNumber', 'Employee number', 'E-0001', 'E-0002', 'differs', {
    hiddenByConfig: true,
  }),
];

const CONFIG: ProfileDisplayConfig = {
  ...DEFAULT_PROFILE_DISPLAY_CONFIG,
  categories: [
    { key: 'identity', name: 'Identity' },
    { key: 'organization', name: 'Organization' },
  ],
};

const editCell = (name: string, over: Partial<AttributeEditCell> = {}): AttributeEditCell => ({
  name,
  editability: { editable: true, control: 'text', required: false },
  dirty: false,
  onChange: vi.fn(),
  ...over,
});

const editingSide = (
  key: 'context' | 'compared',
  userName: string,
  cells: Record<string, AttributeEditCell>,
  over: Partial<ComparisonEditSide> = {},
): ComparisonEditSide => ({
  key,
  userName,
  cells,
  isEditing: true,
  isSaving: false,
  hasChanges: false,
  hasInvalid: false,
  canEdit: true,
  begin: vi.fn(),
  cancel: vi.fn(),
  requestSave: vi.fn(),
  ...over,
});

const renderTab = (over: Partial<ComponentProps<typeof ComparisonAttributesTab>> = {}) =>
  render(
    <ComparisonAttributesTab
      contextName="Ada Context"
      comparedName="Bo Compared"
      rows={ROWS}
      hiddenRows={HIDDEN_ROWS}
      hiddenDifferences={1}
      config={CONFIG}
      ruleReads={{ department: ['Engineering → VPN Access'] }}
      {...over}
    />,
  );

describe('ComparisonAttributesTab', () => {
  it('opens on the differences, so an agreement is not listed until All is chosen', () => {
    renderTab();
    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.queryByText('User type')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^All/ }));
    expect(screen.getByText('User type')).toBeInTheDocument();
    expect(screen.getByText('Nickname')).toBeInTheDocument();
  });

  it('names both users on a one-sided row rather than leaving the gap to inference', () => {
    renderTab();
    expect(screen.getByRole('img', { name: 'Only Ada Context has a value' })).toBeInTheDocument();
  });

  it('filters on a value, not only on the attribute name', () => {
    renderTab();
    fireEvent.change(screen.getByLabelText('Filter attributes by name or value'), {
      target: { value: 'engineering' },
    });
    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.queryByText('Manager')).not.toBeInTheDocument();
  });

  it('says how many differing attributes the display config is hiding', () => {
    const singular = renderTab();
    expect(
      screen.getByText('1 differing attribute hidden by your display config'),
    ).toBeInTheDocument();
    singular.unmount();

    renderTab({
      hiddenRows: [...HIDDEN_ROWS, row('costCenter', 'Cost center', '', 'CC-42', 'onlyCompared')],
      hiddenDifferences: 2,
    });
    expect(
      screen.getByText('2 differing attributes hidden by your display config'),
    ).toBeInTheDocument();
  });

  it('says nothing about hidden attributes when none of them differ', () => {
    renderTab({ hiddenDifferences: 0 });
    expect(screen.queryByRole('button', { name: 'Show' })).not.toBeInTheDocument();
    expect(screen.queryByText(/hidden by your display config/)).not.toBeInTheDocument();
  });

  it('reveals a hidden row into its own category, and counts it once revealed', () => {
    renderTab();
    expect(screen.queryByText('Employee number')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Differences 2' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Show' }));

    const organization = screen.getByRole('list', { name: 'Organization' });
    expect(within(organization).getByText('Employee number')).toBeInTheDocument();
    expect(
      within(organization).getByTitle(/display configuration hides this attribute/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Differences 3' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Hide' }));
    expect(screen.queryByText('Employee number')).not.toBeInTheDocument();
  });

  it('honours showRuleChips: the admin turning the chips off turns them off here too', () => {
    const withChips = renderTab();
    expect(screen.getByText('1 rule')).toBeInTheDocument();
    withChips.unmount();

    renderTab({ config: { ...CONFIG, showRuleChips: false } });
    expect(screen.queryByText('1 rule')).not.toBeInTheDocument();
  });

  it('turns one side into controls and leaves the other side reading', () => {
    renderTab({
      comparedEdit: editingSide('compared', 'Bo Compared', {
        department: editCell('department'),
      }),
    });

    expect(screen.getByLabelText('Department')).toHaveValue('Design');
    expect(screen.getAllByLabelText('Department')).toHaveLength(1);
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('marks the edited side instead of moving the equality marker or the counts', () => {
    renderTab({
      comparedEdit: editingSide(
        'compared',
        'Bo Compared',
        { department: editCell('department', { draft: 'Engineering', dirty: true }) },
        { hasChanges: true },
      ),
    });

    expect(
      screen.getByRole('img', { name: 'The two users have different values' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Differences 2' })).toBeInTheDocument();

    const badge = screen.getByTitle(/Bo Compared has an unsaved change/);
    expect(badge).toHaveTextContent('Edited');
    expect(badge.getAttribute('title')).toContain('Saving would make the two values match');
  });

  it('names the side holding the draft when both columns are edited', () => {
    renderTab({
      contextEdit: editingSide('context', 'Ada Context', {
        department: editCell('department', { draft: 'Design', dirty: true }),
      }),
      comparedEdit: editingSide('compared', 'Bo Compared', {
        department: editCell('department', { draft: 'Design', dirty: true }),
      }),
    });

    expect(screen.getByTitle(/Ada Context has an unsaved change/)).toBeInTheDocument();
    expect(screen.getByTitle(/Bo Compared has an unsaved change/)).toBeInTheDocument();
  });

  it('keeps a hidden row on screen while it holds a draft, disclosure collapsed or not', () => {
    renderTab({
      comparedEdit: editingSide('compared', 'Bo Compared', {
        employeeNumber: editCell('employeeNumber', { draft: 'E-0003', dirty: true }),
      }),
    });

    expect(screen.getByRole('button', { name: 'Show' })).toBeInTheDocument();
    const organization = screen.getByRole('list', { name: 'Organization' });
    expect(within(organization).getByText('Employee number')).toBeInTheDocument();
    expect(
      within(organization).getByTitle(/display configuration hides this attribute/),
    ).toBeInTheDocument();
  });

  it('names each edit affordance for the user it writes to', () => {
    renderTab({
      contextEdit: editingSide('context', 'Ada Context', {}, { isEditing: false }),
      comparedEdit: editingSide('compared', 'Bo Compared', {}, { isEditing: false }),
    });

    expect(screen.getByRole('button', { name: 'Edit Ada Context' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Bo Compared' })).toBeInTheDocument();
  });

  it('offers nothing at all for a column that cannot publish a save', () => {
    renderTab({
      contextEdit: editingSide('context', 'Ada Context', {}, { isEditing: false, canEdit: false }),
      comparedEdit: editingSide('compared', 'Bo Compared', {}, { isEditing: false }),
    });

    expect(screen.queryByRole('button', { name: 'Edit Ada Context' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Bo Compared' })).toBeInTheDocument();
  });

  it('distinguishes "nothing matches" from "nothing to compare"', () => {
    const empty = renderTab({ rows: [], hiddenRows: [], hiddenDifferences: 0 });
    expect(screen.getByText('No attributes to compare')).toBeInTheDocument();
    empty.unmount();

    renderTab();
    fireEvent.change(screen.getByLabelText('Filter attributes by name or value'), {
      target: { value: 'zzzz' },
    });
    expect(screen.getByText('No attributes match')).toBeInTheDocument();
  });
});
