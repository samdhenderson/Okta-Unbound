import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import ProfileDisplayOptions from './ProfileDisplayOptions';
import { fixtureAttributes, fixtureConfig } from './profileDisplayStoryFixture';

const meta = {
  title: 'Users/ProfileDisplayOptions',
  component: ProfileDisplayOptions,
  tags: ['autodocs'],
  parameters: {
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
    docs: {
      description: {
        component:
          "The four display options at the top of the Profile pane's customize mode: the " +
          'layout, and the three marks the attribute list can carry. Every control is driven by ' +
          'the caller\'s draft config — this component holds no state. The "show attributes with ' +
          'no value" checkbox states the exact count it governs, so the option is never a guess ' +
          'about a profile the admin cannot see.',
      },
    },
  },
  argTypes: {
    attributes: { description: 'Every attribute on the profile — the source of the empty count.' },
    config: { description: 'The draft configuration being edited.' },
    onLayoutChange: { description: "Set the attribute list's layout." },
    onShowApiNamesChange: { description: 'Show the raw Okta key beside each label.' },
    onShowRuleChipsChange: { description: 'Mark each attribute a group rule reads.' },
    onShowEmptyChange: { description: 'Render attributes that are empty on this user.' },
  },
  args: {
    attributes: fixtureAttributes,
    config: fixtureConfig,
    onLayoutChange: fn(),
    onShowApiNamesChange: fn(),
    onShowRuleChipsChange: fn(),
    onShowEmptyChange: fn(),
  },
} satisfies Meta<typeof ProfileDisplayOptions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CompactWithApiNames: Story = {
  args: { config: { ...fixtureConfig, layout: 'compact', showApiNames: true } },
};

export const Interactive: Story = {
  render: function InteractiveOptions(args) {
    const [config, setConfig] = useState(args.config);
    return (
      <ProfileDisplayOptions
        {...args}
        config={config}
        onLayoutChange={(layout) => setConfig((previous) => ({ ...previous, layout }))}
        onShowApiNamesChange={(showApiNames) =>
          setConfig((previous) => ({ ...previous, showApiNames }))
        }
        onShowRuleChipsChange={(showRuleChips) =>
          setConfig((previous) => ({ ...previous, showRuleChips }))
        }
        onShowEmptyChange={(showEmpty) => setConfig((previous) => ({ ...previous, showEmpty }))}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const compact = canvas.getByRole('button', { name: 'Compact rows' });
    await userEvent.click(compact);
    await expect(compact).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByRole('button', { name: 'Label + value rows' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    const apiNames = canvas.getByRole('checkbox', { name: /Show Okta attribute names/ });
    await userEvent.click(apiNames);
    await expect(apiNames).toBeChecked();
  },
};

export const NothingEmpty: Story = {
  args: {
    attributes: fixtureAttributes.filter((attribute) => !attribute.isEmpty),
    config: { ...fixtureConfig, showEmpty: false },
  },
};
