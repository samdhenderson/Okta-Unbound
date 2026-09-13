import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import ColumnPicker from './ColumnPicker';
import type { ExportColumn } from '../../export/types';

const catalog: ExportColumn<unknown>[] = [
  { id: 'id', label: 'User ID', group: 'base', defaultEnabled: true, accessor: () => '00uFAKE' },
  { id: 'status', label: 'Status', group: 'base', defaultEnabled: true, accessor: () => 'ACTIVE' },
  { id: 'created', label: 'Created', group: 'base', defaultEnabled: false, accessor: () => '' },
  {
    id: 'email',
    label: 'Email',
    group: 'profile',
    defaultEnabled: true,
    accessor: () => 'user@example.com',
  },
  {
    id: 'firstName',
    label: 'First Name',
    group: 'profile',
    defaultEnabled: true,
    accessor: () => 'Ada',
  },
  {
    id: 'department',
    label: 'Department',
    group: 'profile',
    defaultEnabled: false,
    accessor: () => 'Engineering',
  },
];

const meta = {
  title: 'Export/ColumnPicker',
  component: ColumnPicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "Groups the descriptor's catalog into `Identity`, `Profile` and `Custom` buckets — " +
          'empty buckets are skipped — and renders each column as a toggle chip. Fully ' +
          'controlled: the enabled set and the toggling belong to the Export tab hook.',
      },
    },
  },
  argTypes: {
    catalog: {
      description: "The descriptor's full column catalog (grouped and rendered as chips).",
    },
    enabled: { description: 'Ids of the currently enabled columns.' },
    onToggle: { description: 'Toggle a single column on/off by id.' },
  },
  args: {
    catalog,
    enabled: new Set(['id', 'status', 'email', 'firstName']),
    onToggle: fn(),
  },
} satisfies Meta<typeof ColumnPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Minimal: Story = {
  args: { enabled: new Set(['email']) },
};

export const AllEnabled: Story = {
  args: { enabled: new Set(catalog.map((column) => column.id)) },
};

export const Interactive: Story = {
  render: (args) => {
    const Harness = () => {
      const [enabled, setEnabled] = useState(new Set(['id', 'status', 'email', 'firstName']));
      return (
        <ColumnPicker
          {...args}
          enabled={enabled}
          onToggle={(id) =>
            setEnabled((previous) => {
              const next = new Set(previous);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            })
          }
        />
      );
    };
    return <Harness />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const created = canvas.getByRole('button', { name: 'Created' });
    await expect(created).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(created);
    await expect(created).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(created);
    await expect(created).toHaveAttribute('aria-pressed', 'false');
  },
};
