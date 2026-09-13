import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import RequestLogRow from './RequestLogRow';
import type { RequestLogEntry } from '../../shared/requestLogTypes';

const recently = Date.now() - 5 * 60 * 1000;

const entry = (overrides: Partial<RequestLogEntry> = {}): RequestLogEntry => ({
  id: 'req_log_1',
  timestamp: recently,
  reason: 'Load group members',
  requestCount: 1,
  endpoints: [{ method: 'GET', endpoint: '/api/v1/groups/00gFAKE0000000000001/users' }],
  endpointsTruncated: false,
  durationMs: 120,
  outcome: 'all',
  ...overrides,
});

const single = entry();

const batch = entry({
  id: 'req_log_batch',
  reason: 'Populate Groups page',
  requestCount: 42,
  endpoints: [
    { method: 'GET', endpoint: '/api/v1/groups?limit=200' },
    { method: 'GET', endpoint: '/api/v1/groups?limit=200&after=00gFAKE0000000000042' },
    { method: 'GET', endpoint: '/api/v1/groups/00gFAKE0000000000001/stats' },
  ],
  endpointsTruncated: false,
  durationMs: 3_400,
});

const truncatedBatch = entry({
  id: 'req_log_truncated',
  reason: 'Org inventory sync: Users',
  requestCount: 200,
  endpoints: Array.from({ length: 20 }, (_, i) => ({
    method: 'GET' as const,
    endpoint: `/api/v1/users?limit=200&after=00uFAKE${String(i).padStart(13, '0')}`,
  })),
  endpointsTruncated: true,
  durationMs: 45_000,
});

const failedBatch = entry({
  id: 'req_log_failed',
  reason: 'Load app assignments',
  requestCount: 3,
  endpoints: [{ method: 'GET', endpoint: '/api/v1/apps/0oaFAKE0000000000001/users' }],
  outcome: 'none',
});

const partialBatch = entry({
  id: 'req_log_partial',
  reason: 'Bulk remove user from group',
  requestCount: 5,
  endpoints: [
    { method: 'DELETE', endpoint: '/api/v1/groups/00gFAKE0000000000001/users/<USER_ID>' },
  ],
  outcome: 'partial',
});

const meta = {
  title: 'Sidepanel/RequestLogRow',
  component: RequestLogRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "One batch of Okta API requests that shared a `reason` — the row the History tab's " +
          '**Verbose** mode adds beside the undo-action rows. A batch of one renders its ' +
          'endpoint inline; a larger batch collapses to `N requests — reason` behind the same ' +
          '`aria-expanded` disclosure `AuditLogRow` uses.\n\n' +
          'Endpoints are redacted by `shared/utils/redact` before storage — this row redacts ' +
          'nothing itself.',
      },
    },
  },
  decorators: [
    (Story: () => React.ReactElement) => (
      <div className="bg-canvas p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    entry: single,
    isExpanded: false,
    onToggle: fn(),
  },
  argTypes: {
    entry: { description: 'The request-log entry this row is about.' },
    isExpanded: {
      description:
        'Whether the disclosure is open. Owned by the list, so a refresh cannot close a row.',
    },
    onToggle: { description: "Toggles this row's disclosure, by entry id." },
  },
} satisfies Meta<typeof RequestLogRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleRequest: Story = {
  args: { entry: single },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Load group members')).toBeVisible();
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};

export const CollapsedBatch: Story = {
  args: { entry: batch, isExpanded: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('42 requests — Populate Groups page')).toBeVisible();
    await expect(canvas.getByRole('button', { expanded: false })).toBeVisible();
  },
};

export const ExpandedBatch: Story = {
  args: { entry: batch, isExpanded: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('/api/v1/groups?limit=200')).toBeVisible();
    await expect(
      canvas.getByText('/api/v1/groups?limit=200&after=00gFAKE0000000000042'),
    ).toBeVisible();
    await expect(canvas.getByText('/api/v1/groups/00gFAKE0000000000001/stats')).toBeVisible();
  },
};

export const TruncatedEndpoints: Story = {
  args: { entry: truncatedBatch, isExpanded: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Showing 20 of 200 requests.')).toBeVisible();
  },
};

export const AllFailed: Story = {
  args: { entry: failedBatch, isExpanded: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Failed')).toBeVisible();
  },
};

export const PartiallyFailed: Story = {
  args: { entry: partialBatch, isExpanded: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Some failed')).toBeVisible();
  },
};

export const OpeningTheDisclosure: Story = {
  args: { entry: batch },
  render: function Disclosure(args) {
    const [expanded, setExpanded] = React.useState(false);
    return (
      <RequestLogRow
        {...args}
        isExpanded={expanded}
        onToggle={(id) => {
          args.onToggle(id);
          setExpanded((open) => !open);
        }}
      />
    );
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: 'Show the 42 requests for Populate Groups page',
    });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    await expect(args.onToggle).toHaveBeenCalledWith('req_log_batch');
    await expect(canvas.getByRole('button', { expanded: true })).toBeVisible();
    await expect(canvas.getByText('/api/v1/groups?limit=200')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { expanded: true }));
    await expect(canvas.getByRole('button', { expanded: false })).toBeVisible();
  },
};

export const Compact: Story = {
  args: { entry: truncatedBatch },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};
