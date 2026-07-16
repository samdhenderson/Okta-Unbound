import type { Meta, StoryObj } from '@storybook/react-vite';
import AuditLogViewer from './AuditLogViewer';

const meta = {
  title: 'Components/AuditLogViewer',
  component: AuditLogViewer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Read-only audit trail of actions performed through the extension.\n\n' +
          '**Related internals:** [Storage & cache](?path=/docs/internals-storage-cache--docs)',
      },
    },
  },
} satisfies Meta<typeof AuditLogViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
