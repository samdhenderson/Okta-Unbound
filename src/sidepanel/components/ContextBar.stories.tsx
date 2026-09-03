import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import ContextBar from './ContextBar';

const meta = {
  title: 'Sidepanel/ContextBar',
  component: ContextBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'One line of top chrome: what the live Okta tab is on, plus Refresh and Pin.\n\n' +
          "One line of chrome: a hue-coded connection *wire* along the panel's top edge, the live tab's entity name, and the two global context controls (Refresh, Pin). It sits outside the panel's scroller and is therefore always on screen, which is why it carries no wordmark, no id chip and no *Pinned* badge — see the module note for what each of those was cut for. The wire costs no layout height at rest and thickens into a labelled strip with a real Reconnect control when the connection is down. Notable states: resolving (`Loading`), a connection/context failure (`ErrorState`), pinned to the current entity (`Pinned`), and pinned-but-the-live-tab-moved (`PinnedLiveChanged`). Presentational — pin/refresh behaviour and the live-vs-pinned comparison are owned by the caller (App).\n\n" +
          '**Related internals:** [Hooks](?path=/docs/internals-hooks--docs), ' +
          '[Shared utilities](?path=/docs/internals-shared-utilities--docs)',
      },
    },
  },
  argTypes: {
    pageType: { description: 'Detected page type; drives the label fallback and dot colour.' },
    entityName: { description: 'Display name of the detected (or pinned) entity, if resolved.' },
    connectionStatus: { description: 'Connection state to the Okta tab.' },
    isLoading: { description: 'Whether page context is still resolving.' },
    error: { description: 'Connection/context error message, or `null` when healthy.' },
    isPinned: { description: 'Whether the panel is currently pinned to the entity.' },
    canPin: {
      description: 'Whether pinning is available right now (a group/user entity is present).',
    },
    liveContextChanged: {
      description: 'While pinned, `true` once the live Okta tab has navigated to another entity.',
    },
    liveEntityName: {
      description: 'Optional name of the live entity, shown in the switch hint when known.',
    },
    onTogglePin: { description: 'Toggle the pin on/off.' },
    onRefresh: {
      description:
        'Re-read whatever the panel is showing, and re-probe the live context. Never disabled while pinned.',
    },
    handoff: {
      description:
        "The live Okta tab's entity, offered to be opened in the panel. Rendered into the identity region in place of the plain name.",
    },
    onAcceptHandoff: { description: 'Open the offered entity in the panel.' },
    onDismissHandoff: { description: 'Decline the offer, for that entity only.' },
    refreshSubjectName: {
      description:
        "What Refresh will act on, in the reader's words. Reaches the control's tooltip and accessible name only — never visible text in the band.",
    },
    onReconnect: {
      description:
        'Reload the Okta tab to re-establish the content script, then re-detect. Shown only on error.',
    },
  },
  args: {
    pageType: 'group',
    entityName: 'Engineering Team',
    connectionStatus: 'connected',
    isLoading: false,
    error: null,
    isPinned: false,
    canPin: true,
    onTogglePin: fn(),
    onRefresh: fn(),
    onReconnect: fn(),
  },
} satisfies Meta<typeof ContextBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RefreshNamesItsSubject: Story = {
  args: {
    entityName: 'Engineering Team',
    refreshSubjectName: 'Payments Team',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const refresh = canvas.getByRole('button', { name: 'Refresh Payments Team' });
    await expect(refresh).toBeEnabled();
    await expect(refresh).toHaveAttribute('title', 'Refresh Payments Team');

    await expect(canvasElement).toHaveTextContent('Engineering Team');
    await expect(canvasElement).not.toHaveTextContent('Payments Team');
  },
};

export const RefreshUnclaimed: Story = {
  args: { refreshSubjectName: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  },
};

export const PinnedRefreshStaysEnabled: Story = {
  args: { isPinned: true, refreshSubjectName: 'Payments Team' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Refresh Payments Team' })).toBeEnabled();
  },
};

export const UserPage: Story = {
  args: {
    pageType: 'user',
    entityName: 'Jordan Rivera',
  },
};

export const Pinned: Story = {
  args: { isPinned: true },
};

export const PinnedLiveChanged: Story = {
  args: { isPinned: true, liveContextChanged: true, liveEntityName: 'Finance Team' },
};

export const PinnedDisconnected: Story = {
  args: {
    isPinned: true,
    connectionStatus: 'error',
    error: 'Can’t reach the Okta tab — reload it to reconnect.',
  },
};

export const NotPinnable: Story = {
  args: {
    pageType: 'admin',
    entityName: undefined,
    canPin: false,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    connectionStatus: 'connecting',
    entityName: undefined,
    canPin: false,
  },
};

export const ErrorState: Story = {
  args: {
    entityName: undefined,
    error: 'Can’t reach the Okta tab — reload it to reconnect.',
    canPin: false,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const reconnect = canvas.getByRole('button', { name: 'Reconnect' });
    reconnect.focus();
    await expect(reconnect).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onReconnect).toHaveBeenCalled();

    await expect(canvas.getByText('Not connected to the Okta tab')).toBeInTheDocument();
  },
};

export const ControlsDoNotMoveOnFailure: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /Pin/ })).toBeInTheDocument();
  },
};

export const ErrorWithNoTabToReconnect: Story = {
  args: {
    entityName: undefined,
    error: 'Can’t reach the Okta tab — reload it to reconnect.',
    canPin: false,
    onReconnect: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Not connected to the Okta tab')).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Reconnect' })).not.toBeInTheDocument();
  },
};

export const HandoffGroup: Story = {
  args: {
    handoff: { kind: 'group', id: '00gFAKE0001', name: 'Payments Team' },
    onAcceptHandoff: fn(),
    onDismissHandoff: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /Open Payments Team in Groups/ }));
    await expect(args.onAcceptHandoff).toHaveBeenCalled();

    await expect(canvas.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /Pin/ })).toBeInTheDocument();
  },
};

export const HandoffUser: Story = {
  args: {
    pageType: 'user',
    handoff: { kind: 'user', id: '00uFAKE0001', name: 'user@example.com' },
    onAcceptHandoff: fn(),
    onDismissHandoff: fn(),
  },
};

export const HandoffApp: Story = {
  args: {
    pageType: 'app',
    handoff: { kind: 'app', id: '0oaFAKE0001', name: 'Salesforce' },
    onAcceptHandoff: fn(),
    onDismissHandoff: fn(),
  },
};

export const HandoffDismissAndReturn: Story = {
  render: function HandoffLifecycle(args) {
    const [live, setLive] = useState({ id: '00gFAKE0001', name: 'Payments Team' });
    const [dismissedId, setDismissedId] = useState<string | null>(null);

    return (
      <div>
        <ContextBar
          {...args}
          entityName={live.name}
          handoff={live.id === dismissedId ? null : { kind: 'group', id: live.id, name: live.name }}
          onDismissHandoff={() => setDismissedId(live.id)}
        />
        <button
          type="button"
          onClick={() => setLive({ id: '00gFAKE0002', name: 'Finance Team' })}
          className="m-2 underline"
        >
          Move the live tab
        </button>
      </div>
    );
  },
  args: { onAcceptHandoff: fn(), onDismissHandoff: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('button', { name: /Open Payments Team in Groups/ }),
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss Payments Team' }));
    await expect(
      canvas.queryByRole('button', { name: /Open Payments Team in Groups/ }),
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Move the live tab' }));
    await expect(
      canvas.getByRole('button', { name: /Open Finance Team in Groups/ }),
    ).toBeInTheDocument();
  },
};

export const HandoffAbsentOnAdminPage: Story = {
  args: {
    pageType: 'admin',
    entityName: undefined,
    canPin: false,
    handoff: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Okta Admin')).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: /^Open / })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: /^Dismiss / })).not.toBeInTheDocument();
  },
};
