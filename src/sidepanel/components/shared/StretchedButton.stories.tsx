import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import StretchedButton from './StretchedButton';
import IconButton from './IconButton';
import Checkbox from './Checkbox';
import Icon from '../shared/Icon';

const meta = {
  title: 'Shared/StretchedButton',
  component: StretchedButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The "stretched link" pattern as a real `<button>`: an empty, absolutely-positioned button covering its positioned ancestor, so clicking anywhere on a card activates it without a `role="button"` div or a card wrapped in a button.\n\n' +
          '**Layout contract:** the click target must be `relative`, and the card’s own controls `relative z-10` or they sit under the overlay. Every card in a list shares one label, so pass `describedBy` pointing at the element that names this card.',
      },
    },
  },
  argTypes: {
    label: { description: 'Accessible name — required, since the button has no visible content.' },
    onClick: { description: 'Activation handler.' },
    describedBy: {
      description: '`id` of the element that names this specific card (usually its title).',
    },
    title: { description: 'Tooltip text; defaults to `label`.' },
    disabled: { description: 'Disables activation.' },
    className: { description: 'Extra classes merged after the base positioning classes.' },
  },
  args: {
    label: 'View group details',
    onClick: fn(),
  },
} satisfies Meta<typeof StretchedButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="relative w-80 rounded-md border border-neutral-200 bg-white px-3 py-2">
      <StretchedButton {...args} describedBy="stretched-demo-name" />
      <div className="flex items-center gap-2">
        <span className="relative z-10">
          <Checkbox checked={false} onChange={fn()} aria-label="Select Engineering" />
        </span>
        <h3 id="stretched-demo-name" className="text-sm font-semibold text-neutral-900">
          Engineering
        </h3>
        <span className="relative z-10 ml-auto">
          <IconButton label="Expand" size="sm">
            <Icon type="chevron-right" size="sm" />
          </IconButton>
        </span>
      </div>
      <p className="mt-0.5 text-xs text-neutral-600">
        Click anywhere on the card — except the two controls — to activate.
      </p>
    </div>
  ),
};

export const Focus: Story = {
  ...Default,
  parameters: { pseudo: { focusVisible: true } },
};

export const Disabled: Story = {
  ...Default,
  args: { disabled: true },
};

export const Pressed: Story = {
  ...Default,
  parameters: { pseudo: { active: true } },
};

export const ActivatingTheCard: Story = {
  ...Default,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select Engineering' }));
    await expect(args.onClick).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole('button', { name: 'View group details' }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
