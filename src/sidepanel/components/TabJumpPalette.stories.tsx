import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import TabJumpPalette from './TabJumpPalette';
import type { JumpResult } from '../hooks/useJumpResolver';

const meta = {
  title: 'Sidepanel/TabJumpPalette',
  component: TabJumpPalette,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "⌘K jump-to palette for the side panel's nine top-level sections, and the " +
          'keyboard route to the same destinations the icon rail offers. Sections filter synchronously ' +
          'on a case-insensitive substring of the label; org entities — groups, apps, rules, ' +
          'policies, users — are handed in by the `CommandPalette` container on their own ' +
          'debounced schedule, so a section jump never waits on an org search.\n\n' +
          'Navigation is roving focus, not a combobox: Down leaves the field for the first ' +
          'result, Up/Down move within one flat row list (Up off the top returns to the ' +
          'field), Enter or Space activates, Escape closes. Every entity prop is optional — ' +
          'omit them and this is the sections-only palette, which is why these stories mock ' +
          'nothing.',
      },
    },
  },
  argTypes: {
    isOpen: { description: 'When false the palette closes and leaves the accessible tree.' },
    onClose: { description: 'Invoked on Escape, overlay click, close button, and after a pick.' },
    activeTab: { description: 'The section on screen — marked `aria-current="page"`.' },
    onSelect: { description: "Called with the chosen section id — the icon rail's own handler." },
  },
  args: {
    isOpen: true,
    onClose: fn(),
    activeTab: 'home',
    onSelect: fn(),
  },
} satisfies Meta<typeof TabJumpPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

const ENTITY_RESULTS: JumpResult[] = [
  { kind: 'group', id: '00gFAKE0000000000001', name: 'Engineering', secondary: 'All engineers' },
  { kind: 'app', id: '0oaFAKE0000000000001', name: 'Salesforce' },
  { kind: 'rule', id: '0prFAKE0000000000001', name: 'Feeds Engineering', secondary: 'Active' },
  { kind: 'user', id: '00uFAKE0000000000001', name: 'Ada Lovelace', secondary: 'ada@example.com' },
];

export const Default: Story = {};

export const ActiveSectionMarked: Story = {
  args: { activeTab: 'policies' },
};

export const Filtered: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = await canvas.findByRole('searchbox', { name: 'Search sections' });
    await userEvent.type(field, 'or');

    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('3 sections'));
    await expect(canvas.getByRole('button', { name: /Export/ })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /Explorer/ })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /History/ })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: /Groups/ })).not.toBeInTheDocument();
  },
};

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = await canvas.findByRole('searchbox', { name: 'Search sections' });
    await userEvent.type(field, 'zzz');
    await canvas.findByText('No sections match');
  },
};

export const WithEntityResults: Story = {
  args: {
    onEntityQueryChange: fn(),
    entityMode: 'results',
    entityResults: ENTITY_RESULTS,
    canReach: () => true,
    sectionMeta: {
      group: { fromSnapshot: false, complete: true },
      app: { fromSnapshot: true, complete: true },
      rule: { fromSnapshot: true, complete: true },
      user: { fromSnapshot: false, complete: true },
    },
    onEntitySelect: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: /^Home/ })).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Engineering — open in Groups' }),
    ).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Salesforce — open in Apps' })).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Ada Lovelace — open in Users' }),
    ).toBeVisible();

    const heading = (name: string) =>
      canvas
        .getAllByRole('listitem')
        .find((li) => !li.querySelector('a, button') && li.textContent?.startsWith(name));

    await expect(heading('Apps')).toHaveTextContent('from snapshot');
    await expect(heading('Rules')).toHaveTextContent('from snapshot');
    await expect(heading('Users')).toHaveTextContent('live');
  },
};

export const EntitySearching: Story = {
  args: {
    onEntityQueryChange: fn(),
    entityMode: 'searching',
    entityResults: ENTITY_RESULTS,
    canReach: () => true,
    onEntitySelect: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Engineering — open in Groups' }),
    ).toBeVisible();
  },
};

export const EntityError: Story = {
  args: {
    onEntityQueryChange: fn(),
    entityMode: 'error',
    entityResults: [],
    entityError: 'Search failed. Check the connection to Okta and try again.',
    canReach: () => true,
    onEntitySelect: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('alert')).toHaveTextContent('Search failed');
  },
};

export const PartialSnapshot: Story = {
  args: {
    onEntityQueryChange: fn(),
    entityMode: 'results',
    entityResults: [ENTITY_RESULTS[1]],
    canReach: () => true,
    sectionMeta: { app: { fromSnapshot: true, complete: false } },
    onEntitySelect: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/partial snapshot/)).toBeVisible();
  },
};

export const BelowMinChars: Story = {
  args: {
    onEntityQueryChange: fn(),
    entityMode: 'idle',
    entityResults: [],
    canReach: () => true,
    onEntitySelect: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = await canvas.findByRole('searchbox', { name: 'Search sections' });
    await userEvent.type(field, 'ex');

    await expect(canvas.getByRole('button', { name: /^Export/ })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /^Explorer/ })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: /^Home/ })).not.toBeInTheDocument();
    await expect(canvas.getByText('Type 3 characters to search the org.')).toBeVisible();
  },
};

export const UnreachableKind: Story = {
  args: {
    onEntityQueryChange: fn(),
    entityMode: 'results',
    entityResults: ENTITY_RESULTS,
    canReach: () => false,
    oktaOrigin: 'https://example.okta.com',
    onEntitySelect: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const link = canvas.getByRole('link', { name: 'Engineering — open in Okta' });
    await expect(link).toHaveAttribute(
      'href',
      'https://example.okta.com/admin/group/00gFAKE0000000000001',
    );
    await expect(link.querySelector('a, button')).toBeNull();

    await expect(canvas.queryByRole('link', { name: /Feeds Engineering/ })).toBeNull();
  },
};

export const KeyboardNavigation: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const field = await canvas.findByRole('searchbox', { name: 'Search sections' });
    await userEvent.click(field);

    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(field).not.toHaveFocus());

    await userEvent.keyboard('{Enter}');
    await expect(args.onSelect).toHaveBeenCalledTimes(1);
    await expect(args.onClose).toHaveBeenCalled();
  },
};

export const Closed: Story = {
  args: { isOpen: false },
};

export const MotionShowcase: Story = {
  parameters: { motion: 'on' },
  globals: { viewport: { value: 'sidepanelDefault' } },
};
