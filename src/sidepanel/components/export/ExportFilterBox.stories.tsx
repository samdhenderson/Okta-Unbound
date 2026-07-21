import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import ExportFilterBox from './ExportFilterBox';

const meta = {
  title: 'Export/ExportFilterBox',
  component: ExportFilterBox,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    value: '',
    onChange: fn(),
    help: 'Optional Okta `search` expression (SCIM). Leave blank to export all users.',
    placeholder: 'status eq "ACTIVE" and profile.department eq "Sales"',
    matchCount: null,
    matchCountLoading: false,
    disabled: false,
  },
} satisfies Meta<typeof ExportFilterBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checking: Story = {
  args: { value: 'status eq "ACTIVE"', matchCountLoading: true },
};

export const Matching: Story = {
  args: { value: 'status eq "ACTIVE"', matchCount: { count: 200, hasMore: true } },
};

export const NoMatches: Story = {
  args: { value: 'status eq "TYPO"', matchCount: { count: 0, hasMore: false } },
};

export const Disabled: Story = {
  args: { disabled: true },
};
