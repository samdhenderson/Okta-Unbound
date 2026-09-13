import { useState, type ComponentType } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import ComparisonAttributeRow from './ComparisonAttributeRow';
import type { AttributeParityRow, AttributeVerdict } from './attributeParity';
import type { AttributeEditCell } from '../../../hooks/useProfileEdit';

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

const editCell = (name: string, over: Partial<AttributeEditCell> = {}): AttributeEditCell => ({
  name,
  editability: { editable: true, control: 'text', required: false },
  dirty: false,
  onChange: fn(),
  ...over,
});

const inList = (Story: ComponentType) => (
  <ul className="divide-y divide-neutral-100 rounded-md border border-neutral-200 bg-white">
    <Story />
  </ul>
);

const meta = {
  title: 'Users/Comparison/ComparisonAttributeRow',
  component: ComparisonAttributeRow,
  tags: ['autodocs'],
  decorators: [inList],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "One row of the comparison's Attributes tab: the attribute's name and annotations, " +
          "then the two users' values with an equality marker between them. The marker is not " +
          'a control — a `role="img"` span showing `=` or `≠`, two glyphs so the state never ' +
          'rides on colour — and values wrap rather than truncate, because two values differing ' +
          'only in their tails would render identically beside a `≠` nobody could explain.\n\n' +
          'Either side is editable: given a cell for a side, that side delegates to ' +
          '`ProfileEditCell`, so an attribute locked in the Profile pane is locked identically ' +
          'here. The marker does not follow the typing — `=` / `≠` is a statement about what ' +
          'Okta holds — and a dirty side carries an `Edited` badge instead.',
      },
    },
  },
  args: {
    row: row('department', 'Department', 'Engineering', 'Design', 'differs'),
    contextName: 'Ada Context',
    comparedName: 'Bo Compared',
    showApiNames: false,
  },
  argTypes: {
    row: {
      description: "The attribute and both users' values for it, from `attributeParityRows`.",
    },
    contextName: { description: 'Display name of the context user (baseline) — the LEFT cell.' },
    comparedName: { description: 'Display name of the compared user — the RIGHT cell.' },
    showApiNames: {
      description:
        'Render the Okta name in mono instead of the human label (`config.showApiNames`).',
    },
    readers: {
      description:
        'Names of the rules that read this attribute and currently grant either user access. Absent renders no chip.',
    },
    contextCell: {
      description:
        "The context user's editing cell, joined by `row.name`. Present only while that column is editing.",
    },
    comparedCell: {
      description: "The compared user's editing cell. Same contract as `contextCell`.",
    },
  },
} satisfies Meta<typeof ComparisonAttributeRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Differs: Story = {};

export const Same: Story = {
  args: { row: row('userType', 'User type', 'Employee', 'Employee', 'same') },
};

export const OnlyContext: Story = {
  args: { row: row('manager', 'Manager', 'dana@example.com', '', 'onlyContext') },
};

export const OnlyCompared: Story = {
  args: { row: row('costCenter', 'Cost center', '', 'CC-42', 'onlyCompared') },
};

export const BothEmpty: Story = {
  args: { row: row('nickName', 'Nickname', '', '', 'bothEmpty') },
};

export const WithRuleChip: Story = {
  args: { readers: ['Engineering → VPN Access', 'Contractors → VPN Access'] },
};

export const ApiName: Story = {
  args: { showApiNames: true },
};

export const HiddenByConfig: Story = {
  args: {
    row: row('employeeNumber', 'Employee number', 'E-0001', 'E-0002', 'differs', {
      hiddenByConfig: true,
    }),
  },
};

export const LongValuesCompact: Story = {
  args: {
    row: row(
      'streetAddress',
      'Street address',
      '1 Example Street, Exampleton, EX1 2AB, Exampleshire',
      '1 Example Street, Exampleton, EX1 2AC, Exampleshire',
      'differs',
    ),
  },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};

export const EditingOneSide: Story = {
  args: { comparedCell: editCell('department') },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByLabelText('Department')).toHaveValue('Design'));
    expect(canvas.getByRole('img', { name: 'The two users have different values' })).toBeVisible();
  },
};

export const EditedDraft: Story = {
  args: {
    comparedCell: editCell('department', { draft: 'Engineering', dirty: true }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByTitle(/Bo Compared has an unsaved change/)).toBeInTheDocument(),
    );
    expect(canvas.getByRole('img', { name: 'The two users have different values' })).toBeVisible();
  },
};

export const BothSidesEdited: Story = {
  args: {
    contextCell: editCell('department', { draft: 'Design', dirty: true }),
    comparedCell: editCell('department', { draft: 'Design', dirty: true }),
  },
};

export const LockedWhileEditing: Story = {
  args: {
    comparedCell: editCell('department', {
      editability: {
        editable: false,
        reason: 'externally-mastered',
        explanation:
          'An external system masters this attribute (Active Directory), so it is changed there rather than here.',
      },
      onChange: undefined,
    }),
  },
};

export const InvalidDraft: Story = {
  args: {
    comparedCell: editCell('department', {
      draft: '',
      dirty: true,
      invalid: 'Department is required.',
    }),
  },
};

export const EditingCompact: Story = {
  args: {
    contextCell: editCell('department'),
    comparedCell: editCell('department', { draft: 'Engineering', dirty: true }),
  },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};

export const TypingDoesNotMoveTheMarker: Story = {
  render: function Live(args) {
    const [draft, setDraft] = useState<string | undefined>(undefined);
    return (
      <ComparisonAttributeRow
        {...args}
        comparedCell={{
          name: 'department',
          editability: { editable: true, control: 'text', required: false },
          draft,
          dirty: draft !== undefined && draft !== args.row.comparedValue,
          onChange: setDraft,
        }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = await canvas.findByLabelText('Department');

    await userEvent.clear(field);
    await userEvent.type(field, 'Engineering');

    await expect(field).toHaveValue('Engineering');
    await expect(canvas.getByTitle(/Bo Compared has an unsaved change/)).toBeInTheDocument();
    await expect(
      canvas.getByRole('img', { name: 'The two users have different values' }),
    ).toBeVisible();
  },
};
