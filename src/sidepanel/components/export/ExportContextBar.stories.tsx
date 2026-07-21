import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import ExportContextBar from './ExportContextBar';
import type { EntityContextOption } from '../../export/types';

const searchGroups = async (query: string): Promise<EntityContextOption[]> => {
  const all: EntityContextOption[] = [
    { id: '00gFAKE001', label: 'Engineering', sublabel: 'OKTA_GROUP' },
    { id: '00gFAKE002', label: 'Engineering Managers', sublabel: 'OKTA_GROUP' },
    { id: '00gFAKE003', label: 'Sales', sublabel: 'APP_GROUP' },
  ];
  return all.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));
};

const meta = {
  title: 'Export/ExportContextBar',
  component: ExportContextBar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    label: 'Group',
    placeholder: 'Search groups…',
    search: searchGroups,
    onSelect: fn(),
  },
} satisfies Meta<typeof ExportContextBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
