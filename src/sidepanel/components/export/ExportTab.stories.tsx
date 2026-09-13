import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import ExportTab from './ExportTab';
import { OrgEntityIndexProvider } from '../../contexts/OrgEntityIndexContext';

const meta = {
  title: 'Export/ExportTab',
  component: ExportTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Descriptor-driven Export tab, orchestrated by `useExportTab`. The `pick` phase ' +
          'lists exportable entities; choosing one enters `configure` — context picker, ' +
          'filter box, column picker, presets, preview and download.',
      },
    },
  },
  decorators: [
    (Story) => (
      <OrgEntityIndexProvider oktaOrigin={null} targetTabId={null} enabled={false}>
        <Story />
      </OrgEntityIndexProvider>
    ),
  ],
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

export const PickingAnEntity: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /^App Groups/ }));

    const back = await canvas.findByRole('button', { name: 'All exports' });
    await expect(canvas.getByRole('heading', { level: 2, name: 'App Groups' })).toBeVisible();

    await userEvent.click(back);
    await expect(canvas.queryByRole('button', { name: 'All exports' })).toBeNull();
  },
};

export const Disconnected: Story = {
  args: { targetTabId: undefined },
};
