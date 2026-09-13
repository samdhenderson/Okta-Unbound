import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import SortPill from './SortPill';

const meta = {
  title: 'Shared/SortPill',
  component: SortPill,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A sort-toggle pill: a `FilterPill` that shows a directional caret when its field is the ' +
          'active sort, rotating it for descending order. Generic over the caller’s sort-field ' +
          'union, so a filter panel gets a type-safe set of pills instead of hand-rolled buttons.',
      },
    },
  },
  argTypes: {
    field: { description: 'The sort field this pill selects.' },
    label: { description: 'Label shown on the pill.' },
    activeField: { description: 'The currently active sort field.' },
    descending: { description: 'Whether the active sort is descending.' },
    onToggle: { description: 'Called with this pill’s field when clicked.' },
  },
  args: {
    field: 'name',
    label: 'Name',
    onToggle: fn(),
  },
} satisfies Meta<typeof SortPill<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inactive: Story = {
  args: { activeField: 'status', descending: false },
};

export const ActiveAscending: Story = {
  args: { activeField: 'name', descending: false },
};

export const ActiveDescending: Story = {
  args: { activeField: 'name', descending: true },
};

type SortField = 'name' | 'status' | 'factors';

const FIELDS: { field: SortField; label: string }[] = [
  { field: 'name', label: 'Name' },
  { field: 'status', label: 'Status' },
  { field: 'factors', label: 'Factor count' },
];

export const Interactive: Story = {
  args: { activeField: 'name', descending: false },
  render: (args) => {
    const Harness = () => {
      const [activeField, setActiveField] = useState<SortField>('name');
      const [descending, setDescending] = useState(false);
      const toggle = (field: SortField) => {
        args.onToggle(field);
        if (field === activeField) setDescending((d) => !d);
        else {
          setActiveField(field);
          setDescending(false);
        }
      };
      return (
        <div className="flex items-center gap-1.5">
          {FIELDS.map(({ field, label }) => (
            <SortPill
              key={field}
              field={field}
              label={label}
              activeField={activeField}
              descending={descending}
              onToggle={toggle}
            />
          ))}
          <span data-testid="direction">{descending ? 'descending' : 'ascending'}</span>
        </div>
      );
    };
    return <Harness />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole('button', { name: /Status/ });

    await expect(canvas.getByRole('button', { name: /Name/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await userEvent.click(status);
    await expect(status).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByRole('button', { name: /Name/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await expect(canvas.getByTestId('direction')).toHaveTextContent('ascending');

    await userEvent.click(status);
    await expect(canvas.getByTestId('direction')).toHaveTextContent('descending');
  },
};
