import type { Meta, StoryObj } from '@storybook/react-vite';
import Icon from '../overview/shared/Icon';
import LoadingSpinner from './LoadingSpinner';

const meta = {
  title: 'Shared/LoadingSpinner',
  component: LoadingSpinner,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Spinning loading indicator with `role="status"`; optional caption and centering.\n\n' +
          'With neither `message` nor `centered`, renders a bare inline spinner; otherwise it is wrapped in a centered column with the message beneath.\n\n' +
          'Five sizes: `sm` (16px), `md` (20px), `lg` (24px), `xl` (32px, the default), `2xl` (48px). The first four names mean the same pixels they do in the `Icon` registry, so a spinner can be asked for by the size name of the glyph it sits beside or replaces.',
      },
    },
  },
  argTypes: {
    size: { description: 'Spinner size. Defaults to `xl` (32px).' },
    message: { description: 'Optional caption rendered below the spinner.' },
    centered: { description: 'Center the spinner (and message) within a padded flex block.' },
    className: { description: 'Extra classes merged onto the spinner element.' },
  },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Medium: Story = {
  args: { size: 'md' },
};

export const Large: Story = {
  args: { size: 'lg' },
};

export const ExtraLarge: Story = {
  args: { size: 'xl' },
};

export const TwoExtraLarge: Story = {
  args: { size: '2xl' },
};

export const WithMessage: Story = {
  args: { message: 'Loading data…' },
};

export const Centered: Story = {
  args: { centered: true },
};

export const CenteredWithMessage: Story = {
  args: { size: '2xl', message: 'Please wait…', centered: true },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-6">
      {(['sm', 'md', 'lg', 'xl', '2xl'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <LoadingSpinner {...args} size={size} />
          <span className="text-neutral-600 text-xs">{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const MatchesIconScale: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Icon type="search" size="md" className="text-neutral-400" />
      <LoadingSpinner {...args} size="md" />
      <span className="text-neutral-700 text-sm">Searching…</span>
    </div>
  ),
};
