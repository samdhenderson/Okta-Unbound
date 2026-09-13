import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import CollapsibleSection from './CollapsibleSection';
import { Checkbox } from './index';

const meta = {
  title: 'Shared/CollapsibleSection',
  component: CollapsibleSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Bordered card whose clickable header toggles its body open or closed. It owns its open state (uncontrolled, seeded by `defaultOpen`), and the header button carries `aria-expanded`/`aria-controls` for the body region.\n\n' +
          "The body animates via the shared `.disclose` grid wrapper, so children **stay mounted while collapsed** — held out of the tab order and the accessible tree with `inert`. Don't rely on collapsing to reset or unmount body state.",
      },
    },
  },
  argTypes: {
    title: { description: 'Header label.' },
    defaultOpen: { description: 'Whether the section starts expanded. Defaults to `true`.' },
    children: {
      description: 'Body content. Stays mounted (and `inert`) while the section is collapsed.',
    },
    itemCount: { description: 'Optional count rendered as a small badge next to the title.' },
  },
  args: {
    title: 'Advanced Filters',
    defaultOpen: true,
    children: <FilterOptions options={['Option A', 'Option B']} />,
  },
} satisfies Meta<typeof CollapsibleSection>;

export default meta;
type Story = StoryObj<typeof meta>;

function FilterOptions({ options }: { options: readonly string[] }) {
  const [ticked, setTicked] = useState<readonly string[]>([]);
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => (
        <Checkbox
          key={option}
          label={option}
          checked={ticked.includes(option)}
          onChange={(next) =>
            setTicked((previous) =>
              next ? [...previous, option] : previous.filter((o) => o !== option),
            )
          }
        />
      ))}
    </div>
  );
}

export const Default: Story = {};

export const Closed: Story = {
  args: { defaultOpen: false },
};

export const WithItemCount: Story = {
  args: { itemCount: 3 },
};

export const WithZeroCount: Story = {
  args: { itemCount: 0 },
};

export const TogglingTheSection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByRole('button', { name: /Advanced Filters/ });
    await expect(header).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(canvas.getByLabelText('Option A'));
    await expect(canvas.getByLabelText('Option A')).toBeChecked();

    await userEvent.click(header);
    await expect(header).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(header);
    await expect(header).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByLabelText('Option A')).toBeChecked();
  },
};

export const MotionShowcase: Story = {
  parameters: { motion: 'on' },
  args: {
    title: 'Advanced Filters',
    defaultOpen: false,
    itemCount: 2,
  },
};

export const WithLongContent: Story = {
  args: {
    title: 'Permissions',
    children: (
      <FilterOptions
        options={['View users', 'Edit users', 'Delete users', 'Manage groups', 'View reports']}
      />
    ),
  },
};
