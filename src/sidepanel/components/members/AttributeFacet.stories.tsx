import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import AttributeFacet from './AttributeFacet';
import { discoverAttributeBreakdowns, NONE_VALUE, OTHER_VALUE } from './memberAnalytics';
import type { AttributeSummary } from './memberAnalytics';
import { mockUsers } from '../../../test/mocks/fixtures';

const discovered = discoverAttributeBreakdowns(mockUsers);
const departmentSummary = discovered.find((a) => a.key === 'department') ?? discovered[0];

const manyValuesSummary: AttributeSummary = {
  key: 'title',
  label: 'Title',
  distinct: 9,
  populated: 940,
  total: 1000,
  fillRate: 94,
  rows: [
    { value: 'Software Engineer', label: 'Software Engineer', count: 320, pct: 32 },
    { value: 'Product Manager', label: 'Product Manager', count: 210, pct: 21 },
    { value: 'Designer', label: 'Designer', count: 150, pct: 15 },
    { value: 'Support Engineer', label: 'Support Engineer', count: 90, pct: 9 },
    { value: NONE_VALUE, label: '(none)', count: 60, pct: 6 },
    { value: OTHER_VALUE, label: 'Other (5 values)', count: 170, pct: 17 },
  ],
};

const meta = {
  title: 'Members/AttributeFacet',
  component: AttributeFacet,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "Compact card visualizing one profile attribute's value distribution as clickable filters: " +
          'a segmented spread bar plus a legend of the leading values. Every segment and legend entry ' +
          'toggles a member-list filter; the value count opens the full distribution.',
      },
    },
  },
  argTypes: {
    summary: { description: 'The attribute and its precomputed value distribution.' },
    activeValues: {
      description: 'Canonical values currently active as filters for this attribute.',
    },
    onToggleValue: { description: 'Toggle a value as a member-list filter.' },
    onExpand: { description: 'Open the full value distribution for this attribute.' },
  },
  args: {
    summary: departmentSummary,
    activeValues: new Set<string>(),
    onToggleValue: fn(),
    onExpand: fn(),
  },
} satisfies Meta<typeof AttributeFacet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ManyValues: Story = {
  args: { summary: manyValuesSummary },
};

export const WithActiveFilter: Story = {
  args: {
    summary: manyValuesSummary,
    activeValues: new Set(['Product Manager']),
  },
};

export const Filtering: Story = {
  args: { summary: manyValuesSummary },
  render: (args) => {
    const Harness = () => {
      const [active, setActive] = useState<Set<string>>(new Set());
      return (
        <AttributeFacet
          {...args}
          activeValues={active}
          onToggleValue={(row) =>
            setActive((prev) => {
              const next = new Set(prev);
              if (next.has(row.value)) next.delete(row.value);
              else next.add(row.value);
              return next;
            })
          }
        />
      );
    };
    return <Harness />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const legendEntry = canvas.getByRole('button', { name: /^Product Manager/ });
    await expect(legendEntry).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(legendEntry);
    await expect(canvas.getByRole('button', { name: /^Product Manager/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  },
};

export const LowFillRate: Story = {
  args: {
    summary: {
      ...manyValuesSummary,
      fillRate: 62,
    },
  },
};
