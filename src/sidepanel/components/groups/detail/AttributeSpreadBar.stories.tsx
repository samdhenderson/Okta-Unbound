import type { Meta, StoryObj } from '@storybook/react-vite';
import AttributeSpreadBar from './AttributeSpreadBar';
import { NONE_VALUE, OTHER_VALUE, type BreakdownRow } from '../../members/memberAnalytics';

const rows: BreakdownRow[] = [
  { value: 'Engineering', label: 'Engineering', count: 402, pct: 31 },
  { value: 'Sales', label: 'Sales', count: 288, pct: 22 },
  { value: 'Support', label: 'Support', count: 190, pct: 15 },
  { value: 'Finance', label: 'Finance', count: 120, pct: 9 },
  { value: NONE_VALUE, label: '(none)', count: 52, pct: 4 },
  { value: OTHER_VALUE, label: 'Other (14 values)', count: 232, pct: 18 },
];

const meta = {
  title: 'Groups/AttributeSpreadBar',
  component: AttributeSpreadBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "One attribute's value composition as a single segmented bar: how the populated " +
          'part is distributed, which the card states nowhere else.\n\n' +
          'Blanks get no segment — an absence is not a value people share — and the folded ' +
          'tail is hatched rather than tinted so it does not read as one more value. The bar ' +
          'is `aria-hidden`: it carries proportions and no labels, over content the card ' +
          'states in text one disclosure away.',
      },
    },
  },
  argTypes: {
    rows: { description: "One attribute's distribution rows." },
    className: { description: 'Layout classes only — never colour.' },
  },
  args: { rows },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AttributeSpreadBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoTail: Story = {
  args: { rows: rows.filter((row) => row.value !== OTHER_VALUE) },
};

export const SingleValue: Story = {
  args: { rows: [{ value: 'Engineering', label: 'Engineering', count: 1284, pct: 100 }] },
};

export const MoreValuesThanRampStops: Story = {
  args: {
    rows: Array.from({ length: 9 }, (_, i) => ({
      value: `V${i}`,
      label: `Value ${i}`,
      count: 100 - i * 8,
      pct: 11,
    })),
  },
};

export const OnlyBlanks: Story = {
  args: { rows: [{ value: NONE_VALUE, label: '(none)', count: 1284, pct: 100 }] },
};
