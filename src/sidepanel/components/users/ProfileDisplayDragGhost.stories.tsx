import type { Meta, StoryObj } from '@storybook/react-vite';
import ProfileDisplayDragGhost from './ProfileDisplayDragGhost';

const meta = {
  title: 'Users/ProfileDisplayDragGhost',
  component: ProfileDisplayDragGhost,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A translucent follower carrying the dragged attribute or section name. It stays ' +
          'partly transparent so the drop indicator underneath — the thing that answers ' +
          '"where will this land" — is never hidden, and it is `aria-hidden` because the ' +
          "editor's live region already says the same thing in words.",
      },
    },
  },
  argTypes: {
    label: { description: 'What is being dragged — an attribute label or a category name.' },
    x: { description: 'Client X of the pointer.' },
    y: { description: 'Client Y of the pointer.' },
    reducedMotion: { description: 'Drop the follow transition when reduced motion is asked for.' },
  },
  args: { label: 'Department', x: 80, y: 80 },
} satisfies Meta<typeof ProfileDisplayDragGhost>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SectionGhost: Story = { args: { label: 'Contact & locale' } };

export const ReducedMotion: Story = { args: { reducedMotion: true } };
