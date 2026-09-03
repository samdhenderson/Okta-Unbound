import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import GroupPushSection from './GroupPushSection';
import { NavigationProvider } from '../../../contexts/NavigationContext';
import type { PushGroupMapping } from '../../../../shared/types';

const navigationHandlers = { rule: fn(), group: fn(), user: fn(), app: fn(), policy: fn() };

const namedMapping: PushGroupMapping = {
  mappingId: '0pgFAKE1',
  sourceUserGroupId: '00gFAKEGROUP0001',
  appId: '0oaFAKEAPP000001',
  appName: 'Salesforce',
  targetGroupName: 'eng-team',
  priority: 2,
};

const unnamedMapping: PushGroupMapping = {
  mappingId: '0pgFAKE2',
  sourceUserGroupId: '00gFAKEGROUP0001',
  appId: '0oaFAKEAPP000002',
  targetGroupName: 'eng-team-mirror',
};

const meta = {
  title: 'Groups/GroupPushSection',
  component: GroupPushSection,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Apps this group's membership is pushed out to, and the target group each push writes into.\n\n" +
          '**No activation status, deliberately.** `GET /api/v1/apps/{appId}/groups` returns none, so an ACTIVE/INACTIVE pill here would be an inference dressed up as an Okta fact. `priority` is the real returned field and is labelled as a priority, never as a state.\n\n' +
          '**Unknown is not zero.** "Not pushed anywhere" (an empty array — a loaded fact) and "push mappings were never loaded" (`undefined` — the enrichment is non-fatal and can be skipped) are two different sentences; see `Empty` versus `NotLoaded`.\n\n' +
          "**A push target is named, or its name is stated as missing.** A mapping's `appName` is optional, and this section used to fall back to printing the raw `appId` in the name's own slot — an opaque `0oa…` that read as though it *were* the app's name. A named app is now a shared `EntityLink` (opens the app, copies its id); an un-named one says \"App name not loaded\" beside the raw id in the identifier register.\n\n" +
          '**Related internals:** [EntityLink](?path=/docs/shared-entitylink--docs)',
      },
    },
  },
  decorators: [
    (Story) => (
      <NavigationProvider handlers={navigationHandlers}>
        <div className="max-w-[380px]">
          <Story />
        </div>
      </NavigationProvider>
    ),
  ],
  argTypes: {
    mappings: {
      description:
        "The group's push mappings. `undefined` means the enrichment did not run for this group and is rendered as unknown, not as “none”.",
    },
  },
  args: {
    mappings: [namedMapping],
  },
} satisfies Meta<typeof GroupPushSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Open app Salesforce' })).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: `Copy application id ${namedMapping.appId}` }),
    ).toBeInTheDocument();
  },
};

export const UnnamedApp: Story = {
  args: { mappings: [unnamedMapping] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('App name not loaded')).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: `Copy application id ${unnamedMapping.appId}` }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', {
        name: `App name not loaded — open app ${unnamedMapping.appId}`,
      }),
    ).toBeInTheDocument();
  },
};

export const NamedAndUnnamed: Story = {
  args: { mappings: [namedMapping, unnamedMapping] },
};

export const Empty: Story = {
  args: { mappings: [] },
};

export const NotLoaded: Story = {
  args: { mappings: undefined },
};
