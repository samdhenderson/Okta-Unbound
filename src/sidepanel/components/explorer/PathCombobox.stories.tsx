import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, fn, waitFor } from 'storybook/test';
import React from 'react';
import PathCombobox from './PathCombobox';
import type { HoleCandidate } from '@/sidepanel/apiCatalog/suggest';

const GROUP_CANDIDATES: readonly HoleCandidate[] = [
  { kind: 'group', id: '00gFAKE000000000001', label: 'Engineering', source: 'tab' },
  {
    kind: 'group',
    id: '00gFAKE000000000002',
    label: 'Engineering Leads',
    secondary: 'Rule-fed',
    source: 'snapshot',
  },
  { kind: 'group', id: '00gFAKE000000000003', label: 'Support', source: 'search' },
];

const Host: React.FC<{ initial?: string; candidates?: readonly HoleCandidate[] }> = ({
  initial = '',
  candidates,
}) => {
  const [value, setValue] = React.useState(initial);
  return (
    <div className="p-4 w-[420px]">
      <PathCombobox
        value={value}
        onChange={setValue}
        onSend={fn()}
        canSend
        placeholder="/api/v1/apps"
        candidates={candidates}
      />
    </div>
  );
};

const meta = {
  title: 'Explorer/PathCombobox',
  component: PathCombobox,
  parameters: { layout: 'centered' },
  args: { value: '', onChange: fn(), onSend: fn(), canSend: true },
} satisfies Meta<typeof PathCombobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  render: () => <Host initial="/api/v1/users" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('combobox', { name: 'API path' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
  },
};

export const BrowsingOnFocus: Story = {
  render: () => <Host />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox', { name: 'API path' }));

    const listbox = await canvas.findByRole('listbox', { name: 'Path suggestions' });
    await expect(within(listbox).getByText('Users')).toBeInTheDocument();
    await expect(within(listbox).getAllByRole('option').length).toBeGreaterThan(5);
  },
};

export const NarrowingByPath: Story = {
  render: () => <Host />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', { name: 'API path' });
    await userEvent.type(field, '/api/v1/groups/rules');

    const options = within(await canvas.findByRole('listbox')).getAllByRole('option');
    await expect(options[0]).toHaveTextContent('/api/v1/groups/rules');
    await expect(field).toHaveFocus();
  },
};

export const PointingWithArrows: Story = {
  render: () => <Host />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', { name: 'API path' });
    await userEvent.type(field, '/api/v1/groups');
    await userEvent.keyboard('{ArrowDown}');

    const options = within(await canvas.findByRole('listbox')).getAllByRole('option');
    await expect(field).toHaveAttribute('aria-activedescendant', options[1].id);
    await expect(options[1]).toHaveAttribute('aria-selected', 'true');
    await expect(field).toHaveFocus();

    await userEvent.keyboard('{End}');
    await expect(field).toHaveAttribute('aria-activedescendant', options[options.length - 1].id);
  },
};

export const AcceptingWithEnter: Story = {
  render: () => <Host />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', { name: 'API path' });
    await userEvent.type(field, '/api/v1/groups/rul');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => expect(field).toHaveValue('/api/v1/groups/rules'));
  },
};

export const SelectingTheFirstHole: Story = {
  render: () => <Host />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', { name: 'API path' }) as HTMLInputElement;
    await userEvent.type(field, 'factors');
    await userEvent.keyboard('{Enter}');

    await waitFor(() =>
      expect(field.value.slice(field.selectionStart ?? 0, field.selectionEnd ?? 0)).toBe(
        '{userId}',
      ),
    );
  },
};

export const SuggestingParameters: Story = {
  render: () => <Host />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', { name: 'API path' });
    await userEvent.type(field, '/api/v1/logs?');

    const listbox = await canvas.findByRole('listbox');
    await expect(within(listbox).getByText('Paging')).toBeInTheDocument();
    await expect(within(listbox).getByText('limit')).toBeInTheDocument();
  },
};

export const EscapeClosesWithoutClearing: Story = {
  render: () => <Host />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', { name: 'API path' });
    await userEvent.type(field, '/api/v1/gr');
    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(canvas.queryByRole('listbox')).not.toBeInTheDocument());
    await expect(field).toHaveValue('/api/v1/gr');

    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    await expect(await canvas.findByRole('listbox')).toBeInTheDocument();
  },
};

export const AcceptingWithTheMouse: Story = {
  render: () => <Host />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', { name: 'API path' });
    await userEvent.type(field, '/api/v1/logs');

    const listbox = await canvas.findByRole('listbox');
    await userEvent.click(within(listbox).getAllByRole('option')[0]);

    await waitFor(() => expect(field).toHaveValue('/api/v1/logs'));
  },
};

export const FillingAHole: Story = {
  render: () => <Host candidates={GROUP_CANDIDATES} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', { name: 'API path' });

    await userEvent.type(field, '/api/v1/groups/Eng');

    const listbox = await canvas.findByRole('listbox');
    await expect(within(listbox).getByText('The page you have open')).toBeInTheDocument();

    const options = within(listbox).getAllByRole('option');
    await expect(options[0]).toHaveTextContent('Engineering');
    await expect(options[0]).toHaveTextContent('Open in your tab');

    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(field).toHaveValue('/api/v1/groups/00gFAKE000000000001'));
  },
};

export const AHoleWithNothingFound: Story = {
  render: () => <Host candidates={[]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', { name: 'API path' });
    await userEvent.type(field, '/api/v1/groups/zzz');

    await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
    await expect(field).toHaveAttribute('aria-expanded', 'false');
  },
};
