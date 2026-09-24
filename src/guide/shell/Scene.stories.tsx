import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import Scene from './Scene';
import { Marker } from './Callout';
import { Badge, ListRow } from '../../sidepanel/components/shared';
import '../guide.css';

const meta = {
  title: 'Guide/Shell/Scene',
  component: Scene,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A heading, a sentence, the 440px stage, and the numbered legend beside it. Markers on the stage carry the numbers; the legend carries the sentences. Below the `lg` breakpoint the legend drops under the stage.',
      },
    },
  },
  args: {
    title: 'Search a person',
    stageLabel: 'Users',
    intro: 'Type a name, a login or an email.',
    legend: [
      { text: 'A status badge on every row.' },
      { text: 'The count says how many matched.' },
    ],
    children: (
      <div className="flex flex-col gap-2">
        <Marker n={1}>
          <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
            <ListRow density="compact">
              <span className="text-sm">Amara Okonkwo</span>
              <Badge variant="success">Active</Badge>
            </ListRow>
          </div>
        </Marker>
        <Marker n={2}>
          <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
            <ListRow density="compact">
              <span className="text-sm">Priya Natarajan</span>
              <Badge variant="warning">Suspended</Badge>
            </ListRow>
          </div>
        </Marker>
      </div>
    ),
  },
} satisfies Meta<typeof Scene>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const legend = canvas.getByTestId('guide-legend');
    await expect(within(legend).getAllByRole('listitem')).toHaveLength(2);
  },
};

export const Choreographed: Story = {
  parameters: { motion: 'on' },
  args: {
    legend: [
      { text: 'A status badge on every row.' },
      { text: 'The count says how many matched.' },
      { text: 'Rows arrive after the stage they point at.' },
    ],
    children: (
      <div className="flex flex-col gap-2">
        <Marker n={1}>
          <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
            <ListRow density="compact">
              <span className="text-sm">Amara Okonkwo</span>
              <Badge variant="success">Active</Badge>
            </ListRow>
          </div>
        </Marker>
        <Marker n={2}>
          <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
            <ListRow density="compact">
              <span className="text-sm">Priya Natarajan</span>
              <Badge variant="warning">Suspended</Badge>
            </ListRow>
          </div>
        </Marker>
        <Marker n={3}>
          <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
            <ListRow density="compact">
              <span className="text-sm">2 people</span>
            </ListRow>
          </div>
        </Marker>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const legend = canvas.getByTestId('guide-legend');
    await expect(within(legend).getAllByRole('listitem')).toHaveLength(3);
  },
};

export const WithMinHeight: Story = {
  args: {
    minHeight: 240,
    legend: [{ text: 'The frame holds 240px even when its content is short.' }],
  },
};
