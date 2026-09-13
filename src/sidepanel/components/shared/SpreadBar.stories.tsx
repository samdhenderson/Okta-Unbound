import type { Meta, StoryObj } from '@storybook/react-vite';
import SpreadBar from './SpreadBar';
import type { SpreadBarSegment } from './SpreadBar';
import {
  CHART_NONE_COLOR,
  CHART_OTHER_COLOR,
  INDIGO_RAMP,
  MFA_ENROLLMENT_PAINT,
} from '../../theme/chartPalette';

const rampSegments: SpreadBarSegment[] = [
  { key: 'engineering', title: 'Engineering — 402 (31%)', count: 402, background: INDIGO_RAMP[0] },
  { key: 'sales', title: 'Sales — 288 (22%)', count: 288, background: INDIGO_RAMP[1] },
  { key: 'support', title: 'Support — 190 (15%)', count: 190, background: INDIGO_RAMP[2] },
  { key: 'finance', title: 'Finance — 120 (9%)', count: 120, background: INDIGO_RAMP[3] },
  { key: 'none', title: '(none) — 52 (4%)', count: 52, background: CHART_NONE_COLOR },
  {
    key: 'other',
    title: 'Other (14 values) — 232 (18%)',
    count: 232,
    background: CHART_OTHER_COLOR,
  },
];

const mfaSegments: SpreadBarSegment[] = [
  {
    key: 'none',
    title: 'No factors enrolled — 2 (5%)',
    count: 2,
    background: MFA_ENROLLMENT_PAINT.none,
  },
  {
    key: 'single',
    title: 'One factor — 7 (18%)',
    count: 7,
    background: MFA_ENROLLMENT_PAINT.single,
  },
  {
    key: 'multiple',
    title: 'Two or more factors — 31 (78%)',
    count: 31,
    background: MFA_ENROLLMENT_PAINT.multiple,
  },
];

const meta = {
  title: 'Shared/SpreadBar',
  component: SpreadBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A distribution as a single segmented bar: each segment is sized by `count` through `flex-grow`, so any consistent unit works, and a one-member segment keeps a minimum width. The component owns the geometry only — which colour a segment takes is always the caller’s decision, from the theme chart palette.\n\n' +
          'The bar is `aria-hidden` and its tooltips are pointer-only, so a caller that renders it **must** state the same distribution in words somewhere a screen reader reaches. The stories below do that in the caption under each bar.',
      },
    },
  },
  argTypes: {
    segments: { description: 'The segments to draw, in order; empty renders nothing.' },
    className: { description: 'Layout classes only — never colour.' },
  },
  args: { segments: rampSegments },
  decorators: [
    (Story) => (
      <div className="w-72 space-y-1">
        <Story />
        <p className="text-xs text-neutral-600">
          The distribution this bar draws is stated in words by whichever card renders it.
        </p>
      </div>
    ),
  ],
} satisfies Meta<typeof SpreadBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const BucketKeyedPaint: Story = {
  args: { segments: mfaSegments },
};

export const SingleSegment: Story = {
  args: { segments: [rampSegments[0]] },
};

export const TinySegment: Story = {
  args: {
    segments: [
      { key: 'bulk', title: 'Engineering — 999', count: 999, background: INDIGO_RAMP[0] },
      { key: 'sliver', title: 'Facilities — 1', count: 1, background: INDIGO_RAMP[3] },
    ],
  },
};

export const Empty: Story = {
  args: { segments: [] },
};
