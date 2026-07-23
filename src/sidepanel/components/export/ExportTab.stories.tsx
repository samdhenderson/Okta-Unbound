import type { Meta, StoryObj } from '@storybook/react-vite';
import ExportTab from './ExportTab';

const meta = {
  title: 'Export/ExportTab',
  component: ExportTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Descriptor-driven Export tab. Consumes the Export Engine via `useOktaApi` ' +
          'and orchestrates the flow through `useExportTab`.\n\n' +
          '**Related internals:** [Hooks](?path=/docs/internals-hooks--docs), ' +
          '[Scheduler & messaging](?path=/docs/internals-scheduler-messaging--docs), ' +
          '[Shared utilities](?path=/docs/internals-shared-utilities--docs)',
      },
    },
  },
  argTypes: {
    targetTabId: {
      description:
        'Chrome tab id of the connected Okta tab; export/preview are disabled when absent.',
    },
    oktaOrigin: { description: 'Okta org origin used to build per-row deep links in the preview.' },
  },
  args: {
    targetTabId: 42,
    oktaOrigin: 'https://example.okta.com',
  },
} satisfies Meta<typeof ExportTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disconnected: Story = {
  args: { targetTabId: undefined },
};
