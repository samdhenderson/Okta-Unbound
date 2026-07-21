import type { Meta, StoryObj } from '@storybook/react-vite';
import ExportPreviewTable from './ExportPreviewTable';
import type { ExportColumn } from '../../export/types';

interface FakeRow {
  id: string;
  status: string;
  email: string;
}

const columns: ExportColumn<unknown>[] = [
  {
    id: 'id',
    label: 'User ID',
    group: 'base',
    defaultEnabled: true,
    accessor: (r) => (r as FakeRow).id,
  },
  {
    id: 'status',
    label: 'Status',
    group: 'base',
    defaultEnabled: true,
    accessor: (r) => (r as FakeRow).status,
  },
  {
    id: 'email',
    label: 'Email',
    group: 'profile',
    defaultEnabled: true,
    accessor: (r) => (r as FakeRow).email,
  },
];

const rows: FakeRow[] = Array.from({ length: 12 }, (_, i) => ({
  id: `00uFAKE${String(i).padStart(4, '0')}`,
  status: i % 3 === 0 ? 'SUSPENDED' : 'ACTIVE',
  email: `user${i}@example.com`,
}));

const meta = {
  title: 'Export/ExportPreviewTable',
  component: ExportPreviewTable,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    columns,
    rows,
    fetched: rows.length,
    dropped: 0,
    capped: false,
    linkify: { entityType: 'user', idColumnId: 'id' },
    oktaOrigin: 'https://example.okta.com',
  },
} satisfies Meta<typeof ExportPreviewTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDropped: Story = {
  args: { fetched: rows.length + 3, dropped: 3 },
};

export const Capped: Story = {
  args: { capped: true },
};

export const Empty: Story = {
  args: { rows: [], fetched: 0 },
};

export const AllDropped: Story = {
  args: { rows: [], fetched: 12, dropped: 12 },
};
