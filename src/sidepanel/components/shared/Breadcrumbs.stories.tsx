import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import Breadcrumbs from './Breadcrumbs';

const meta = {
  title: 'Shared/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Ordered `nav > ol` trail for push/pop sub-navigation inside a tab, shaped to the ' +
          '`trail` `useViewStack` returns. Every crumb but the last is a button back up the ' +
          'trail; the last is the current view and renders as text carrying ' +
          '`aria-current="page"`. Labels truncate rather than wrap.',
      },
    },
  },
  argTypes: {
    items: {
      description: 'The trail, root-first. The last item is treated as the current view.',
    },
    size: { description: 'Density preset — `sm` is the compact side-panel default.' },
    ariaLabel: { description: 'Accessible name for the `nav` landmark. Defaults to `Breadcrumb`.' },
    className: { description: 'Extra classes on the `nav` wrapper.' },
  },
  args: {
    items: [
      { key: 'root', label: 'Groups', onSelect: fn() },
      { key: 'detail', label: 'Engineering' },
    ],
  },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RootOnly: Story = {
  args: {
    items: [{ key: 'root', label: 'Groups' }],
  },
};

export const DeepStack: Story = {
  args: {
    items: [
      { key: 'root', label: 'Groups', onSelect: fn() },
      { key: 'g1', label: 'Engineering', onSelect: fn() },
      { key: 'g2', label: 'Engineering — Platform', onSelect: fn() },
      { key: 'g3', label: 'Members' },
    ],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Members')).toHaveAttribute('aria-current', 'page');
    await expect(canvas.queryByRole('button', { name: 'Members' })).toBeNull();

    await userEvent.click(canvas.getByRole('button', { name: 'Engineering' }));
    await expect(args.items[1].onSelect).toHaveBeenCalledTimes(1);
  },
};

export const LongLabels: Story = {
  args: {
    items: [
      { key: 'root', label: 'Groups', onSelect: fn() },
      {
        key: 'detail',
        label: 'Corp — Engineering — Platform — Identity Infrastructure — On Call',
      },
    ],
  },
};

export const SizeMedium: Story = {
  args: {
    size: 'md',
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
};
