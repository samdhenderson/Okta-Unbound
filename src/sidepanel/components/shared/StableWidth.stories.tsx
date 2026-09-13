import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import StableWidth from './StableWidth';

const meta = {
  title: 'Shared/StableWidth',
  component: StableWidth,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "Reserves the width a slot will need by rendering its widest state invisibly in the same grid cell, so a label that changes after mount cannot re-lay-out the `min-w-0` text beside it. A hard-coded `min-w-[…]` would be a guess about a font the panel does not control; the hidden twin lets the browser measure it in the reader's own font.\n\n" +
          "The twin is `aria-hidden`, `invisible`, and carries `data-reserve-width`, which the test setup adds to Testing Library's `defaultIgnore` — so a text query sees exactly what a reader sees. It reserves the box but does not stabilise digits: a numeric readout still needs `tabular-nums`.",
      },
    },
  },
  argTypes: {
    reserve: { description: 'The widest state this slot will ever hold.' },
    children: { description: 'What is actually shown.' },
    align: { description: 'How the live child sits in the reserved box; `start` by default.' },
    className: { description: 'Extra classes for the outer box — layout only.' },
  },
  args: {
    reserve: 'Not evaluated',
    children: 'Pass',
  },
} satisfies Meta<typeof StableWidth>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HoldsTheRowStill: Story = {
  render: () => (
    <div className="max-w-[360px] space-y-2">
      {['Pass', 'Not evaluated'].map((label) => (
        <div key={label} className="flex items-start gap-3 rounded-md border p-2">
          <p className="min-w-0 flex-1 font-mono text-xs break-words">
            user.department == &quot;Engineering&quot; AND isMemberOfAnyGroup(&quot;00gFAKE&quot;)
          </p>
          <StableWidth reserve="Not evaluated" align="end">
            <span className="rounded-md border px-2 py-0.5 text-xs whitespace-nowrap">{label}</span>
          </StableWidth>
        </div>
      ))}
    </div>
  ),
};

export const ReservedBeforeTheValueArrives: Story = {
  args: { reserve: '00', children: null, align: 'center' },
};

export const NumericReadout: Story = {
  args: {
    reserve: '100%',
    align: 'end',
    children: <span className="font-mono text-sm font-bold tabular-nums">7%</span>,
  },
};

export const TheTwinIsNotQueryable: Story = {
  args: { reserve: 'Not evaluated', children: 'Pass' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Pass')).toBeInTheDocument();
    await expect(canvas.queryByText('Not evaluated')).not.toBeInTheDocument();
  },
};
