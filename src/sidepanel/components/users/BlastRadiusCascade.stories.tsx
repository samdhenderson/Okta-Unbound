import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import BlastRadiusCascade from './BlastRadiusCascade';
import type { CascadeLine } from './cascadeLines';

const line = (
  over: Partial<CascadeLine> & Pick<CascadeLine, 'ruleId' | 'ruleName'>,
): CascadeLine => ({
  direction: 'toward-match',
  matchedBy: 'name',
  targetGroupNames: ['Finance'],
  ...over,
});

const meta = {
  title: 'Users/BlastRadiusCascade',
  component: BlastRadiusCascade,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '**Every line is structure, not a prediction.** This rule reads this group; it named it this way; it assigns these groups. Nothing here claims the rule will fire, and the footer names that absence once rather than hedging every line.\n\n' +
          '**No count, and no negative.** The scan under-reports by design, so a group with no cascade renders nothing at all rather than asserting a completeness the engine cannot back. One component serves both row types: a group row passes the group it is about, a rule row one block per group it assigns into.',
      },
    },
  },
  args: {
    groups: [
      {
        groupId: '00gFAKEnewhires1',
        groupName: 'New Hires',
        lines: [line({ ruleId: '0prFAKErule00061', ruleName: 'Downstream feeder' })],
      },
    ],
  },
} satisfies Meta<typeof BlastRadiusCascade>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OneRule: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Downstream feeder')).toBeInTheDocument();
    await expect(canvas.getByText(/Finance/)).toBeInTheDocument();
    await expect(canvas.getByText('Toward matching')).toBeInTheDocument();
    await expect(canvas.getByText(/prediction stops at one hop/i)).toBeInTheDocument();
    await expect(canvas.queryByText('New Hires')).toBeNull();
  },
};

export const EveryDirection: Story = {
  args: {
    groups: [
      {
        groupId: '00gFAKEnewhires1',
        groupName: 'New Hires',
        lines: [
          line({ ruleId: '0prFAKErule00071', ruleName: 'Downstream feeder' }),
          line({
            ruleId: '0prFAKErule00072',
            ruleName: 'Contractor guard',
            direction: 'away-from-match',
            targetGroupNames: ['Vendors', 'Temp Access'],
          }),
          line({
            ruleId: '0prFAKErule00073',
            ruleName: 'Both ways rule',
            direction: 'undetermined',
            targetGroupNames: [],
          }),
        ],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Toward matching')).toBeInTheDocument();
    await expect(canvas.getByText('Away from matching')).toBeInTheDocument();
    await expect(canvas.getByText('Uses it both ways')).toBeInTheDocument();
    const bothWays = canvas.getByText('Both ways rule').closest('li');
    await expect(bothWays?.textContent).not.toMatch(/Assigns/);
  },
};

export const PatternMatch: Story = {
  args: {
    groups: [
      {
        groupId: '00gFAKEnewhires1',
        groupName: 'New Hires',
        lines: [
          line({
            ruleId: '0prFAKErule00081',
            ruleName: 'Prefix feeder',
            matchedBy: 'nameStartsWith',
          }),
        ],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Matched by name pattern/)).toBeInTheDocument();
  },
};

export const TwoGroups: Story = {
  args: {
    groups: [
      {
        groupId: '00gFAKEnewhires1',
        groupName: 'New Hires',
        lines: [line({ ruleId: '0prFAKErule00091', ruleName: 'Downstream feeder' })],
      },
      {
        groupId: '00gFAKEemea00001',
        groupName: 'EMEA',
        lines: [
          line({
            ruleId: '0prFAKErule00092',
            ruleName: 'EMEA tooling',
            targetGroupNames: ['EMEA-Tools'],
          }),
        ],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('New Hires')).toBeInTheDocument();
    await expect(canvas.getByText('EMEA')).toBeInTheDocument();
    await expect(canvas.getAllByText(/prediction stops at one hop/i)).toHaveLength(1);
  },
};

export const Compact: Story = {
  parameters: { viewport: { value: 'sidepanelCompact' } },
  args: {
    groups: [
      {
        groupId: '00gFAKEnewhires1',
        groupName: 'New Hires',
        lines: [
          line({
            ruleId: '0prFAKErule00101',
            ruleName: 'EMEA sales enablement — contractors only, phase two',
            targetGroupNames: ['emea-sales-enablement-contractors-2026'],
          }),
        ],
      },
    ],
  },
};
