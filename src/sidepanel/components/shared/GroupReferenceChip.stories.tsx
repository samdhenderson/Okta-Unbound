import type { Meta, StoryObj } from '@storybook/react-vite';
import GroupReferenceChip from './GroupReferenceChip';
import type { ClauseGroupReference } from '../../../shared/rules/explainExpression';

const names: Record<string, string> = { '00gFAKECHIP1': 'Engineering — Platform' };
const resolveGroupName = (groupId: string): string | undefined => names[groupId];

const meta = {
  title: 'Shared/GroupReferenceChip',
  component: GroupReferenceChip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'One group an `isMemberOf*` clause named, as a small primary-tinted chip. The ' +
          'satisfied/unsatisfied glyph renders only when `hasContext` says a `RuleGroupContext` ' +
          'was supplied — without one, `reference.satisfied` would read as a verdict on ' +
          'membership nobody checked.\n\n' +
          'The three pattern kinds never name a single group, so their label stays a ' +
          'mono-quoted phrase naming the pattern — `startsWith "SecOps-"`.',
      },
    },
  },
  argTypes: {
    reference: { description: 'The group reference to render.' },
    hasContext: {
      description:
        'Whether a `RuleGroupContext` was supplied. Gates the satisfied/unsatisfied glyph.',
    },
    resolveGroupName: { description: "Names an `id`-match reference's raw id." },
  },
  args: { hasContext: true, resolveGroupName },
} satisfies Meta<typeof GroupReferenceChip>;

export default meta;
type Story = StoryObj<typeof meta>;

const idSatisfied: ClauseGroupReference = {
  match: 'id',
  value: '00gFAKECHIP1',
  satisfied: true,
  matchedGroupName: 'Engineering — Platform',
};

const idUnsatisfied: ClauseGroupReference = {
  match: 'id',
  value: '00gFAKECHIP9',
  satisfied: false,
};

const nameSatisfied: ClauseGroupReference = {
  match: 'name',
  value: 'Contractors — EMEA',
  satisfied: true,
  matchedGroupName: 'Contractors — EMEA',
};

const startsWithUnsatisfied: ClauseGroupReference = {
  match: 'nameStartsWith',
  value: 'SecOps-',
  satisfied: false,
};

const containsSatisfied: ClauseGroupReference = {
  match: 'nameContains',
  value: 'Platform',
  satisfied: true,
  matchedGroupName: 'Engineering — Platform',
};

const regexUnsatisfied: ClauseGroupReference = {
  match: 'nameRegex',
  value: '^Eng-.*',
  satisfied: false,
};

export const IdSatisfied: Story = { args: { reference: idSatisfied } };

export const IdUnsatisfied: Story = { args: { reference: idUnsatisfied } };

export const NameSatisfied: Story = { args: { reference: nameSatisfied } };

export const StartsWithUnsatisfied: Story = { args: { reference: startsWithUnsatisfied } };

export const ContainsSatisfied: Story = { args: { reference: containsSatisfied } };

export const RegexUnsatisfied: Story = { args: { reference: regexUnsatisfied } };

export const NoContext: Story = { args: { reference: idSatisfied, hasContext: false } };

export const CompactPanel: Story = {
  args: {
    reference: {
      match: 'id',
      value: '00gFAKELONGID001122',
      satisfied: true,
      matchedGroupName: 'Engineering-Platform-Infrastructure-Observability',
    },
  },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};
