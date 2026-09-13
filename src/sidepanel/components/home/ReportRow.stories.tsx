import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { RowDisclosure } from './ReportRow';
import FigureNumber from './FigureNumber';

const meta = {
  title: 'Home/ReportRow',
  component: RowDisclosure,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The row idiom Home’s reports card is built from: a leading figure, two lines, and ' +
          'a panel that opens in place. The header is a real `<button>` wrapping the row’s ' +
          'content, which buys `aria-expanded`/`aria-controls` with no extra element — every ' +
          'control the row offers lives in the panel, outside that button.',
      },
    },
  },
  args: {
    rowKey: 'demo',
    figure: <FigureNumber value={31} />,
    label: 'Empty groups nothing fills',
    note: 'of 214 groups',
    children: <p className="text-xs text-neutral-600">The panel body the caller supplies.</p>,
  },
  decorators: [
    (Story) => (
      <ul className="divide-y divide-neutral-100 overflow-hidden rounded-md border border-neutral-200 bg-white">
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof RowDisclosure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { expanded: false })).toBeInTheDocument();
    await expect(canvas.queryByText(/panel body/)).not.toBeInTheDocument();
  },
};

export const Opened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await expect(canvas.getByRole('button', { expanded: true })).toBeInTheDocument();
    await expect(canvas.getByText(/panel body/)).toBeInTheDocument();
  },
};

export const Warned: Story = {
  args: { note: 'At least — the last read of groups did not finish.', warn: true },
};
