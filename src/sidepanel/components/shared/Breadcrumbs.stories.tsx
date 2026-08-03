import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
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
          'Ordered `nav > ol` trail of crumbs separated by a chevron, used for push/pop sub-navigation inside a tab.\n\n' +
          'Every crumb except the last is a button that navigates back up the trail; the last crumb is the ' +
          'view currently on screen and renders as non-interactive text carrying `aria-current="page"`. ' +
          'Labels truncate rather than wrap the header, so a long group name stays on one line in the ' +
          'narrow side panel. It shapes exactly to the `trail` returned by `useViewStack`, so a tab shell ' +
          'can pass that through unchanged.\n\n' +
          '**Related internals:** [Hooks](?path=/docs/internals-hooks--docs)',
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
