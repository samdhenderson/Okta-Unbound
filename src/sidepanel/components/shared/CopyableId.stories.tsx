import type { Meta, StoryObj } from '@storybook/react-vite';
import CopyableId from './CopyableId';

const meta = {
  title: 'Shared/CopyableId',
  component: CopyableId,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A truncating `<code>` beside a ghost `IconButton` whose glyph and accessible name flip to a confirmation after a copy.\n\n' +
          'Use it for a single identifier in a line of metadata; `CopyButton` is the labelled control for copying a body of text.',
      },
    },
  },
  argTypes: {
    value: { description: 'The identifier to render and copy.' },
    label: { description: 'Accessible name for the copy control, e.g. “Copy group id”.' },
    className: { description: 'Extra classes merged onto the wrapper.' },
  },
  args: {
    value: '00gFAKE1a2b3c4d5e6',
    label: 'Copy group id',
  },
} satisfies Meta<typeof CopyableId>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const UserId: Story = {
  args: { value: '00uFAKE9z8y7x6w5v', label: 'Copy user id' },
};

export const Truncated: Story = {
  args: { value: '00gFAKE1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9' },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};
