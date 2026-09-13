import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
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
  parameters: {
    layout: 'centered',
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
    docs: {
      description: {
        component:
          'For descriptors scoped to a parent entity (a group, an app), the admin picks that ' +
          'entity here before any rows are fetched. The type-ahead is debounced and needs two ' +
          'characters; the chosen option goes to the tab hook, and clearing reports `null`.',
      },
    },
  },
  argTypes: {
    label: { description: 'Field label for the picker (e.g. `Group`).' },
    placeholder: { description: 'Placeholder for the search input.' },
    search: { description: 'Type-ahead search over candidate context entities.' },
    onSelect: {
      description: 'Called with the chosen entity, or `null` when the selection is cleared.',
    },
  },
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

export const WithResults: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Search groups…');
    await userEvent.type(input, 'Eng');

    const match = await canvas.findByText('Engineering Managers');
    await userEvent.click(match);

    await expect(args.onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: '00gFAKE002', label: 'Engineering Managers' }),
    );
  },
};

export const PreSelected: Story = {
  args: {
    initialSelected: { id: '00gFAKE001', label: 'Engineering', sublabel: 'OKTA_GROUP' },
  },
};

export const AppContext: Story = {
  args: {
    label: 'App',
    placeholder: 'Search apps…',
    search: async (query: string): Promise<EntityContextOption[]> =>
      [
        { id: '0oaFAKE001', label: 'Salesforce', sublabel: 'SAML 2.0' },
        { id: '0oaFAKE002', label: 'Slack', sublabel: 'OIDC' },
      ].filter((option) => option.label.toLowerCase().includes(query.toLowerCase())),
  },
};
