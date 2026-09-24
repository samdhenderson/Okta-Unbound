import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import Show from './Show';
import Assemble from './Assemble';
import { useTyped } from './useTyped';
import UserSearchBar from '../../sidepanel/components/users/UserSearchBar';
import { Badge, ListRow } from '../../sidepanel/components/shared';
import '../guide.css';

const PEOPLE = ['Amara Okonkwo', 'Priya Natarajan', 'Tomas Lindqvist'];

const ToyStage: React.FC<{ beat: number }> = ({ beat }) => {
  const query = useTyped('Ama', beat >= 1);
  return (
    <div className="flex flex-col gap-2">
      <UserSearchBar
        searchQuery={query}
        onSearchChange={() => {}}
        onClear={() => {}}
        isSearching={beat === 1 && query.length < 3}
        showClearButton={query.length > 0}
      />
      {beat >= 2 ? (
        <Assemble className="flex flex-col gap-1">
          {PEOPLE.map((name) => (
            <div
              key={name}
              className="overflow-hidden rounded-md border border-neutral-200 bg-white"
            >
              <ListRow density="compact">
                <span className="text-sm">{name}</span>
                <Badge variant="success">Active</Badge>
              </ListRow>
            </div>
          ))}
        </Assemble>
      ) : null}
    </div>
  );
};

const meta = {
  title: 'Guide/Show/Show',
  component: Show,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A show plays once, when its stage is half in view: each beat rests for `hold` tells, the last one holds forever. Under `data-motion="off"` or reduced motion it renders the last beat at once, so the still is also the fallback.',
      },
    },
  },
  args: {
    id: 'users',
    stageLabel: 'Users',
    minHeight: 200,
    beats: [
      { caption: 'An empty search.', hold: 1 },
      { caption: 'Type a name.', hold: 2 },
      { caption: 'Three people match.' },
    ],
    children: (beat: number) => <ToyStage beat={beat} />,
  },
  decorators: [
    (Story) => (
      <div className="bg-canvas px-10 py-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Show>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Still: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelector('[data-show-state]')).toHaveAttribute(
      'data-show-state',
      'done',
    );
    await expect(canvas.getByText('Three people match.')).toBeInTheDocument();
    await expect(canvas.getByDisplayValue('Ama')).toBeInTheDocument();
  },
};

export const Plays: Story = {
  parameters: { motion: 'on' },
  args: {
    beats: [
      { caption: 'An empty search.', hold: 4 },
      { caption: 'Type a name.', hold: 4 },
      { caption: 'Three people match.' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvasElement.querySelector('.guide-stage')?.scrollIntoView({ block: 'center' });
    await waitFor(
      () =>
        expect(canvasElement.querySelector('[data-show-state]')).toHaveAttribute(
          'data-show-state',
          'done',
        ),
      { timeout: 15000 },
    );
    await expect(canvas.getByText('Three people match.')).toBeInTheDocument();
  },
};

export const NoFrame: Story = {
  args: {
    stageLabel: undefined,
    minHeight: undefined,
    beats: [{ caption: 'Three people match.' }],
    children: () => (
      <Assemble as="ul" className="flex flex-wrap gap-2">
        {PEOPLE.map((name) => (
          <li
            key={name}
            className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
          >
            {name}
          </li>
        ))}
      </Assemble>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelector('.guide-stage')).toBeNull();
    await expect(canvas.getByRole('list')).toBeInTheDocument();
    await expect(canvas.getByText('Three people match.')).toBeInTheDocument();
  },
};
