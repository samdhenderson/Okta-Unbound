import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import SaveCollectionModal from './SaveCollectionModal';
import type { SaveOutcome } from '../../selection/collectionStore';

const accepted: SaveOutcome = {
  collections: [],
  saved: { id: 'local-0001', name: 'Marketing rename', rows: [], savedAt: 0 },
  refused: null,
};

const meta = {
  title: 'Selection/SaveCollectionModal',
  component: SaveCollectionModal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A collection differs from the basket in one word — **deliberately** — and this is where ' +
          'that deliberation happens: a name is typed, a partition is chosen, and one storage ' +
          'decision is made.\n\n' +
          '**A kind with nothing ticked is absent, not zero.** It gets no pill and appears in no ' +
          'sentence. When exactly one kind is non-empty, `Everything` and that kind name the same ' +
          'set, so only `Everything` is offered.\n\n' +
          '**Remember display names is absent, never disabled,** whenever the chosen scope holds no ' +
          'users — there is no question to put. When it is on screen both answers state a fact: ' +
          'names go to this device unencrypted, or a reopen costs exactly one request per user. ' +
          'Neither answer estimates a duration, because this dialog does not know one.\n\n' +
          '**A refusal is rendered from the store’s reason code**, never by reading a message string, ' +
          'and the dialog stays open with the draft intact.\n\n' +
          'Related internals: `sidepanel/selection/collectionStore`, `shared/utils/plural`.',
      },
    },
  },
  args: {
    isOpen: true,
    onClose: fn(),
    counts: { user: 12, group: 3 },
    existingNames: ['Q3 offboarding'],
    onSave: fn(async () => accepted),
  },
  argTypes: {
    isOpen: { description: 'Whether the dialog is open.' },
    onClose: { description: 'Close without saving (Cancel, Escape, overlay, header close).' },
    counts: {
      description: 'Per-kind basket counts. Kinds with nothing ticked are absent, not zero.',
    },
    existingNames: { description: 'Names already used in this org, for the duplicate check.' },
    onSave: {
      description: 'Commit. Resolves to the store’s outcome so a refusal can be reported in place.',
    },
  },
} satisfies Meta<typeof SaveCollectionModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MixedKinds: Story = {
  play: async ({ canvasElement }) => {
    const dialog = within(within(canvasElement.ownerDocument.body).getByRole('dialog'));
    await expect(dialog.getByRole('button', { name: 'Everything (15)' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(dialog.getByRole('button', { name: 'Users (12)' })).toBeInTheDocument();
    await expect(dialog.getByRole('button', { name: 'Groups (3)' })).toBeInTheDocument();
    await expect(dialog.getByText('Saves 12 users and 3 groups.')).toBeInTheDocument();
  },
};

export const NarrowedToGroups: Story = {
  play: async ({ canvasElement }) => {
    const dialog = within(within(canvasElement.ownerDocument.body).getByRole('dialog'));
    await userEvent.click(dialog.getByRole('button', { name: 'Groups (3)' }));
    await expect(dialog.getByText('Saves 3 groups.')).toBeInTheDocument();
    await expect(
      dialog.queryByRole('checkbox', { name: /Remember display names/ }),
    ).not.toBeInTheDocument();
  },
};

export const UsersOnly: Story = {
  args: { counts: { user: 12 } },
  play: async ({ canvasElement }) => {
    const dialog = within(within(canvasElement.ownerDocument.body).getByRole('dialog'));
    await expect(dialog.getByRole('button', { name: 'Everything (12)' })).toBeInTheDocument();
    await expect(dialog.queryByRole('button', { name: 'Users (12)' })).not.toBeInTheDocument();
    await expect(dialog.getByText('Saves 12 users.')).toBeInTheDocument();
  },
};

export const NoUsersInScope: Story = {
  args: { counts: { group: 3, policy: 2 } },
  play: async ({ canvasElement }) => {
    const dialog = within(within(canvasElement.ownerDocument.body).getByRole('dialog'));
    await expect(
      dialog.queryByRole('checkbox', { name: /Remember display names/ }),
    ).not.toBeInTheDocument();
    await expect(dialog.getByText('Saves 3 groups and 2 policies.')).toBeInTheDocument();
  },
};

export const NamesNotRemembered: Story = {
  play: async ({ canvasElement }) => {
    const dialog = within(within(canvasElement.ownerDocument.body).getByRole('dialog'));
    const box = dialog.getByRole('checkbox', { name: /Remember display names/ });
    await expect(box).toBeChecked();
    await expect(
      dialog.getByText('Names are stored unencrypted on this device.'),
    ).toBeInTheDocument();

    await userEvent.click(box);
    await expect(
      dialog.getByText('Reopening will look up 12 users — one request each.'),
    ).toBeInTheDocument();
  },
};

export const DuplicateName: Story = {
  play: async ({ canvasElement }) => {
    const dialog = within(within(canvasElement.ownerDocument.body).getByRole('dialog'));
    await userEvent.type(dialog.getByLabelText('Name'), '  q3 OFFBOARDING  ');
    await expect(
      dialog.getByText('This org already has a collection called “Q3 offboarding”.'),
    ).toBeInTheDocument();
    await expect(dialog.getByRole('button', { name: 'Save' })).toBeDisabled();
  },
};

export const NameTooLong: Story = {
  play: async ({ canvasElement }) => {
    const dialog = within(within(canvasElement.ownerDocument.body).getByRole('dialog'));
    await userEvent.type(dialog.getByLabelText('Name'), 'x'.repeat(81));
    await expect(dialog.getByText('A name may be 80 characters; this is 81.')).toBeInTheDocument();
    await expect(dialog.getByRole('button', { name: 'Save' })).toBeDisabled();
  },
};

export const BlankName: Story = {
  play: async ({ canvasElement }) => {
    const dialog = within(within(canvasElement.ownerDocument.body).getByRole('dialog'));
    await expect(dialog.getByRole('button', { name: 'Save' })).toBeDisabled();
    await expect(
      dialog.getByText('Unique within this org, up to 80 characters.'),
    ).toBeInTheDocument();
  },
};

export const RefusedByStore: Story = {
  args: {
    onSave: fn(async () => ({ collections: [], saved: null, refused: 'too-many' }) as SaveOutcome),
  },
  play: async ({ canvasElement, args }) => {
    const dialog = within(within(canvasElement.ownerDocument.body).getByRole('dialog'));
    await userEvent.type(dialog.getByLabelText('Name'), 'Marketing rename');
    await userEvent.click(dialog.getByRole('button', { name: 'Save' }));

    await waitFor(async () => {
      await expect(
        dialog.getByText(
          'This org already holds 20 collections, which is the limit. Delete one, then save again.',
        ),
      ).toBeInTheDocument();
    });
    await expect(args.onClose).not.toHaveBeenCalled();
  },
};

export const SavesTheChosenScope: Story = {
  play: async ({ canvasElement, args }) => {
    const dialog = within(within(canvasElement.ownerDocument.body).getByRole('dialog'));
    await userEvent.type(dialog.getByLabelText('Name'), '  Marketing rename  ');
    await userEvent.click(dialog.getByRole('button', { name: 'Users (12)' }));
    await userEvent.click(dialog.getByRole('checkbox', { name: /Remember display names/ }));
    await userEvent.click(dialog.getByRole('button', { name: 'Save' }));

    await waitFor(async () => {
      await expect(args.onSave).toHaveBeenCalledWith('Marketing rename', 'user', false);
    });
    await expect(args.onClose).toHaveBeenCalled();
  },
};

export const EnterCommits: Story = {
  play: async ({ canvasElement, args }) => {
    const dialog = within(within(canvasElement.ownerDocument.body).getByRole('dialog'));
    await userEvent.type(dialog.getByLabelText('Name'), 'Marketing rename{Enter}');
    await waitFor(async () => {
      await expect(args.onSave).toHaveBeenCalledWith('Marketing rename', 'all', true);
    });
  },
};
