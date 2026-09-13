import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import Icon, { type IconType } from './Icon';

const meta = {
  title: 'Shared/Icon',
  component: Icon,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Inline SVG icon registry: maps an icon name to a Tailwind-sized, `currentColor`-stroked SVG, so call sites reference glyphs by name with no external icon library. Sizes are `xs` (12px), `sm` (16px), `md` (20px), `lg` (24px), `xl` (32px); pass a colour token through `className`. See `AllIcons` for the catalog.\n\n' +
          "Every glyph is `aria-hidden` unless `label` says it carries meaning of its own. `label` is **not** how an icon-only control gets its name — that comes from the control (`IconButton`'s `label`, or an `aria-label`).",
      },
    },
  },
  argTypes: {
    type: { description: 'Which glyph to render (see the `AllIcons` catalog).' },
    className: { description: 'Extra classes merged after the size class (e.g. a color token).' },
    size: {
      description: 'Preset square dimensions: xs=12px, sm=16px, md=20px, lg=24px, xl=32px.',
    },
    label: {
      description:
        'Accessible name, for the rare glyph that *is* the answer. Omit it and the icon leaves the accessibility tree.',
    },
  },
  args: {
    type: 'check',
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('img')).not.toBeInTheDocument();
  },
};

export const NamedWhenTheGlyphIsTheAnswer: Story = {
  args: { type: 'shield', label: 'MFA enrolled' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('img', { name: 'MFA enrolled' })).toBeInTheDocument();
  },
};

export const ExtraSmall: Story = {
  args: {
    size: 'xs',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
  },
};

export const Users: Story = {
  args: {
    type: 'users',
  },
};

export const Alert: Story = {
  args: {
    type: 'alert',
  },
};

export const Settings: Story = {
  args: {
    type: 'settings',
  },
};

export const Upload: Story = {
  args: {
    type: 'upload',
  },
};

export const Pencil: Story = {
  args: {
    type: 'pencil',
  },
};

export const WithCustomColor: Story = {
  args: {
    type: 'bolt',
    className: 'text-primary',
  },
};

export const AllIcons: Story = {
  render: () => {
    const iconTypes: IconType[] = [
      'users',
      'user',
      'check',
      'alert',
      'bolt',
      'chart',
      'app',
      'building',
      'home',
      'lock',
      'refresh',
      'download',
      'upload',
      'settings',
      'trash',
      'pencil',
      'grip',
      'eye',
      'eye-off',
      'plus',
      'minus',
      'search',
      'link',
      'list',
      'hand',
      'key',
      'sparkles',
      'pause',
      'shield',
      'clipboard',
      'clipboard-check',
      'chevron-left',
      'chevron-down',
      'chevron-right',
    ];

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
        {iconTypes.map((type) => (
          <div
            key={type}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <Icon type={type} size="lg" />
            <span style={{ fontSize: 12, textAlign: 'center' }}>{type}</span>
          </div>
        ))}
      </div>
    );
  },
};
