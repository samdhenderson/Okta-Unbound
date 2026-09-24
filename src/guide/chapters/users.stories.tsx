import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import UsersChapter from './users';
import { CHAPTER_PARAMETERS, awaitShow, readerCanvas, withGuideShell } from './chapterStory';

const meta = {
  title: 'Guide/Chapters/users',
  component: UsersChapter,
  decorators: [withGuideShell('users')],
  parameters: CHAPTER_PARAMETERS,
} satisfies Meta<typeof UsersChapter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Show: Story = {
  parameters: { ...CHAPTER_PARAMETERS, motion: 'on' },
  play: async ({ canvasElement }) => {
    await awaitShow(canvasElement);
    const show = canvasElement.querySelector<HTMLElement>('[data-show-state]');
    await expect(show).not.toBeNull();
    if (!show) return;
    const stage = within(show);
    await expect(stage.getByTestId('guide-caption')).toHaveTextContent(
      'Two rules could have put her in VPN Access. The panel names both rather than picking one.',
    );
    await expect(stage.queryByRole('textbox')).not.toBeInTheDocument();
    const vpn = stage.getByRole('button', { name: /VPN Access/ });
    await expect(vpn).toHaveAttribute('aria-expanded', 'true');
    await expect(stage.getByRole('button', { name: /Engineering Staff/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await expect(stage.getByText('Engineers get VPN')).toBeInTheDocument();
    await expect(stage.getByText('Seattle gets VPN')).toBeInTheDocument();
  },
};

export const SearchNarrowed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const field = await canvas.findByRole('textbox');
    await expect(canvas.getByText('Amara Okonkwo')).toBeInTheDocument();
    await expect(canvas.getByText('Viktor Yamamoto')).toBeInTheDocument();

    await userEvent.clear(field);
    await userEvent.type(field, 'okonkwo');

    await expect(canvas.queryByText('Viktor Yamamoto')).not.toBeInTheDocument();
    await expect(canvas.getByText('Jolene Okonkwo')).toBeInTheDocument();
  },
};

export const SearchCleared: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }));
    await expect(canvas.queryByText('Amara Okonkwo')).not.toBeInTheDocument();
    await expect(canvas.getByText('User Membership Tracing')).toBeInTheDocument();
  },
};

export const RowOpened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const row = await canvas.findByRole('button', { name: /VPN Access/ });
    await userEvent.click(row);
    await expect(row).toHaveAttribute('aria-expanded', 'true');
  },
};

async function draftSales(canvas: ReturnType<typeof readerCanvas>): Promise<void> {
  await userEvent.click(canvas.getByRole('button', { name: 'Edit' }));
  const field = canvas.getByLabelText('Department');
  await userEvent.clear(field);
  await userEvent.type(field, 'Sales');
}

export const ForwardScenes: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    await expect(canvas.getByText('Qualifies')).toBeInTheDocument();
    await expect(canvas.getByText('Does not match')).toBeInTheDocument();
    await expect(
      canvas.getByRole('heading', { level: 3, name: 'Check Rules' }),
    ).toBeInTheDocument();
    await expect(canvas.getAllByRole('heading', { level: 4, name: /^Against rule:/ })).toHaveLength(
      2,
    );
    await expect(canvas.getByText('5 of 5 attributes shown', { exact: false })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Reset password' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Suspend user' })).toBeInTheDocument();
  },
};

export const SaveConfirmOpened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    await draftSales(canvas);
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    const dialog = await canvas.findByRole('dialog', { name: 'Save profile changes?' });
    await expect(dialog).toBeInTheDocument();
    await expect(
      within(dialog).getByText(/1 attribute on Amara Okonkwo will be overwritten/),
    ).toBeInTheDocument();
    await expect(within(dialog).getByText('Sales')).toBeInTheDocument();
    await expect(
      within(dialog).getByRole('button', { name: 'Analyze blast radius' }),
    ).toBeInTheDocument();
  },
};

export const PasswordModePicked: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Reset password' }));
    const dialog = await canvas.findByRole('dialog', { name: 'Reset Password' });
    await userEvent.selectOptions(
      within(dialog).getByRole('combobox', { name: 'What should happen' }),
      'set-and-expire',
    );
    await expect(within(dialog).getByLabelText('New password')).toBeInTheDocument();
    await expect(
      within(dialog).getByText(/makes them replace it at next sign-in/),
    ).toBeInTheDocument();
    await expect(
      within(dialog).getByRole('button', { name: 'Set One-Time Password' }),
    ).toBeInTheDocument();
  },
};

export const LinkedHover: Story = {
  parameters: { ...CHAPTER_PARAMETERS, motion: 'on' },
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);

    const firstRow = canvas.getByText(/every clause holds against her profile/).closest('span')!;
    await userEvent.hover(firstRow);
    const firstCard = canvas.getByText('Qualifies').closest('[data-hot]')!;
    await expect(firstCard).toHaveAttribute('data-hot', 'true');
    await userEvent.unhover(firstRow);
    await expect(firstCard).toHaveAttribute('data-hot', 'false');

    await userEvent.hover(firstCard);
    await expect(firstRow).toHaveAttribute('data-hot', 'true');
    await userEvent.unhover(firstCard);

    const [clear] = canvas.getAllByRole('button', { name: 'Clear' });
    await userEvent.click(clear);
    await expect(canvas.getByRole('button', { name: 'Check again' })).toBeInTheDocument();
    await expect(canvas.getByText('Qualifies').closest('.disclose')).toHaveAttribute(
      'data-open',
      'false',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Check again' }));
    await expect(canvas.getByText('Qualifies').closest('.disclose')).toHaveAttribute(
      'data-open',
      'true',
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Edit' }));
    await expect(canvas.getByText('No changes yet')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Save' })).toBeDisabled();
    const field = canvas.getByLabelText('Department');
    await userEvent.clear(field);
    await userEvent.type(field, 'Sales');
    await expect(canvas.getByText('1 change')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Save' })).toBeEnabled();

    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(canvas.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    await expect(canvas.queryByText('1 change')).not.toBeInTheDocument();
  },
};

export const SaveConfirmed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    await draftSales(canvas);
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    const dialog = await canvas.findByRole('dialog', { name: 'Save profile changes?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    await expect(canvas.getByText('Sales')).toBeInTheDocument();
    await expect(canvas.getByTestId('guide-save-flash')).toBeInTheDocument();
  },
};
