import type { Meta, StoryObj } from '@storybook/react-vite';
import RackLegend from './RackLegend';

const meta = {
  title: 'Sidepanel/Activity/RackLegend',
  component: RackLegend,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The bucket rack’s key: it names the track vocabulary once so six lanes can be read ' +
          'by shape, and it carries the one thing no single lane says — a pale tail is ' +
          'headroom, not absence. Every swatch is `aria-hidden` with the meaning in the text ' +
          'beside it, and the row wraps rather than scrolls on a narrow panel.',
      },
    },
  },
} satisfies Meta<typeof RackLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NarrowPanel: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  decorators: [
    (Story) => (
      <div className="w-[360px] border border-(--color-neutral-200)">
        <Story />
      </div>
    ),
  ],
};
