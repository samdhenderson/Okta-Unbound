import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import RuleConsolidationModal from './RuleConsolidationModal';
import type {
  ConsolidationPreview,
  ConsolidationResult,
  RetireRuleRef,
} from '../hooks/useRuleConsolidation';

const mockGroupHits = [
  { id: 'grp1', name: 'Engineering' },
  { id: 'grp2', name: 'Engineering Managers' },
  { id: 'grp3', name: 'Engineering Contractors' },
];

const mockRetireRules: RetireRuleRef[] = [
  { id: 'rule1', name: 'Engineering - US', status: 'ACTIVE' },
  { id: 'rule2', name: 'Engineering - EU', status: 'ACTIVE' },
];

const mockPreview: ConsolidationPreview = {
  mode: 'add-target',
  baseName: 'Engineering - US',
  resultingName: 'Engineering - US (consolidated)',
  resultingGroupIds: ['grp1', 'grp2'],
  addedGroupIds: ['grp2'],
  addedGroupNames: ['Engineering Managers'],
  retireRules: mockRetireRules,
  willActivate: true,
};

const mockMergePreview: ConsolidationPreview = {
  mode: 'merge',
  baseName: 'Engineering - US',
  resultingName: 'Engineering (consolidated)',
  resultingGroupIds: ['grp1', 'grp3'],
  addedGroupIds: ['grp3'],
  addedGroupNames: ['Engineering Contractors'],
  retireRules: mockRetireRules,
  willActivate: true,
};

const mockResult: ConsolidationResult = {
  createdRuleId: 'rule99',
  createdRuleName: 'Engineering - US (consolidated)',
  retired: 2,
  retireFailed: 0,
};

const meta = {
  title: 'Components/RuleConsolidationModal',
  component: RuleConsolidationModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Wizard for rule consolidation (Feature A4).\n\n' +
          'Add-target flow: search-select a group to add → dry-run diff → confirm. Merge flow: opens straight to the diff for a cluster of identical-expression rules. The confirm step creates the union rule, activates it if needed, then retires the source rule(s). All writes are audited and captured for undo.\n\n' +
          '**Related internals:** [Hooks](?path=/docs/internals-hooks--docs)',
      },
    },
  },
  args: {
    phase: 'select',
    preview: null,
    result: null,
    error: null,
    searchGroups: fn(async () => mockGroupHits),
    onChooseGroup: fn(),
    onExecute: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof RuleConsolidationModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { phase: 'loading' },
};

export const AddTargetPreview: Story = {
  args: { phase: 'preview', preview: mockPreview },
};

export const MergePreview: Story = {
  args: { phase: 'preview', preview: mockMergePreview },
};

export const Running: Story = {
  args: { phase: 'running' },
};

export const Done: Story = {
  args: { phase: 'done', result: mockResult },
};

export const Failed: Story = {
  args: { phase: 'error', error: 'Failed to create the consolidated rule: rate limited.' },
};
